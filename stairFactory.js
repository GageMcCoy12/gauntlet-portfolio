/**
 * Stair Factory
 * Contains functions for creating stair blocks
 */

import * as THREE from 'three';
import { BLOCK_PROPERTIES, SPECIAL_TEXTURE_MAPPINGS } from './blockData.js';
import { loadTexture, getTexturePath, stripWaxedPrefix } from './textureManager.js';
import { 
    createUniformMaterial, 
    createMultiFaceMaterial,
    createFallbackMaterial 
} from './materialFactory.js';

// Cache for stair geometries
const stairGeometryCache = new Map();

/**
 * Create a stair block mesh
 * @param {string} blockType - The type of stair block
 * @param {Object} options - Options for stair creation (facing direction, etc.)
 * @returns {Promise<THREE.Mesh>} - Promise that resolves to the stair mesh
 */
export async function createStairBlock(blockType, options = {}) {
    try {
        console.log(`Creating spruce stair: ${blockType}`, options);
        
        // Get the geometry based on facing direction
        const facing = options.facing || 'east';
        const half = options.half || 'bottom';
        const shape = options.shape || 'straight';
        
        // Get base geometry (always facing east)
        const geometry = getStairGeometry('east');
        
        // Load the spruce planks texture
        const texture = await loadTexture('textures/blocks/planks_spruce.png');
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        
        // Create material with the spruce texture
        const material = new THREE.MeshStandardMaterial({ 
            map: texture,
            side: THREE.DoubleSide,
            roughness: 1.0,
            metalness: 0.0
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = blockType;
        
        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Apply rotations based on facing direction
        switch (facing) {
            case 'north':
                mesh.rotation.y = Math.PI;
                break;
            case 'south':
                mesh.rotation.y = 0;
                break;
            case 'west':
                mesh.rotation.y = Math.PI * 1.5;
                break;
            case 'east':
                mesh.rotation.y = Math.PI * 0.5;
                break;
        }
        
        // If it's a top half stair, rotate it 180 degrees around the X axis
        if (half === 'top') {
            mesh.rotation.x = Math.PI;
        }
        
        // TODO: Handle shape (straight, inner_left, inner_right, outer_left, outer_right)
        // For now we only handle straight stairs
        
        console.log(`Created spruce stair: ${blockType} facing ${facing}, half ${half}`);
        return mesh;
    } catch (error) {
        console.error(`Error creating spruce stair ${blockType}:`, error);
        return createFallbackMesh(blockType);
    }
}

/**
 * Get the base block type from a stair name
 * @param {string} stairType - The stair block type
 * @returns {string} - The base block type
 */
function getBaseBlockType(stairType) {
    console.log(`Getting base block type for stair: ${stairType}`);
    
    // Strip 'waxed_' prefix if present
    stairType = stripWaxedPrefix(stairType);
    
    // Remove the "stairs" suffix if present
    if (stairType.endsWith('_stairs')) {
        return stairType.replace('_stairs', '');
    }
    
    // Handle special cases
    const specialCases = {
        'stone_stairs': 'stone',
        'sandstone_stairs': 'sandstone',
        'cobblestone_stairs': 'cobblestone',
        'brick_stairs': 'brick',
        'stone_brick_stairs': 'stone_bricks',
        'nether_brick_stairs': 'nether_bricks',
        'quartz_stairs': 'quartz_block',
        'red_sandstone_stairs': 'red_sandstone',
        'purpur_stairs': 'purpur_block',
        'prismarine_stairs': 'prismarine',
        'prismarine_brick_stairs': 'prismarine_bricks',
        'dark_prismarine_stairs': 'dark_prismarine',
        'polished_granite_stairs': 'polished_granite',
        'smooth_red_sandstone_stairs': 'smooth_red_sandstone',
        'mossy_stone_brick_stairs': 'mossy_stone_bricks',
        'polished_diorite_stairs': 'polished_diorite',
        'mossy_cobblestone_stairs': 'mossy_cobblestone',
        'end_stone_brick_stairs': 'end_stone_bricks',
        'smooth_sandstone_stairs': 'smooth_sandstone',
        'smooth_quartz_stairs': 'smooth_quartz',
        'granite_stairs': 'granite',
        'andesite_stairs': 'andesite',
        'red_nether_brick_stairs': 'red_nether_bricks',
        'polished_andesite_stairs': 'polished_andesite',
        'diorite_stairs': 'diorite',
        'crimson_stairs': 'crimson_planks',
        'warped_stairs': 'warped_planks',
        'blackstone_stairs': 'blackstone',
        'polished_blackstone_stairs': 'polished_blackstone',
        'polished_blackstone_brick_stairs': 'polished_blackstone_bricks',
        'cut_copper_stairs': 'cut_copper',
        'exposed_cut_copper_stairs': 'exposed_cut_copper',
        'weathered_cut_copper_stairs': 'weathered_cut_copper',
        'oxidized_cut_copper_stairs': 'oxidized_cut_copper',
        'cobbled_deepslate_stairs': 'cobbled_deepslate',
        'polished_deepslate_stairs': 'polished_deepslate',
        'deepslate_brick_stairs': 'deepslate_bricks',
        'deepslate_tile_stairs': 'deepslate_tiles',
        'mangrove_stairs': 'mangrove_planks',
        'mud_brick_stairs': 'mud_bricks',
        'bamboo_stairs': 'bamboo_planks',
        'bamboo_mosaic_stairs': 'bamboo_mosaic',
        'cherry_stairs': 'cherry_planks'
    };
    
    if (specialCases[stairType]) {
        const baseType = specialCases[stairType];
        console.log(`Found special case for ${stairType}: ${baseType}`);
        return baseType;
    }
    
    // For wood stairs, convert to planks
    if (stairType.includes('_stairs') && (
        stairType.includes('oak') || 
        stairType.includes('spruce') || 
        stairType.includes('birch') || 
        stairType.includes('jungle') || 
        stairType.includes('acacia') || 
        stairType.includes('dark_oak')
    )) {
        const planksType = stairType.replace('_stairs', '_planks');
        console.log(`Converting wood stairs ${stairType} to planks: ${planksType}`);
        return planksType;
    }
    
    // Default fallback
    console.log(`No special case found for ${stairType}, using as is`);
    return stairType;
}

/**
 * Load textures for a stair block
 * @param {string} stairType - The stair block type
 * @param {string} baseBlockType - The base block type
 * @returns {Promise<Object>} - Promise that resolves to an object containing the loaded textures
 */
async function loadStairTextures(stairType, baseBlockType) {
    try {
        console.log(`TEMPORARY FIX: Forcing all stairs to use spruce textures for testing`);
        
        // TEMPORARY: Force all stairs to use spruce planks texture
        const spruceTexturePath = `textures/blocks/planks_spruce.png`;
        console.log(`Using temporary spruce texture: ${spruceTexturePath}`);
        
        try {
            const texture = await loadTexture(spruceTexturePath);
            return { texture };
        } catch (e) {
            console.error(`Failed to load spruce texture: ${e.message}`);
            // Fallback to a simple texture path if planks_spruce.png doesn't exist
            const fallbackPath = `textures/blocks/planks_spruce.png`;
            console.log(`Trying fallback texture: ${fallbackPath}`);
            try {
                const texture = await loadTexture(fallbackPath);
                return { texture };
            } catch (e2) {
                console.error(`Failed to load fallback texture: ${e2.message}`);
                // Create a magenta fallback texture to make it obvious
                const fallbackTexture = createFallbackTexture();
                return { texture: fallbackTexture };
            }
        }
        
        // Original code is commented out for now
        /*
        // Check if there are special texture mappings for this stair
        if (SPECIAL_TEXTURE_MAPPINGS[stairType]) {
            const mapping = SPECIAL_TEXTURE_MAPPINGS[stairType];
            console.log(`Found special mapping for ${stairType}:`, JSON.stringify(mapping, null, 2));
            
            // If the stair has specific top/bottom/side textures
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
        
        // For stairs, we directly use the base block textures instead of looking for stair-specific textures
        try {
            console.log(`Loading base block textures for ${baseBlockType}`);
            
            // Try to load top/bottom/side textures for the base block
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
                console.log(`Failed to load base block textures with top/bottom/side: ${e.message}`);
                console.log(`Using uniform texture for ${baseBlockType}`);
                // If top/bottom/side textures fail, use a uniform texture
                const texturePath = getTexturePath(baseBlockType);
                console.log(`Uniform texture path: ${texturePath}`);
                const texture = await loadTexture(texturePath);
                return { texture };
            }
        } catch (error) {
            console.error(`Error loading textures for stair ${stairType}:`, error);
            
            // Return a fallback texture
            const fallbackTexture = createFallbackTexture();
            return { texture: fallbackTexture };
        }
        */
    } catch (error) {
        console.error(`Error loading textures for stair ${stairType}:`, error);
        
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
 * Get a stair geometry (cached)
 * @param {string} facing - The direction the stair is facing ('north', 'south', 'east', 'west')
 * @returns {THREE.BufferGeometry} - The stair geometry
 */
function getStairGeometry(facing = 'east') {
    const cacheKey = `stair_${facing}`;
    
    // Check if geometry is already in cache
    if (stairGeometryCache.has(cacheKey)) {
        return stairGeometryCache.get(cacheKey);
    }
    
    // Create a new geometry for stairs
    const geometry = new THREE.BufferGeometry();
    
    // Define vertices for a stair block
    const vertices = [
        // Bottom half (full block)
        // Front face
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
         0.5,  0.0, -0.5,
        -0.5,  0.0, -0.5,
        
        // Back face
        -0.5, -0.5,  0.5,
         0.5, -0.5,  0.5,
         0.5,  0.0,  0.5,
        -0.5,  0.0,  0.5,
        
        // Left face
        -0.5, -0.5, -0.5,
        -0.5,  0.0, -0.5,
        -0.5,  0.0,  0.5,
        -0.5, -0.5,  0.5,
        
        // Right face
         0.5, -0.5, -0.5,
         0.5,  0.0, -0.5,
         0.5,  0.0,  0.5,
         0.5, -0.5,  0.5,
        
        // Top face
        -0.5,  0.0, -0.5,
         0.5,  0.0, -0.5,
         0.5,  0.0,  0.5,
        -0.5,  0.0,  0.5,
        
        // Bottom face
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
         0.5, -0.5,  0.5,
        -0.5, -0.5,  0.5,
        
        // Top half (half block)
        // Front face
        -0.5,  0.0, -0.5,
         0.0,  0.0, -0.5,
         0.0,  0.5, -0.5,
        -0.5,  0.5, -0.5,
        
        // Back face
        -0.5,  0.0,  0.5,
         0.0,  0.0,  0.5,
         0.0,  0.5,  0.5,
        -0.5,  0.5,  0.5,
        
        // Left face
        -0.5,  0.0, -0.5,
        -0.5,  0.5, -0.5,
        -0.5,  0.5,  0.5,
        -0.5,  0.0,  0.5,
        
        // Right face
         0.0,  0.0, -0.5,
         0.0,  0.5, -0.5,
         0.0,  0.5,  0.5,
         0.0,  0.0,  0.5,
        
        // Top face
        -0.5,  0.5, -0.5,
         0.0,  0.5, -0.5,
         0.0,  0.5,  0.5,
        -0.5,  0.5,  0.5
    ];
    
    // Define UVs for texture mapping
    const uvs = [
        // Bottom half (full block)
        // Front face
        0.0, 1.0,  1.0, 1.0,  1.0, 0.5,  0.0, 0.5,
        // Back face
        1.0, 1.0,  0.0, 1.0,  0.0, 0.5,  1.0, 0.5,
        // Left face
        0.0, 1.0,  0.0, 0.5,  1.0, 0.5,  1.0, 1.0,
        // Right face
        1.0, 1.0,  1.0, 0.5,  0.0, 0.5,  0.0, 1.0,
        // Top face
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        // Bottom face
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        
        // Top half (half block)
        // Front face
        0.0, 0.5,  0.5, 0.5,  0.5, 0.0,  0.0, 0.0,
        // Back face
        0.5, 0.5,  0.0, 0.5,  0.0, 0.0,  0.5, 0.0,
        // Left face
        0.0, 0.5,  0.0, 0.0,  1.0, 0.0,  1.0, 0.5,
        // Right face
        0.5, 0.5,  0.5, 0.0,  0.0, 0.0,  0.0, 0.5,
        // Top face
        0.0, 0.0,  0.5, 0.0,  0.5, 1.0,  0.0, 1.0
    ];
    
    // Create indices for triangles (6 faces for bottom, 5 faces for top)
    const indices = [];
    
    // For each quad (4 vertices), create 2 triangles
    for (let i = 0; i < vertices.length / 12; i++) {
        const baseIndex = i * 4;
        // First triangle
        indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        // Second triangle
        indices.push(baseIndex, baseIndex + 2, baseIndex + 3);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
    // Compute vertex normals
    geometry.computeVertexNormals();
    
    // Cache the geometry
    stairGeometryCache.set(cacheKey, geometry);
    
    return geometry;
}

/**
 * Check if a block type is a stair
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a stair
 */
export function isStairBlock(blockType) {
    return blockType.includes('_stairs') || blockType === 'stairs';
}

/**
 * Clear the stair geometry cache
 */
export function clearStairGeometryCache() {
    stairGeometryCache.clear();
} 