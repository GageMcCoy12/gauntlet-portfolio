/**
 * Slab Factory
 * Contains functions for creating slab blocks (half-height blocks)
 */

import * as THREE from 'three';
import { BLOCK_PROPERTIES, SPECIAL_TEXTURE_MAPPINGS } from './blockData.js';
import { loadTexture, getTexturePath, stripWaxedPrefix } from './textureManager.js';
import { 
    createUniformMaterial, 
    createMultiFaceMaterial,
    createFallbackMaterial 
} from './materialFactory.js';

// Cache for slab geometries
const slabGeometryCache = new Map();

/**
 * Create a slab block mesh
 * @param {string} blockType - The type of slab block
 * @param {boolean} isUpperSlab - Whether this is an upper slab (top half) or lower slab (bottom half)
 * @returns {Promise<THREE.Mesh>} - Promise that resolves to the slab mesh
 */
export async function createSlabBlock(blockType, isUpperSlab = false) {
    try {
        console.log(`🎨 Creating slab block:`, {
            type: blockType,
            isUpper: isUpperSlab
        });
        
        // Extract the base block type from the slab name
        const baseBlockType = getBaseBlockType(blockType);
        console.log(`🧩 Base block type: ${baseBlockType}`);
        
        // Get block properties
        const properties = BLOCK_PROPERTIES[blockType] || BLOCK_PROPERTIES[baseBlockType] || {};
        console.log(`📋 Block properties:`, properties);
        
        // Load textures
        const textures = await loadSlabTextures(blockType, baseBlockType);
        console.log(`🖼️ Loaded textures:`, Object.keys(textures));
        
        // Create materials
        let materials;
        
        // Check if the block has different top/bottom/side textures
        if (textures.topTexture && textures.bottomTexture && textures.sideTexture) {
            console.log(`🎭 Creating multi-face material`);
            materials = createMultiFaceMaterial(
                textures.topTexture,
                textures.bottomTexture,
                textures.sideTexture,
                properties,
                blockType
            );
        } else {
            console.log(`🎨 Creating uniform material`);
            const uniformMaterial = createUniformMaterial(textures.texture, properties);
            materials = [
                uniformMaterial, uniformMaterial, uniformMaterial,
                uniformMaterial, uniformMaterial, uniformMaterial
            ];
        }
        
        // Create geometry
        const geometry = getSlabGeometry(isUpperSlab);
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.name = blockType;
        
        // Set custom property to identify as slab
        mesh.userData.isSlab = true;
        mesh.userData.isUpperSlab = isUpperSlab;
        mesh.userData.slabType = blockType;
        
        console.log(`✨ Created slab mesh:`, {
            name: mesh.name,
            isUpper: mesh.userData.isUpperSlab,
            position: mesh.position
        });
        
        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    } catch (error) {
        console.error(`💥 Error creating slab ${blockType}:`, error);
        
        // Create fallback mesh
        const geometry = getSlabGeometry(isUpperSlab);
        const material = createFallbackMaterial();
        const materials = [
            material, material, material,
            material, material, material
        ];
        
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.name = `fallback_${blockType}`;
        
        console.log(`⚠️ Created fallback slab mesh:`, {
            name: mesh.name,
            isUpper: isUpperSlab
        });
        
        return mesh;
    }
}

/**
 * Get the base block type from a slab name
 * @param {string} slabType - The slab block type
 * @returns {string} - The base block type
 */
