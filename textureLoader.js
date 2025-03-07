/**
 * Texture Loader
 * Main entry point for texture loading and block creation
 * This file now serves as a facade for the modular architecture
 */

import * as THREE from 'three';
import { createBlock } from './blockFactory.js';
import { loadTexture, clearTextureCache } from './textureManager.js';
import { BLOCK_PROPERTIES } from './blockData.js';
import { isSlabBlock } from './slabFactory.js';

// Add a debug flag to control logging
const DEBUG_LOGGING = false;

export class TextureLoader {
    constructor() {
        this.blockCache = new Map();
    }
    
    /**
     * Get the block properties
     * @returns {Object} - Block properties
     */
    getBlockProperties() {
        return BLOCK_PROPERTIES;
    }
    
    /**
     * Load a block mesh
     * @param {string} blockType - The type of block
     * @param {Object} options - Additional options for block creation
     * @returns {Promise<THREE.Mesh>} - Promise that resolves to the block mesh
     */
    async loadBlock(blockType, options = {}) {
        // Special case for cobwebs and other cross-pattern blocks
        if (blockType === 'cobweb' || blockType === 'web' || 
            BLOCK_PROPERTIES[blockType]?.category === 'cross') {
            const texture = await loadTexture(options.texture || '/textures/blocks/web.png');
            
            // Create crossed planes geometry
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                // First plane
                -0.5,  0.5,  0.5,  // top right
                -0.5, -0.5,  0.5,  // bottom right
                 0.5,  0.5, -0.5,  // top left
                 0.5, -0.5, -0.5,  // bottom left
                // Second plane
                 0.5,  0.5,  0.5,  // top right
                 0.5, -0.5,  0.5,  // bottom right
                -0.5,  0.5, -0.5,  // top left
                -0.5, -0.5, -0.5   // bottom left
            ]);
            
            const uvs = new Float32Array([
                // First plane
                1, 1,
                1, 0,
                0, 1,
                0, 0,
                // Second plane
                1, 1,
                1, 0,
                0, 1,
                0, 0
            ]);
            
