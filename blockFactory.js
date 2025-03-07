/**
 * Block Factory
 * Contains functions for creating different types of blocks
 */

import * as THREE from 'three';
import { BLOCK_PROPERTIES, BLOCK_CATEGORIES } from './blockData.js';
import { loadBlockTextures, loadTexture, getTexturePath } from './textureManager.js';
import { 
    createUniformMaterial, 
    createLeafMaterial, 
    createDirectionalMaterial, 
    createMultiFaceMaterial,
    createFallbackMaterial 
} from './materialFactory.js';
import { createSlabBlock, isSlabBlock } from './slabFactory.js';
import { createStairBlock, isStairBlock } from './stairFactory.js';
import { createGrindstoneBlock, isGrindstoneBlock } from './grindstoneFactory.js';

// Cache for block geometries
const geometryCache = new Map();

/**
 * Create a block mesh
 * @param {string} blockType - The type of block
 * @param {Object} options - Additional options for block creation
 * @returns {Promise<THREE.Mesh>} - Promise that resolves to the block mesh
 */
export async function createBlock(blockType, options = {}) {
    console.log('🎭 createBlock called:', { blockType, options });
    try {
        // Check for chain blocks first
        if (isChainBlock(blockType)) {
            return createChainBlock(blockType, options);
        }
        
        // Check if this is a torch block
        if (blockType.includes('torch')) {
            return createTorchBlock(blockType, options);
        }
        
        // Check if this is a door block
        if (isDoorBlock(blockType)) {
            return createDoorBlock(blockType, options);
        }
        
        // Check if this is a grindstone block
        if (isGrindstoneBlock(blockType)) {
            return createGrindstoneBlock(blockType, options);
        }
        
        // Check if this is a colored block (concrete, concrete_powder, wool)
        if (blockType.includes('concrete') || blockType.includes('wool')) {
            console.log('🎨 Creating colored block:', { blockType, options });
            const color = options.color || 'white'; // default to white if no color specified
            
            // Load the appropriate texture
            let texturePath;
            if (blockType.includes('concrete_powder')) {
                texturePath = `textures/blocks/concrete_powder_${color}.png`;
            } else if (blockType.includes('concrete')) {
                texturePath = `textures/blocks/concrete_${color}.png`;
            } else if (blockType.includes('wool')) {
                texturePath = `textures/blocks/wool_colored_${color}.png`;
            }
            
            const texture = await loadTexture(texturePath);
            const geometry = getBlockGeometry();
            const material = new THREE.MeshStandardMaterial({ 
                map: texture,
                roughness: 1.0,
                metalness: 0.0
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = blockType;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            return mesh;
        }
        
        // Check if this is a slab block
        if (isSlabBlock(blockType)) {
            return createSlabBlock(blockType, options.isUpperSlab || false);
        }
        
        // Check if this is a stair block
        if (isStairBlock(blockType)) {
            return createStairBlock(blockType, {
                facing: options.facing || 'east'
            });
        }
        
        // Check if this is a wall block
        if (isWallBlock(blockType)) {
            return createWallBlock(blockType, options.connections || {});
        }
        
        // Check if this is a fence block
        if (isFenceBlock(blockType)) {
            return createFenceBlock(blockType, options.connections || {});
        }
        
        // Check if this is a trapdoor block
        if (isTrapdoorBlock(blockType)) {
            return createTrapdoorBlock(blockType, options);
        }
        
        // Check if this is a lantern block
        if (isLanternBlock(blockType)) {
            return createLanternBlock(blockType, options.hanging || false);
        }
        
        // Get block properties
        const properties = BLOCK_PROPERTIES[blockType] || {};
        
        // Check if this is a double-height plant
        if (isDoublePlant(blockType)) {
            return createDoublePlantBlock(blockType, properties);
        }
        
        // Check if this is a plant type
        if (isPlantBlock(blockType)) {
            return createPlantBlock(blockType, properties);
        }
        
        // Get block category
        let category = properties.category || 'uniform';
        
        // Check if it's a leaf block
        if (blockType.includes('leaves') || blockType.endsWith('_leaves')) {
            category = 'leaves';
        }
        
        // Check if it's a log block
        if (blockType.includes('_log') || blockType.endsWith('_log')) {
            category = 'directional';
        }
        
        // Load textures
        const textures = await loadBlockTextures(blockType, category);
        
        // Create materials based on category
        let materials;
        
        switch (category) {
            case 'uniform':
                // Use MeshStandardMaterial for better lighting
                const uniformTexture = textures.texture;
                const uniformMaterial = new THREE.MeshStandardMaterial({
                    map: uniformTexture,
                    transparent: properties.transparent || false,
                    alphaTest: properties.alphaCutoff || 0.0,
                    opacity: properties.opacity || 1.0,
                    color: properties.color || 0xffffff,
                    roughness: 1.0,
                    metalness: 0.0
                });
                materials = [
                    uniformMaterial, uniformMaterial, uniformMaterial,
                    uniformMaterial, uniformMaterial, uniformMaterial
                ];
                break;
                
            case 'tbs':
                // Use MeshStandardMaterial for better lighting
                materials = createMultiFaceMaterial(
                    textures.topTexture,
                    textures.bottomTexture,
                    textures.sideTexture,
                    properties,
                    blockType
                );
                break;
                
            case 'directional':
                // Use MeshStandardMaterial for better lighting
                materials = createDirectionalMaterial(
                    textures.sideTexture,
                    textures.endTexture,
                    properties
                );
                break;
                
            case 'leaves':
                // Use MeshStandardMaterial for better lighting
                const leafMaterial = createLeafMaterial(textures.texture, properties);
                materials = [
                    leafMaterial, leafMaterial, leafMaterial,
                    leafMaterial, leafMaterial, leafMaterial
                ];
                break;
                
            default:
                // Use MeshStandardMaterial for better lighting
                const defaultMaterial = createUniformMaterial(textures.texture, properties);
                materials = [
                    defaultMaterial, defaultMaterial, defaultMaterial,
                    defaultMaterial, defaultMaterial, defaultMaterial
                ];
                break;
        }
        
        // Create geometry
        const geometry = getBlockGeometry();
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.name = blockType;
        
        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    } catch (error) {
        console.error(`Error creating block ${blockType}:`, error);
        
        // Create fallback mesh
        const geometry = getBlockGeometry();
        const material = createFallbackMaterial();
        const materials = [
            material, material, material,
            material, material, material
        ];
        
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.name = `fallback_${blockType}`;
        
        return mesh;
    }
}

/**
 * Check if a block type is a plant
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a plant
 */
function isPlantBlock(blockType) {
    console.log('🌿 isPlantBlock check:', blockType);
    // List of known plant types and patterns
    const plantTypes = [
        'plant', 'flower', 'sapling', 'mushroom', 'wheat', 
        'berry', 'fern', 'dead_bush', 'seagrass', 'kelp', 'bamboo',
        'vine', 'lily', 'double_plant', 'rose', 'dandelion', 'tulip',
        'allium', 'orchid', 'poppy', 'cornflower', 'wither_rose'
    ];
    
    // Specific blocks to exclude even if they match patterns
    const excludedBlocks = [
        'grass_block', 'grass_path', 'dirt_path', 'mycelium', 
        'podzol', 'farmland', 'farmland_moist', 'mushroom_stem', 'brown_mushroom_block'
    ];
    
    // First check if it's in the excluded list
    if (excludedBlocks.includes(blockType)) {
        return false;
    }
    
    // For "grass" specifically, only match if it's exactly "grass" or has it as a prefix
    // but not if it's part of another word like "grass_block"
    if (blockType.includes('grass')) {
        return blockType === 'grass' || 
               blockType === 'tallgrass' || 
               blockType.startsWith('grass_') && !blockType.includes('path');
    }
    
    // Check if the block type contains any of the plant patterns
    return plantTypes.some(type => blockType.includes(type));
}

/**
 * Check if a block type is a double-height plant
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a double-height plant
 */
function isDoublePlant(blockType) {
    console.log('🌱 isDoublePlant check:', blockType);
    return blockType.includes('double_plant') || 
           blockType.includes('_top') || 
           blockType.includes('_bottom');
}

/**
 * Create a plant block with crossed planes
 * @param {string} blockType - The type of plant
 * @param {Object} properties - Additional properties for the plant
 * @returns {Promise<THREE.Group>} - Promise that resolves to the plant mesh
 */
async function createPlantBlock(blockType, properties = {}) {
    console.log('🌺 createPlantBlock called:', { blockType, properties });
    try {
        // Load the plant texture
        const { texture } = await loadBlockTextures(blockType, 'uniform');
        
        // Create material with transparency
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            side: THREE.DoubleSide,
            roughness: 1.0,
            metalness: 0.0
        });
        
        // Apply tint color if specified
        if (properties.tintColor) {
            material.color = new THREE.Color(properties.tintColor);
        }
        
        // Create crossed planes geometry or get from cache
        const geometry = getPlantGeometry();
        
        // Create a group to hold the crossed planes
        const group = new THREE.Group();
        group.name = blockType;
        
        // Create two crossed planes
        const plane1 = new THREE.Mesh(geometry, material);
        plane1.rotation.y = Math.PI / 4;
        group.add(plane1);
        
        const plane2 = new THREE.Mesh(geometry, material);
        plane2.rotation.y = -Math.PI / 4;
        group.add(plane2);
        
        // Add random rotation for variety if it's a natural plant
        if (!blockType.includes('crop') && !blockType.includes('wheat')) {
            group.rotation.y = Math.random() * Math.PI * 2;
        }
        
        // Move the entire group down by half a block to fix positioning
        group.position.y = -0.5;
        
        // Enable shadows
        plane1.castShadow = true;
        plane1.receiveShadow = true;
        plane2.castShadow = true;
        plane2.receiveShadow = true;
        
        return group;
    } catch (error) {
        console.error(`Error creating plant ${blockType}:`, error);
        
        // Create fallback mesh
        const geometry = getPlantGeometry();
        const material = createFallbackMaterial();
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `fallback_${blockType}`;
        
        return mesh;
    }
}