function getBaseBlockType(slabType) {
    console.log(`Getting base block type for slab: ${slabType}`);
    
    // Strip 'waxed_' prefix if present
    slabType = stripWaxedPrefix(slabType);
    
    // Remove the "slab" suffix if present
    if (slabType.endsWith('_slab')) {
        return slabType.replace('_slab', '');
    }
    
    // Handle special cases
    const specialCases = {
        'stone_slab': 'stone',
        'sandstone_slab': 'sandstone',
        'cobblestone_slab': 'cobblestone',
        'brick_slab': 'brick',
        'stone_brick_slab': 'stone_bricks',
        'nether_brick_slab': 'nether_bricks',
        'quartz_slab': 'quartz_block',
        'red_sandstone_slab': 'red_sandstone',
        'purpur_slab': 'purpur_block',
        'prismarine_slab': 'prismarine',
        'prismarine_brick_slab': 'prismarine_bricks',
        'dark_prismarine_slab': 'dark_prismarine',
        'polished_granite_slab': 'polished_granite',
        'smooth_red_sandstone_slab': 'smooth_red_sandstone',
        'mossy_stone_brick_slab': 'mossy_stone_bricks',
        'polished_diorite_slab': 'polished_diorite',
        'mossy_cobblestone_slab': 'mossy_cobblestone',
        'end_stone_brick_slab': 'end_stone_bricks',
        'smooth_sandstone_slab': 'smooth_sandstone',
        'smooth_quartz_slab': 'smooth_quartz',
        'granite_slab': 'granite',
        'andesite_slab': 'andesite',
        'red_nether_brick_slab': 'red_nether_bricks',
        'polished_andesite_slab': 'polished_andesite',
        'diorite_slab': 'diorite',
        'crimson_slab': 'crimson_planks',
        'warped_slab': 'warped_planks',
        'blackstone_slab': 'blackstone',
        'polished_blackstone_slab': 'polished_blackstone',
        'polished_blackstone_brick_slab': 'polished_blackstone_bricks',
        'cut_copper_slab': 'cut_copper',
        'exposed_cut_copper_slab': 'exposed_cut_copper',
        'weathered_cut_copper_slab': 'weathered_cut_copper',
        'oxidized_cut_copper_slab': 'oxidized_cut_copper',
        'cobbled_deepslate_slab': 'cobbled_deepslate',
        'polished_deepslate_slab': 'polished_deepslate',
        'deepslate_brick_slab': 'deepslate_bricks',
        'deepslate_tile_slab': 'deepslate_tiles',
        'mangrove_slab': 'mangrove_planks',
        'mud_brick_slab': 'mud_bricks',
        'bamboo_slab': 'bamboo_planks',
        'bamboo_mosaic_slab': 'bamboo_mosaic',
        'cherry_slab': 'cherry_planks'
    };
    
    if (specialCases[slabType]) {
        const baseType = specialCases[slabType];
        console.log(`Found special case for ${slabType}: ${baseType}`);
        return baseType;
    }
    
    // For wood slabs, convert to planks
    if (slabType.includes('_slab') && (
        slabType.includes('oak') || 
        slabType.includes('spruce') || 
        slabType.includes('birch') || 
        slabType.includes('jungle') || 
        slabType.includes('acacia') || 
        slabType.includes('dark_oak')
    )) {
        const planksType = slabType.replace('_slab', '_planks');
        console.log(`Converting wood slab ${slabType} to planks: ${planksType}`);
        return planksType;
    }
    
    // Default fallback
    console.log(`No special case found for ${slabType}, using as is`);
    return slabType;
}

/**
 * Load textures for a slab block
 * @param {string} slabType - The slab block type
 * @param {string} baseBlockType - The base block type
 * @returns {Promise<Object>} - Promise that resolves to an object containing the loaded textures
 */
async function loadSlabTextures(slabType, baseBlockType) {
    try {
        console.log(`Loading textures for slab: ${slabType}, base: ${baseBlockType}`);
        
        // Check if there are special texture mappings for this slab
        if (SPECIAL_TEXTURE_MAPPINGS[slabType]) {
            const mapping = SPECIAL_TEXTURE_MAPPINGS[slabType];
            console.log(`Found special mapping for ${slabType}:`, JSON.stringify(mapping, null, 2));
            
            // If the slab has specific top/bottom/side textures
            if (mapping.top && mapping.bottom && mapping.side) {
                console.log(`Using specific top/bottom/side textures from mapping`);
                const topTexture = await loadTexture(`textures/blocks/${mapping.top}`);
                const bottomTexture = await loadTexture(`textures/blocks/${mapping.bottom}`);
                const sideTexture = await loadTexture(`textures/blocks/${mapping.side}`);
                return { topTexture, bottomTexture, sideTexture };
            } else if (mapping.default) {
                console.log(`Using default texture from mapping: ${mapping.default}`);
                const texture = await loadTexture(`textures/blocks/${mapping.default}`);
                return { texture };
            }
        }
        
        // Check if there are special texture mappings for the base block
        if (SPECIAL_TEXTURE_MAPPINGS[baseBlockType]) {
            const mapping = SPECIAL_TEXTURE_MAPPINGS[baseBlockType];
            console.log(`Found special mapping for base block ${baseBlockType}:`, JSON.stringify(mapping, null, 2));
            
            // If the base block has specific top/bottom/side textures
            if (mapping.top && mapping.bottom && mapping.side) {
                console.log(`Using base block's top/bottom/side textures from mapping`);
                const topTexture = await loadTexture(`textures/blocks/${mapping.top}`);
                const bottomTexture = await loadTexture(`textures/blocks/${mapping.bottom}`);
                const sideTexture = await loadTexture(`textures/blocks/${mapping.side}`);
                return { topTexture, bottomTexture, sideTexture };
            } else if (mapping.default) {
                console.log(`Using base block's default texture from mapping: ${mapping.default}`);
                const texture = await loadTexture(`textures/blocks/${mapping.default}`);
                return { texture };
            }
        }
        
        // Try to load specific slab textures
        try {
            console.log(`Trying specific slab textures for ${slabType}`);
            const topPath = getTexturePath(slabType, 'top');
            const bottomPath = getTexturePath(slabType, 'bottom');
            const sidePath = getTexturePath(slabType, 'side');
            console.log(`Texture paths: top=${topPath}, bottom=${bottomPath}, side=${sidePath}`);
            
            const topTexture = await loadTexture(topPath);
            const bottomTexture = await loadTexture(bottomPath);
            const sideTexture = await loadTexture(sidePath);
            return { topTexture, bottomTexture, sideTexture };
        } catch (e) {
            console.log(`Failed to load specific slab textures: ${e.message}`);
            console.log(`Trying base block textures for ${baseBlockType}`);
            // If specific textures fail, try base block textures
            try {
                const topPath = getTexturePath(baseBlockType, 'top');
                const bottomPath = getTexturePath(baseBlockType, 'bottom');
                const sidePath = getTexturePath(baseBlockType, 'side');
                console.log(`Base texture paths: top=${topPath}, bottom=${bottomPath}, side=${sidePath}`);
                
                const topTexture = await loadTexture(topPath);
                const bottomTexture = await loadTexture(bottomPath);
                const sideTexture = await loadTexture(sidePath);
                return { topTexture, bottomTexture, sideTexture };
            } catch (e) {
                console.log(`Failed to load base block textures: ${e.message}`);
                console.log(`Using uniform texture for ${baseBlockType}`);
                // If all else fails, use a uniform texture
                const texturePath = getTexturePath(baseBlockType);
                console.log(`Uniform texture path: ${texturePath}`);
                const texture = await loadTexture(texturePath);
                return { texture };
            }
        }
    } catch (error) {
        console.error(`Error loading textures for slab ${slabType}:`, error);
        
        // Return a fallback texture
        const fallbackTexture = createFallbackTexture();
        return { texture: fallbackTexture };
    }
}