            const indices = new Uint16Array([
                0, 1, 2,  2, 1, 3,  // First plane
                4, 5, 6,  6, 5, 7   // Second plane
            ]);
            
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                opacity: options.opacity || 0.8,
                alphaTest: options.alphaTest || 0.8,
                side: THREE.DoubleSide
            });
            
            return new THREE.Mesh(geometry, material);
        }
        
        // Handle buttons
        if (blockType.includes('button')) {
            console.log(`🔘 Loading button: ${blockType}`);
            
            // For now, hardcode to use spruce planks texture
            const texture = await loadTexture('textures/blocks/planks_spruce.png');
            
            // Create tiny button geometry (1/8 block thick, 1/4 block wide)
            const geometry = new THREE.BoxGeometry(0.25, 0.25, 0.125);
            
            // Move the geometry to the north face
            geometry.translate(0, 0, -0.4375); // Move to north face (0.5 - half button thickness)
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 1.0,
                metalness: 0.0
            });
            
            const button = new THREE.Mesh(geometry, material);
            button.name = blockType;
            
            // Enable shadows
            button.castShadow = true;
            button.receiveShadow = true;
            
            return button;
        }
        
        // For slabs, we need to consider the isUpperSlab property
        if (isSlabBlock(blockType)) {
            console.log(`🧊 Loading slab block: ${blockType}`);
            const isUpperSlab = options.isUpperSlab || false;
            console.log(`📏 Slab position: ${isUpperSlab ? 'UPPER' : 'LOWER'}`);
            const cacheKey = `${blockType}_slab_${isUpperSlab ? 'upper' : 'lower'}`;
            
            // Check if this specific slab configuration is in cache
            if (this.blockCache.has(cacheKey)) {
                console.log(`💫 Using cached slab: ${cacheKey}`);
                return Promise.resolve(this.blockCache.get(cacheKey).clone());
            }
            
            try {
                // Create the slab with the appropriate configuration
                console.log(`🏗️ Creating new slab: ${blockType}, isUpper: ${isUpperSlab}`);
                const block = await createBlock(blockType, { isUpperSlab });
                
                // Cache the slab with its specific configuration
                console.log(`💾 Caching slab: ${cacheKey}`);
                this.blockCache.set(cacheKey, block);
                
                // Return a clone of the block
                return block.clone();
            } catch (error) {
                console.error(`❌ Error loading slab ${blockType}:`, error);
                throw error;
            }
        }
        
        // For trapdoors, we need to consider the state (open/closed, facing, half) and material
        if (blockType.includes('_trapdoor') || blockType === 'trapdoor') {
            const trapdoorState = options.trapdoorState || { open: false, half: 'bottom', facing: 'north' };
            const material = options.material || null;
            
            // Create a unique cache key that includes material
            const materialKey = material ? `_material_${material}` : '';
            const cacheKey = `${blockType}_${trapdoorState.open ? 'open' : 'closed'}_${trapdoorState.half}_${trapdoorState.facing}${materialKey}`;
            
            // Check if this specific trapdoor configuration is in cache
            if (this.blockCache.has(cacheKey)) {
                if (DEBUG_LOGGING) console.log(`Using cached trapdoor for ${cacheKey}`);
                return Promise.resolve(this.blockCache.get(cacheKey).clone());
            }
            
            try {
                // Create the trapdoor with the appropriate configuration
                if (DEBUG_LOGGING) console.log(`Creating new trapdoor for ${cacheKey}`);
                const block = await createBlock(blockType, { trapdoorState, material });
                
                // Cache the trapdoor with its specific configuration
                this.blockCache.set(cacheKey, block);
                
                // Return a clone of the block
                return block.clone();
            } catch (error) {
                console.error(`Error loading trapdoor ${blockType}:`, error);
                throw error;
            }
        }
        
        // For lanterns, we need to consider if they're hanging
        if (blockType.includes('lantern')) {
            const hanging = options.hanging || false;
            const cacheKey = `${blockType}_${hanging ? 'hanging' : 'standing'}`;
            
            // Check if this specific lantern configuration is in cache
            if (this.blockCache.has(cacheKey)) {
                const originalLantern = this.blockCache.get(cacheKey);
                const clonedLantern = originalLantern.clone();
                
                // Ensure lights are properly cloned
                originalLantern.traverse((originalChild) => {
                    if (originalChild.isLight) {
                        const lightIndex = originalChild.parent.children.indexOf(originalChild);
                        if (lightIndex !== -1) {
                            // Find the corresponding parent in the clone
                            clonedLantern.traverse((clonedParent) => {
                                if (clonedParent.uuid === originalChild.parent.uuid) {
                                    // Create a new light with the same properties
                                    const newLight = originalChild.clone();
                                    // Replace any existing light at this position
                                    if (clonedParent.children[lightIndex] && clonedParent.children[lightIndex].isLight) {
                                        clonedParent.children[lightIndex] = newLight;
                                    } else {
                                        clonedParent.add(newLight);
                                    }
                                }
                            });
                        }
                    }
                });
                
                return Promise.resolve(clonedLantern);
            }
            
            try {
                // Create the lantern with the appropriate configuration
                const block = await createBlock(blockType, { hanging });
                
                // Cache the lantern with its specific configuration
                this.blockCache.set(cacheKey, block);
                
                // Return a clone with lights properly preserved
                const clonedBlock = block.clone();
                
                // Ensure lights are properly cloned
                block.traverse((originalChild) => {
                    if (originalChild.isLight) {
                        const lightIndex = originalChild.parent.children.indexOf(originalChild);
                        if (lightIndex !== -1) {
                            // Find the corresponding parent in the clone
                            clonedBlock.traverse((clonedParent) => {
                                if (clonedParent.uuid === originalChild.parent.uuid) {
                                    // Create a new light with the same properties
                                    const newLight = originalChild.clone();
                                    // Replace any existing light at this position
                                    if (clonedParent.children[lightIndex] && clonedParent.children[lightIndex].isLight) {
                                        clonedParent.children[lightIndex] = newLight;
                                    } else {
                                        clonedParent.add(newLight);
                                    }
                                }
                            });
                        }
                    }
                });
                
                return clonedBlock;
            } catch (error) {
                console.error(`Error loading lantern ${blockType}:`, error);
                throw error;
            }
        }
        
        // For walls and fences, we need to consider the connections
        if ((blockType.includes('_wall') || blockType === 'wall' || 
             blockType.includes('_fence') && !blockType.includes('gate')) && 
            options.connections) {
            
            // Create a unique cache key based on connections
            const connectionsKey = Object.entries(options.connections)
                .filter(([_, value]) => value === 'true')
                .map(([dir, _]) => dir)
                .sort()
                .join('_');
            
            const cacheKey = `${blockType}_${connectionsKey || 'no_connections'}`;
            
            // Check if this specific configuration is in cache
            if (this.blockCache.has(cacheKey)) {
                return Promise.resolve(this.blockCache.get(cacheKey).clone());
            }
            
            try {
                // Create the block with the appropriate connections
                const block = await createBlock(blockType, { connections: options.connections });
                
                // Cache the block with its specific configuration
                this.blockCache.set(cacheKey, block);
                
                // Return a clone of the block
                return block.clone();
            } catch (error) {
                console.error(`Error loading connected block ${blockType}:`, error);
                throw error;
            }
        }
        
        // For doors
        if (blockType === 'door' || (blockType.endsWith('_door') && !blockType.includes('trapdoor'))) {
            console.log(`🚪 Loading door: ${blockType}`);
            
            // Create door geometry (full block size)
            const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1875); // 3/16 blocks thick
            
            // Create completely transparent material
            const transparentMaterial = new THREE.MeshStandardMaterial({
                transparent: true,
                opacity: 0,
                visible: false // make it completely invisible
            });
            
            const door = new THREE.Mesh(doorGeometry, transparentMaterial);
            door.name = blockType;
            
            // Enable shadows
            door.castShadow = false;
            door.receiveShadow = false;
            
            return door;
        }
        
        // For non-special blocks, use the standard caching approach
        if (this.blockCache.has(blockType)) {
            const cachedBlock = this.blockCache.get(blockType);
            if (DEBUG_LOGGING) console.log(`Using cached block for ${blockType}`);
            return Promise.resolve(cachedBlock.clone());
        }
        
        try {
            // Handle colored blocks (concrete, concrete_powder, wool)
            if (blockType.includes('concrete') || blockType.includes('wool')) {
                console.log(`🎨 Loading colored block: ${blockType}`);
                const color = options.color || 'white'; // default to white if no color specified
                const cacheKey = `${blockType}_${color}`;
                
                // Check if this specific color configuration is in cache
                if (this.blockCache.has(cacheKey)) {
                    console.log(`💫 Using cached colored block: ${cacheKey}`);
                    return Promise.resolve(this.blockCache.get(cacheKey).clone());
                }
                
                // Determine the correct texture path based on block type
                let texturePath;
                if (blockType.includes('concrete_powder')) {
                    texturePath = `textures/blocks/concrete_powder_${color}.png`;
                } else if (blockType.includes('concrete')) {
                    texturePath = `textures/blocks/concrete_${color}.png`;
                } else if (blockType.includes('wool')) {
                    texturePath = `textures/blocks/wool_colored_${color}.png`;
                }
                
                console.log(`📦 Using texture: ${texturePath}`);
                
                // Load the texture and create the block with simple BoxGeometry
                const texture = await loadTexture(texturePath);
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ 
                    map: texture,
                    roughness: 1.0,
                    metalness: 0.0
                });
                
                const block = new THREE.Mesh(geometry, material);
                block.name = blockType;
                
                // Cache the block with its color
                console.log(`💾 Caching colored block: ${cacheKey}`);
                this.blockCache.set(cacheKey, block);
                
                return block.clone();
            }
            
            // Create the block
            if (DEBUG_LOGGING) console.log(`Creating new block for ${blockType}`);
            const block = await createBlock(blockType, options);
            
            // Ensure the block has proper geometry and materials for instancing
            if (block instanceof THREE.Group) {
                if (DEBUG_LOGGING) console.warn(`Block ${blockType} is a Group, which may not work well with instancing`);
                // For groups, we'll return as is and let the caller handle it
                return block; // Return directly without cloning for groups
            }
            
            // Verify the block has geometry and material
            if (!block.geometry) {
                console.error(`Block ${blockType} is missing geometry:`, block);
            }
            
            if (!block.material) {
                console.error(`Block ${blockType} is missing material:`, block);
            }
            
            // Cache the block
            this.blockCache.set(blockType, block);
            
            // Return a clone of the block
            return block.clone();
        } catch (error) {
            console.error(`Error loading block ${blockType}:`, error);
            throw error;
        }
    }
    
    /**
     * Load a texture directly by path
     * @param {string} path - Path to the texture
     * @returns {Promise<THREE.Texture>} - Promise that resolves to the loaded texture
     */
    loadTextureByPath(path) {
        return loadTexture(path);
    }
    
    /**
     * Clear all caches
     */
    clearCaches() {
        this.blockCache.clear();
        clearTextureCache();
    }
    
    /**
     * Get the size of the block cache
     * @returns {number} - The number of blocks in the cache
     */
    getBlockCacheSize() {
        return this.blockCache.size;
    }

    async loadTrapdoor(type, options = {}) {
        console.log('🚪 CREATING TRAPDOOR MESH:', {
            type,
            options,
            rawTrapdoorState: options.trapdoorState
        });

        // Create the trapdoor mesh here...
        const mesh = await this.createBlockMesh(type, options);
        
        console.log('🎮 FINAL TRAPDOOR MESH:', {
            type,
            position: mesh.position,
            rotation: {
                x: mesh.rotation.x * (180/Math.PI),
                y: mesh.rotation.y * (180/Math.PI),
                z: mesh.rotation.z * (180/Math.PI)
            },
            options
        });

        return mesh;
    }
} 