/**
 * Create a double-height plant block with crossed planes
 * @param {string} blockType - The type of plant
 * @param {Object} properties - Additional properties for the plant
 * @returns {Promise<THREE.Group>} - Promise that resolves to the plant mesh
 */
async function createDoublePlantBlock(blockType, properties = {}) {
    console.log('🌲 createDoublePlantBlock called:', { blockType, properties });
    try {
        // Load the appropriate texture based on the block type
        const { texture } = await loadBlockTextures(blockType, 'uniform');
        
        // Create material with transparency
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            side: THREE.DoubleSide,
            roughness: 1.0,
            metalness: 0.0
        });
        
        // Apply tint color if specified
        if (properties.tintColor) {
            material.color = new THREE.Color(properties.tintColor);
        }
        
        // Create crossed planes geometry
        const geometry = getPlantGeometry();
        
        // Create a group to hold the crossed planes
        const group = new THREE.Group();
        group.name = blockType;
        
        // Create two crossed planes
        const plane1 = new THREE.Mesh(geometry, material);
        plane1.rotation.y = Math.PI / 4;
        group.add(plane1);
        
        const plane2 = new THREE.Mesh(geometry, material);
        plane2.rotation.y = -Math.PI / 4;
        group.add(plane2);
        
        // Add random rotation for variety
        // Only add random rotation for the bottom part to ensure top and bottom align
        if (!blockType.includes('_top')) {
            group.rotation.y = Math.random() * Math.PI * 2;
        }
        
        // Move the entire group down by half a block to fix positioning
        group.position.y = -0.5;
        
        // Enable shadows
        plane1.castShadow = true;
        plane1.receiveShadow = true;
        plane2.castShadow = true;
        plane2.receiveShadow = true;
        
        return group;
    } catch (error) {
        console.error(`Error creating double plant ${blockType}:`, error);
        
        // Create fallback mesh
        const geometry = getPlantGeometry();
        const material = createFallbackMaterial();
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `fallback_${blockType}`;
        
        return mesh;
    }
}