/**
 * Create a fallback texture
 * @returns {THREE.Texture} - A fallback texture
 */
function createFallbackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    // Draw a checkerboard pattern
    ctx.fillStyle = '#FF00FF'; // Magenta
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#000000'; // Black
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillRect(8, 8, 8, 8);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    
    return texture;
}

/**
 * Get a slab geometry (cached)
 * @param {boolean} isUpperSlab - Whether this is an upper slab (top half) or lower slab (bottom half)
 * @returns {THREE.BoxGeometry} - The slab geometry
 */
function getSlabGeometry(isUpperSlab) {
    console.log(`🧱 Creating slab geometry: ${isUpperSlab ? 'upper' : 'lower'}`);
    const cacheKey = isUpperSlab ? 'upper_slab' : 'lower_slab';
    
    // Check if geometry is already in cache
    if (slabGeometryCache.has(cacheKey)) {
        return slabGeometryCache.get(cacheKey);
    }
    
    // Create a new geometry - exactly 0.5 blocks tall
    const geometry = new THREE.BoxGeometry(1, 0.5, 1);
    
    // Get UV attribute
    const uvs = geometry.attributes.uv;
    
    // Update UVs for side faces to only use half of the texture
    // BoxGeometry UV layout: right, left, top, bottom, front, back
    // Each face has 4 UV coordinates (8 values)
    for (let i = 0; i < uvs.count; i++) {
        const u = uvs.getX(i);
        let v = uvs.getY(i);
        
        // Only modify side faces (right, left, front, back - faces 0,1,4,5)
        const faceIndex = Math.floor(i / 4);
        if (faceIndex === 0 || faceIndex === 1 || faceIndex === 4 || faceIndex === 5) {
            // For upper slabs, use top half of texture (v from 0 to 0.5)
            // For lower slabs, use bottom half of texture (v from 0.5 to 1)
            if (isUpperSlab) {
                v = v * 0.5; // map v from [0,1] to [0,0.5]
            } else {
                v = v * 0.5 + 0.5; // map v from [0,1] to [0.5,1]
            }
            uvs.setY(i, v);
        }
    }
    
    // Move the slab up or down by 0.125 blocks
    geometry.translate(0, isUpperSlab ? 0.25 : -0.25, 0);
    
    // Cache the geometry
    slabGeometryCache.set(cacheKey, geometry);
    
    console.log(`✨ Created ${isUpperSlab ? 'upper' : 'lower'} slab geometry`);
    return geometry;
}

/**
 * Check if a block type is a slab
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a slab
 */
export function isSlabBlock(blockType) {
    return blockType.includes('_slab') || blockType === 'slab';
}

/**
 * Clear the slab geometry cache
 */
export function clearSlabGeometryCache() {
    slabGeometryCache.clear();
}