/**
 * Get a plant geometry (cached)
 * @returns {THREE.PlaneGeometry} - The plant geometry
 */
function getPlantGeometry() {
    console.log('📐 getPlantGeometry called');
    // Check if geometry is already in cache
    if (geometryCache.has('plant')) {
        return geometryCache.get('plant');
    }
    
    // Create a new geometry - using 1.0 x 1.0 dimensions
    const geometry = new THREE.PlaneGeometry(1.0, 1.0);
    
    // Position the plant so it sits on top of a block
    // We're now handling the positioning in the createPlantBlock function
    // by moving the entire group down, so we just center the geometry here
    geometry.translate(0, 0, 0);
    
    // Ensure normals are computed
    geometry.computeVertexNormals();
    
    // Cache the geometry
    geometryCache.set('plant', geometry);
    
    return geometry;
}

/**
 * Get a block geometry (cached)
 * @returns {THREE.BoxGeometry} - The block geometry
 */
function getBlockGeometry() {
    console.log('📦 getBlockGeometry called');
    // Check if geometry is already in cache
    if (geometryCache.has('block')) {
        return geometryCache.get('block');
    }
    
    // Create a new geometry with more segments for better lighting
    const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
    
    // Ensure normals are computed
    geometry.computeVertexNormals();
    
    // Cache the geometry
    geometryCache.set('block', geometry);
    
    return geometry;
}

/**
 * Clear the geometry cache
 */
export function clearGeometryCache() {
    geometryCache.clear();
}

/**
 * Check if a block type is a wall
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a wall
 */
function isWallBlock(blockType) {
    console.log('🧱 isWallBlock check:', blockType);
    return blockType.includes('_wall') || blockType === 'wall';
}

/**
 * Check if a block type is a fence
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a fence
 */
function isFenceBlock(blockType) {
    console.log('🚧 isFenceBlock check:', blockType);
    return blockType.includes('_fence') && !blockType.includes('gate');
}

/**
 * Create a wall block with posts and connections
 * @param {string} blockType - The type of wall
 * @param {Object} connections - Connection states (north, east, south, west, up)
 * @returns {Promise<THREE.Group>} - Promise that resolves to the wall mesh
 */
async function createWallBlock(blockType, connections = {}) {
    console.log('🏛️ createWallBlock called:', { blockType, connections });
    try {
        console.log(`Creating wall block: ${blockType} with connections:`, connections);
        
        // Load the wall texture
        const { texture } = await loadBlockTextures(blockType, 'uniform');
        
        // Get block properties
        const properties = BLOCK_PROPERTIES[blockType] || {};
        
        // Create material
        const material = createUniformMaterial(texture, properties);
        
        // Create a group to hold all parts of the wall
        const group = new THREE.Group();
        group.name = blockType;
        
        // Create the center post (always present) - thicker than fence posts
        const postGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const post = new THREE.Mesh(postGeometry, material);
        post.position.set(0, 0, 0);
        group.add(post);
        
        // Remove extended post logic - walls are only 1 block tall
        // No need to check for connections.up anymore
        
        // Add connections in each direction
        const directions = [
            { name: 'north', x: 0, z: -0.375 },
            { name: 'east', x: 0.375, z: 0 },
            { name: 'south', x: 0, z: 0.375 },
            { name: 'west', x: -0.375, z: 0 }
        ];
        
        for (const dir of directions) {
            if (connections[dir.name] === 'true') {
                // Create connection wall segment - thicker than fence rails
                // Reduced height from 0.75 to 0.6 to make it visually one block tall
                const wallGeometry = new THREE.BoxGeometry(
                    dir.name === 'east' || dir.name === 'west' ? 0.5 : 0.3, 
                    0.6, 
                    dir.name === 'north' || dir.name === 'south' ? 0.5 : 0.3
                );
                const wallSegment = new THREE.Mesh(wallGeometry, material);
                // Adjusted y position to center the segment within the block height
                wallSegment.position.set(dir.x, 0.05, dir.z);
                group.add(wallSegment);
            }
        }
        
        // Enable shadows for all parts
        group.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Center the group
        group.position.set(0, 0, 0);
        
        return group;
    } catch (error) {
        console.error(`Error creating wall ${blockType}:`, error);
        
        // Create fallback mesh
        const geometry = getBlockGeometry();
        const material = createFallbackMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `fallback_${blockType}`;
        
        return mesh;
    }
}

/**
 * Create a fence block with posts and connections
 * @param {string} blockType - The type of fence
 * @param {Object} connections - Connection states (north, east, south, west)
 * @returns {Promise<THREE.Group>} - Promise that resolves to the fence mesh
 */
async function createFenceBlock(blockType, connections = {}) {
    console.log('🏗️ createFenceBlock called:', { blockType, connections });
    try {
        console.log(`Creating fence block: ${blockType} with connections:`, connections);
        
        // Load the fence texture
        const { texture } = await loadBlockTextures(blockType, 'uniform');
        
        // Get block properties
        const properties = BLOCK_PROPERTIES[blockType] || {};
        
        // Create material
        const material = createUniformMaterial(texture, properties);
        
        // Create a group to hold all parts of the fence
        const group = new THREE.Group();
        group.name = blockType;
        
        // Create the center post (always present)
        const postGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
        const post = new THREE.Mesh(postGeometry, material);
        post.position.set(0, 0, 0);
        group.add(post);
        
        // Add connections in each direction
        const directions = [
            { name: 'north', x: 0, z: -0.375 },
            { name: 'east', x: 0.375, z: 0 },
            { name: 'south', x: 0, z: 0.375 },
            { name: 'west', x: -0.375, z: 0 }
        ];
        
        for (const dir of directions) {
            if (connections[dir.name] === 'true') {
                // Create upper rail
                const upperRailGeometry = new THREE.BoxGeometry(dir.name === 'east' || dir.name === 'west' ? 0.5 : 0.125, 0.125, dir.name === 'north' || dir.name === 'south' ? 0.5 : 0.125);
                const upperRail = new THREE.Mesh(upperRailGeometry, material);
                upperRail.position.set(dir.x, 0.25, dir.z);
                group.add(upperRail);
                
                // Create lower rail
                const lowerRailGeometry = new THREE.BoxGeometry(dir.name === 'east' || dir.name === 'west' ? 0.5 : 0.125, 0.125, dir.name === 'north' || dir.name === 'south' ? 0.5 : 0.125);
                const lowerRail = new THREE.Mesh(lowerRailGeometry, material);
                lowerRail.position.set(dir.x, -0.125, dir.z);
                group.add(lowerRail);
            }
        }
        
        // Enable shadows for all parts
        group.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Center the group
        group.position.set(0, 0, 0);
        
        return group;
    } catch (error) {
        console.error(`Error creating fence ${blockType}:`, error);
        
        // Create fallback mesh
        const geometry = getBlockGeometry();
        const material = createFallbackMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `fallback_${blockType}`;
        
        return mesh;
    }
}

/**
 * Check if a block type is a trapdoor
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a trapdoor
 */
function isTrapdoorBlock(blockType) {
    console.log('🔍 CHECKING IF TRAPDOOR:', {
        blockType,
        isTrapdoor: blockType.includes('_trapdoor') || blockType === 'trapdoor'
    });
    return blockType.includes('_trapdoor') || blockType === 'trapdoor';
}

/**
 * Check if a block type is a lantern
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a lantern
 */
function isLanternBlock(blockType) {
    // Exclude jack_o_lantern but include actual lanterns
    return blockType.includes('lantern') && blockType !== 'jack_o_lantern';
}

/**
 * Create a trapdoor block with the correct orientation
 * @param {string} blockType - The type of trapdoor
 * @param {Object} options - Additional options for trapdoor creation
 * @param {Object} options.trapdoorState - The state of the trapdoor
 * @param {string} options.material - The material type (oak, spruce, iron, etc.)
 * @returns {Promise<THREE.Group>} - Promise that resolves to the trapdoor mesh
 */
async function createTrapdoorBlock(blockType, options = {}) {
    console.log('🚪 TRAPDOOR CREATION START:', {
        blockType,
        rawOptions: options,
        trapdoorState: options.trapdoorState,
        material: options.material
    });
    
    // Extract trapdoor state from options
    const trapdoorState = options.trapdoorState || {};
    const material = options.material || null;
    
    try {
        // Set default state if not provided
        const state = {
            open: trapdoorState.open === true || trapdoorState.open === 'true',  // Only true if explicitly true
            half: trapdoorState.half || 'bottom',
            facing: trapdoorState.facing || 'north'
        };
        
        console.log('🎯 Processing trapdoor state:', state);
        
        // Load textures for the trapdoor
        const { texture } = await loadBlockTextures(blockType, 'trapdoor');
        
        // Create material for the face (with texture)
        const faceMaterial = createUniformMaterial(texture, {});
        
        // Create material for the sides (solid color matching the trapdoor)
        const sideColor = new THREE.Color(0x6d4c33); // Default to spruce color
        const sideMaterial = new THREE.MeshStandardMaterial({
            color: sideColor,
            roughness: 0.8,
            metalness: 0.0
        });
        
        // Create a group to hold the trapdoor
        const group = new THREE.Group();
        group.name = blockType;
        
        // Create the trapdoor geometry (thin box)
        const trapdoorGeometry = new THREE.BoxGeometry(1, 0.1875, 1); // 3/16 blocks thick
        
        // Create materials array for the box
        // Order: right, left, top, bottom, front, back
        const materials = [
            sideMaterial,  // right
            sideMaterial,  // left
            faceMaterial,  // top
            faceMaterial,  // bottom
            sideMaterial,  // front
            sideMaterial   // back
        ];
        
        const trapdoor = new THREE.Mesh(trapdoorGeometry, materials);
        
        // Position and rotate based on state
        if (state.open) {
            // When open, rotate 90 degrees around the hinge
            switch (state.facing) {
                case 'north':
                    trapdoor.rotation.x = Math.PI / 2;
                    trapdoor.position.set(0, 0, 0.5);
                    break;
                case 'south':
                    trapdoor.rotation.x = -Math.PI / 2;
                    trapdoor.position.set(0, 0, -0.5);
                    break;
                case 'east':
                    trapdoor.rotation.z = -Math.PI / 2;
                    trapdoor.position.set(-0.5, 0, 0);
                    break;
                case 'west':
                    trapdoor.rotation.z = Math.PI / 2;
                    trapdoor.position.set(0.5, 0, 0);
                    break;
            }
            
            // Keep Y centered regardless of half position
            trapdoor.position.y = 0;
        } else {
            // When closed, just place at top or bottom
            if (state.half === 'top') {
                trapdoor.position.set(0, 0.4375, 0); // Place at top (1 - thickness/2)
            } else {
                trapdoor.position.set(0, -0.4375, 0); // Place at bottom (-1 + thickness/2)
            }
            
            // Rotate based on facing direction
            switch (state.facing) {
                case 'north':
                    trapdoor.rotation.y = Math.PI;
                    break;
                case 'south':
                    trapdoor.rotation.y = 0;
                    break;
                case 'east':
                    trapdoor.rotation.y = Math.PI / 2;
                    break;
                case 'west':
                    trapdoor.rotation.y = -Math.PI / 2;
                    break;
            }
        }
        
        console.log('🎨 Final trapdoor configuration:', {
            position: trapdoor.position,
            rotation: {
                x: (trapdoor.rotation.x * 180 / Math.PI).toFixed(2) + '°',
                y: (trapdoor.rotation.y * 180 / Math.PI).toFixed(2) + '°',
                z: (trapdoor.rotation.z * 180 / Math.PI).toFixed(2) + '°'
            },
            state
        });
        
        group.add(trapdoor);
        
        // Enable shadows
        trapdoor.castShadow = true;
        trapdoor.receiveShadow = true;
        
        return group;
    } catch (error) {
        console.error(`Error creating trapdoor ${blockType}:`, error);
        return createFallbackMesh(blockType);
    }
}

// Helper function for fallback mesh
function createFallbackMesh(blockType) {
    const geometry = getBlockGeometry();
    const material = createFallbackMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `fallback_${blockType}`;
    return mesh;
}

/**
 * Create a lantern block with the correct orientation
 * @param {string} blockType - The type of lantern (lantern, soul_lantern, etc.)
 * @param {boolean} hanging - Whether the lantern is hanging
 * @returns {Promise<THREE.Group>} - Promise that resolves to the lantern mesh
 */
async function createLanternBlock(blockType, hanging = false) {
    try {
        console.log(`🏮 Creating lantern block: ${blockType}, hanging: ${hanging}`);
        
        // Load the lantern texture
        const texture = await loadTexture('textures/blocks/lantern.png');
        
        // Since the texture is 16x48, we need to adjust our UV coordinates
        // We only want the top 16x16 portion, so we'll use 0 to 1/3 for V coordinates
        const uvScale = 1/3;  // Since texture is 48px tall, each variant takes up 1/3
        
        // Create a group to hold all parts
        const group = new THREE.Group();
        group.name = blockType;
        
        // Calculate proportions based on minecraft's 16x16 texture
        const pixelSize = 1/16;  // 1 pixel = 1/16th of a block
        const lanternWidth = 6 * pixelSize;   // 6 pixels wide
        const lanternHeight = 9 * pixelSize;  // 9 pixels tall
        const bottomWidth = 6 * pixelSize;    // 6x6 bottom
        const chainWidth = 3 * pixelSize;     // 3 pixels wide chain
        const chainHeight = 8 * pixelSize;    // 8 pixels tall chain
        
        // Create solid interior box
        const interiorGeometry = new THREE.BoxGeometry(lanternWidth, lanternHeight, lanternWidth);
        const interiorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,  // dark gray color
            emissive: 0xffaa33,  // warm orange glow
            emissiveIntensity: 3.0,  // much higher intensity
            roughness: 1.0,
            metalness: 0.0
        });
        const interior = new THREE.Mesh(interiorGeometry, interiorMaterial);
        group.add(interior);
        
        // Create the four sides of the lantern
        const sideGeometry = new THREE.PlaneGeometry(lanternWidth, lanternHeight);
        // UV coordinates adjusted for 16x48 texture (only use top third, and ignore bottom 6 pixels)
        sideGeometry.setAttribute('uv', new THREE.Float32BufferAttribute([
            0, uvScale,              // top left
            6/16, uvScale,          // top right
            0, (6/16) * uvScale,    // bottom left (start 6 pixels from top)
            6/16, (6/16) * uvScale  // bottom right
        ], 2));
        
        // Create materials with specific UV mappings
        const sideMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            emissive: 0xffaa33,  // warm orange glow
            emissiveIntensity: 0.8,  // moderate intensity
            roughness: 1.0,
            metalness: 0.0
        });
        
        // Slightly reduce interior size to prevent z-fighting
        interior.scale.set(0.95, 0.95, 0.95);
        
        // Front - position slightly in front to prevent z-fighting
        const frontSide = new THREE.Mesh(sideGeometry.clone(), sideMaterial.clone());
        frontSide.position.z = bottomWidth/2 + 0.001;
        group.add(frontSide);
        
        // Back - position slightly behind to prevent z-fighting
        const backSide = new THREE.Mesh(sideGeometry.clone(), sideMaterial.clone());
        backSide.position.z = -bottomWidth/2 - 0.001;
        backSide.rotation.y = Math.PI;
        group.add(backSide);
        
        // Left - position slightly to the left to prevent z-fighting
        const leftSide = new THREE.Mesh(sideGeometry.clone(), sideMaterial.clone());
        leftSide.position.x = -bottomWidth/2 - 0.001;
        leftSide.rotation.y = -Math.PI/2;
        group.add(leftSide);
        
        // Right - position slightly to the right to prevent z-fighting
        const rightSide = new THREE.Mesh(sideGeometry.clone(), sideMaterial.clone());
        rightSide.position.x = bottomWidth/2 + 0.001;
        rightSide.rotation.y = Math.PI/2;
        group.add(rightSide);
        
        // Create bottom geometry with specific UVs (starts at pixel 6,0 and is 6x6 pixels)
        const bottomGeometry = new THREE.PlaneGeometry(bottomWidth, bottomWidth);
        bottomGeometry.setAttribute('uv', new THREE.Float32BufferAttribute([
            6/16, 10/16,          // top left (start at pixel 6,10)
            12/16, 10/16,         // top right
            6/16, 16/16,          // bottom left (end at pixel 6,16)
            12/16, 16/16          // bottom right
        ], 2));
        
        const bottomMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5
        });
        
        // Create bottom
        const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial.clone());
        bottom.rotation.x = -Math.PI/2;
        bottom.position.y = -lanternHeight/2;
        group.add(bottom);
        
        // Create top (using same UV coordinates as bottom)
        const top = new THREE.Mesh(bottomGeometry.clone(), bottomMaterial.clone());
        top.rotation.x = Math.PI/2;
        top.position.y = lanternHeight/2 - bottomWidth/8;
        group.add(top);
        
        if (hanging) {
            // Create chain using crossed planes
            const chainGeometry = new THREE.BufferGeometry();
            
            // Chain vertices using exact pixel sizes
            const chainVertices = new Float32Array([
                // First plane
                -chainWidth/2,  chainHeight/2,  chainWidth/2,
                -chainWidth/2, -chainHeight/2,  chainWidth/2,
                 chainWidth/2,  chainHeight/2, -chainWidth/2,
                 chainWidth/2, -chainHeight/2, -chainWidth/2,
                // Second plane
                 chainWidth/2,  chainHeight/2,  chainWidth/2,
                 chainWidth/2, -chainHeight/2,  chainWidth/2,
                -chainWidth/2,  chainHeight/2, -chainWidth/2,
                -chainWidth/2, -chainHeight/2, -chainWidth/2
            ]);
            
            // Chain texture starts at pixel 5,9 and is 3x8 pixels, adjusted for texture height
            const chainUvs = new Float32Array([
                // First plane
                5/16, uvScale,        // top left
                8/16, uvScale,        // top right
                5/16, 9/16 * uvScale, // bottom left
                8/16, 9/16 * uvScale, // bottom right
                // Second plane
                5/16, uvScale,        // top left
                8/16, uvScale,        // top right
                5/16, 9/16 * uvScale, // bottom left
                8/16, 9/16 * uvScale  // bottom right
            ]);
            
            const chainIndices = new Uint16Array([
                0, 1, 2,  2, 1, 3,  // First plane
                4, 5, 6,  6, 5, 7   // Second plane
            ]);
            
            chainGeometry.setAttribute('position', new THREE.BufferAttribute(chainVertices, 3));
            chainGeometry.setAttribute('uv', new THREE.BufferAttribute(chainUvs, 2));
            chainGeometry.setIndex(new THREE.BufferAttribute(chainIndices, 1));
            
            const chainMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
                roughness: 1.0,
                metalness: 0.0
            });
            
            const chain = new THREE.Mesh(chainGeometry, chainMaterial);
            chain.position.y = lanternHeight/2 + chainHeight/2;
            group.add(chain);
        }
        
        // Enable shadows for all parts
        group.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Add a point light
        const light = new THREE.PointLight(0xffd700, 10, 40); // Much higher intensity, longer range
        light.position.set(0, 0, 0); // center of lantern
        light.castShadow = true;
        light.decay = 1; // slower light falloff for better range
        light.userData.baseIntensity = 10; // Store base intensity for flickering
        
        // Configure shadow properties
        light.shadow.mapSize.width = 1024; // increased shadow map resolution
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 40;
        light.shadow.bias = -0.001; // reduce shadow acne
        
        // Add a subtle glow effect with a second light
        const glowLight = new THREE.PointLight(0xff9900, 5, 15);
        glowLight.position.set(0, 0, 0);
        glowLight.decay = 0.5; // much slower falloff for the glow
        glowLight.userData.baseIntensity = 5; // Store base intensity for flickering
        group.add(glowLight);
        
        group.add(light);
        
        return group;
    } catch (error) {
        console.error(`Error creating lantern ${blockType}:`, error);
        return createFallbackMesh(blockType);
    }
}

// Add isDoorBlock function
export function isDoorBlock(blockType) {
    return blockType === 'door' || (blockType.endsWith('_door') && !blockType.includes('trapdoor'));
}

// Add createDoorBlock function
async function createDoorBlock(blockType, options = {}) {
    console.log(`🚪 Creating door: ${blockType}`);
    
    // Create door geometry (1.5 blocks tall, 3/16 blocks thick)
    const doorGeometry = new THREE.BoxGeometry(0.1875, 1.5, 1);
    
    // Rotate the geometry itself 90 degrees around Y
    doorGeometry.rotateY(Math.PI / 2);
    
    // Create completely transparent material
    const transparentMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 0,
        visible: false // make it completely invisible
    });
    
    const door = new THREE.Mesh(doorGeometry, transparentMaterial);
    door.name = blockType;
    
    // Center the door vertically since it's 1.5 blocks tall
    door.position.y = -0.25;
    
    return door;
}

// Add createTorchBlock function
async function createTorchBlock(blockType, options = {}) {
    console.log(`🔥 Creating torch: ${blockType}`);
    
    // Create torch geometry (small box)
    const torchGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    
    // Create completely transparent material
    const transparentMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 0,
        visible: false // make it completely invisible
    });
    
    const torch = new THREE.Mesh(torchGeometry, transparentMaterial);
    torch.name = blockType;
    
    // Position the torch slightly above ground
    torch.position.y = 0.3;
    
    return torch;
}

/**
 * Create a chain block with crossed planes
 * @param {string} blockType - The type of chain block
 * @param {Object} options - Additional options for chain creation
 * @returns {Promise<THREE.Mesh>} - Promise that resolves to the chain mesh
 */
async function createChainBlock(blockType, options = {}) {
    try {
        // Create crossed planes geometry
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            // First plane (scaled down to 0.125 width)
            -0.0625,  0.5,  0.0625,  // top right
            -0.0625, -0.5,  0.0625,  // bottom right
             0.0625,  0.5, -0.0625,  // top left
             0.0625, -0.5, -0.0625,  // bottom left
            // Second plane
             0.0625,  0.5,  0.0625,  // top right
             0.0625, -0.5,  0.0625,  // bottom right
            -0.0625,  0.5, -0.0625,  // top left
            -0.0625, -0.5, -0.0625   // bottom left
        ]);
        
        const uvs = new Float32Array([
            // First plane
            0.1875, 1,
            0.1875, 0,
            0, 1,
            0, 0,
            // Second plane
            0.1875, 1,
            0.1875, 0,
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
        
        // Create material with chain texture
        const texture = await loadTexture('textures/blocks/chain1.png');
        const chainMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            side: THREE.DoubleSide,
            roughness: 1.0,
            metalness: 0.0
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, chainMaterial);
        mesh.name = blockType;
        
        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    } catch (error) {
        console.error(`Error creating chain ${blockType}:`, error);
        return createFallbackMesh(blockType);
    }
}

/**
 * Check if a block type is a chain
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a chain
 */
export function isChainBlock(blockType) {
    return blockType === 'chain' || blockType.endsWith('_chain');
}

// TODO: Future implementations to consider:
// 1. Fence gates - Similar to fences but with open/closed states and different connection logic
// 2. Redstone components:
//    - Redstone dust with power levels and connection states
//    - Buttons with pressed/unpressed states
//    - Levers with on/off states
//    - Redstone torches with on/off states
//    - Redstone repeaters and comparators with delay/lock states
// 3. Signs - Both wall-mounted and standing signs with text rendering
// 4. Item frames - With the ability to display items inside
// 5. Lecterns - With open/closed book states
// 6. Lanterns - Both hanging and standing variants
// 7. Doors - With open/closed states and hinge positions
// 8. Beds - With color variants and head/foot parts
// 9. Chests - With open/closed states and single/double variants
// 10. Brewing stands, cauldrons, and other interactive blocks 