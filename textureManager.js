/**
 * Texture Manager
 * Handles loading, caching, and retrieving textures
 */

import * as THREE from 'three';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
import { 
    TEXTURE_NAME_MAPPINGS, 
    SPECIAL_TEXTURE_MAPPINGS, 
    BLOCK_CATEGORIES_FALLBACKS,
    LEAF_TEXTURE_MAPPINGS,
    BLOCK_CATEGORIES
} from './blockData.js';

// Cache for loaded textures
const textureCache = new Map();
const tgaLoader = new TGALoader();

/**
 * Strip the 'waxed_' prefix from a block type if present
 * @param {string} blockType - The block type to process
 * @returns {string} - The block type without the 'waxed_' prefix
 */
export function stripWaxedPrefix(blockType) {
    if (blockType.startsWith('waxed_')) {
        console.log(`Stripping 'waxed_' prefix from ${blockType}`);
        return blockType.substring(6);
    }
    return blockType;
}

/**
 * Load a texture from the given path
 * @param {string} path - Path to the texture
 * @returns {Promise<THREE.Texture>} - Promise that resolves to the loaded texture
 */
export function loadTexture(path) {
    // Check if texture is already in cache
    if (textureCache.has(path)) {
        return Promise.resolve(textureCache.get(path));
    }
    
    // Determine if this is a TGA file
    const isTGA = typeof path === 'string' && path.toLowerCase().endsWith('.tga');
    
    return new Promise((resolve, reject) => {
        if (isTGA) {
            // Use TGA loader for TGA files
            tgaLoader.load(
                path,
                (texture) => {
                    // Configure texture
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    
                    // For grass side texture, ensure alphaTest works correctly
                    if (typeof path === 'string' && path.includes('grass_side')) {
                        texture.alphaTest = 0.1;
                    }
                    
                    // Cache the texture
                    textureCache.set(path, texture);
                    
                    // Resolve the promise
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Error loading TGA texture ${path}:`, error);
                    reject(error);
                }
            );
        } else {
            // Use standard texture loader for other formats
            const loader = new THREE.TextureLoader();
            
            loader.load(
                path,
                (texture) => {
                    // Configure texture
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    
                    // For grass side texture, ensure alphaTest works correctly
                    if (typeof path === 'string' && path.includes('grass_side')) {
                        texture.alphaTest = 0.5;
                    }
                    
                    // Cache the texture
                    textureCache.set(path, texture);
                    
                    // Resolve the promise
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Error loading texture ${path}:`, error);
                    reject(error);
                }
            );
        }
    });
}

/**
 * Get the texture path for a block
 * @param {string} blockType - The type of block
 * @param {string} face - The face of the block (top, bottom, side)
 * @returns {string} - The path to the texture
 */
export function getTexturePath(blockType, face = 'side') {
    // Debug logging
    console.log(`Getting texture path for: ${blockType}, face: ${face}`);
    
    // Strip 'waxed_' prefix if present
    const unwaxedBlockType = stripWaxedPrefix(blockType);
    if (unwaxedBlockType !== blockType) {
        console.log(`Using unwaxed block type: ${unwaxedBlockType} for texture lookup`);
        blockType = unwaxedBlockType;
    }
    
    // Check for leaf blocks which use TGA format
    if (blockType.includes('leaves') && LEAF_TEXTURE_MAPPINGS[blockType]) {
        return `textures/blocks/${LEAF_TEXTURE_MAPPINGS[blockType]}`;
    }
    
    // Handle double plant parts
    if (blockType.includes('double_plant')) {
        // Extract the plant type (grass, fern, etc.)
        let plantType = 'grass'; // Default
        const parts = blockType.split('_');
        if (parts.length > 2) {
            plantType = parts[2];
        }
        
        // Check if it's a top or bottom part
        if (blockType.includes('_top')) {
            return `textures/blocks/double_plant_${plantType}_top.tga`;
        } else if (blockType.includes('_bottom')) {
            return `textures/blocks/double_plant_${plantType}_bottom.tga`;
        } else {
            // If it's just 'double_plant_grass' without top/bottom, default to bottom
            return `textures/blocks/double_plant_${plantType}_bottom.tga`;
        }
    }
    
    // Handle slab blocks specifically
    if (blockType.includes('_slab') || blockType === 'slab') {
        console.log(`Processing slab texture: ${blockType}, face: ${face}`);
        
        // If it's a generic 'slab', we need to be careful not to default to stone
        if (blockType === 'slab') {
            console.log(`WARNING: Generic 'slab' type detected. This should have been converted to a specific type.`);
            console.log(`Using fallback texture for generic slab to make the issue visible.`);
            // Return a distinctive texture to make it obvious there's an issue
            return `textures/blocks/magenta_wool.png`;
        }
        
        // Check for special case mappings for slabs
        if (SPECIAL_TEXTURE_MAPPINGS[blockType]) {
            if (SPECIAL_TEXTURE_MAPPINGS[blockType][face]) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType][face]}`;
                console.log(`Using special mapping for slab: ${texturePath}`);
                return texturePath;
            } else if (SPECIAL_TEXTURE_MAPPINGS[blockType]['default']) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType]['default']}`;
                console.log(`Using default special mapping for slab: ${texturePath}`);
                return texturePath;
            }
        }
        
        // For wooden slabs, convert to planks texture
        if (blockType.includes('oak_slab') || 
            blockType.includes('spruce_slab') || 
            blockType.includes('birch_slab') || 
            blockType.includes('jungle_slab') || 
            blockType.includes('acacia_slab') || 
            blockType.includes('dark_oak_slab') ||
            blockType.includes('crimson_slab') ||
            blockType.includes('warped_slab') ||
            blockType.includes('mangrove_slab') ||
            blockType.includes('bamboo_slab') ||
            blockType.includes('cherry_slab')) {
            
            // Convert slab to planks
            const planksType = blockType.replace('_slab', '_planks');
            
            // Check if there's a special mapping for the planks
            if (SPECIAL_TEXTURE_MAPPINGS[planksType] && SPECIAL_TEXTURE_MAPPINGS[planksType]['default']) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[planksType]['default']}`;
                console.log(`Using planks texture for wooden slab: ${texturePath}`);
                return texturePath;
            }
            
            // Try standard planks naming
            const texturePath = `textures/blocks/${planksType}.png`;
            console.log(`Using standard planks texture for wooden slab: ${texturePath}`);
            return texturePath;
        }
        
        // For stone-type slabs, try to find the base block texture
        const baseBlockType = blockType.replace('_slab', '');
        console.log(`Looking for base block texture for ${blockType}, base type: ${baseBlockType}`);
        
        // Check if there's a special mapping for the base block
        if (SPECIAL_TEXTURE_MAPPINGS[baseBlockType]) {
            if (SPECIAL_TEXTURE_MAPPINGS[baseBlockType][face]) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[baseBlockType][face]}`;
                console.log(`Using base block special mapping for slab: ${texturePath}`);
                return texturePath;
            } else if (SPECIAL_TEXTURE_MAPPINGS[baseBlockType]['default']) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[baseBlockType]['default']}`;
                console.log(`Using base block default special mapping for slab: ${texturePath}`);
                return texturePath;
            }
        }
        
        // Try direct base block texture
        console.log(`Trying direct base block texture: textures/blocks/${baseBlockType}.png`);
        return `textures/blocks/${baseBlockType}.png`;
    }
    
    // Handle wall blocks specifically
    if (blockType.includes('_wall') || blockType === 'wall') {
        console.log(`Processing wall texture: ${blockType}, face: ${face}`);
        
        // If it's a generic 'wall', we need to be careful not to default to cobblestone
        if (blockType === 'wall') {
            console.log(`WARNING: Generic 'wall' type detected. This should have been converted to a specific type.`);
            console.log(`Using fallback texture for generic wall.`);
            return `textures/blocks/cobblestone.png`;
        }
        
        // Check for special case mappings for walls
        if (SPECIAL_TEXTURE_MAPPINGS[blockType]) {
            if (SPECIAL_TEXTURE_MAPPINGS[blockType][face]) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType][face]}`;
                console.log(`Using special mapping for wall: ${texturePath}`);
                return texturePath;
            } else if (SPECIAL_TEXTURE_MAPPINGS[blockType]['default']) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType]['default']}`;
                console.log(`Using default special mapping for wall: ${texturePath}`);
                return texturePath;
            }
        }
        
        // For walls, try to find the base block texture
        const baseBlockType = blockType.replace('_wall', '');
        console.log(`Looking for base block texture for ${blockType}, base type: ${baseBlockType}`);
        
        // Check if there's a special mapping for the base block
        if (SPECIAL_TEXTURE_MAPPINGS[baseBlockType]) {
            if (SPECIAL_TEXTURE_MAPPINGS[baseBlockType][face]) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[baseBlockType][face]}`;
                console.log(`Using base block special mapping for wall: ${texturePath}`);
                return texturePath;
            } else if (SPECIAL_TEXTURE_MAPPINGS[baseBlockType]['default']) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[baseBlockType]['default']}`;
                console.log(`Using base block default special mapping for wall: ${texturePath}`);
                return texturePath;
            }
        }
        
        // Try direct base block texture
        console.log(`Trying direct base block texture: textures/blocks/${baseBlockType}.png`);
        return `textures/blocks/${baseBlockType}.png`;
    }
    
    // Handle fence blocks specifically
    if (blockType.includes('_fence') && !blockType.includes('gate')) {
        console.log(`Processing fence texture: ${blockType}, face: ${face}`);
        
        // If it's a generic 'fence', we need to be careful not to default to oak
        if (blockType === 'fence') {
            console.log(`WARNING: Generic 'fence' type detected. This should have been converted to a specific type.`);
            console.log(`Using fallback texture for generic fence.`);
            return `textures/blocks/planks_oak.png`;
        }
        
        // Check for special case mappings for fences
        if (SPECIAL_TEXTURE_MAPPINGS[blockType]) {
            if (SPECIAL_TEXTURE_MAPPINGS[blockType][face]) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType][face]}`;
                console.log(`Using special mapping for fence: ${texturePath}`);
                return texturePath;
            } else if (SPECIAL_TEXTURE_MAPPINGS[blockType]['default']) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType]['default']}`;
                console.log(`Using default special mapping for fence: ${texturePath}`);
                return texturePath;
            }
        }
        
        // For wooden fences, convert to planks texture
        const planksType = blockType.replace('_fence', '_planks');
        
        // Check if there's a special mapping for the planks
        if (SPECIAL_TEXTURE_MAPPINGS[planksType] && SPECIAL_TEXTURE_MAPPINGS[planksType]['default']) {
            const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[planksType]['default']}`;
            console.log(`Using planks texture for wooden fence: ${texturePath}`);
            return texturePath;
        }
        
        // Try standard planks naming
        const texturePath = `textures/blocks/${planksType}.png`;
        console.log(`Using standard planks texture for wooden fence: ${texturePath}`);
        return texturePath;
    }
    
    // Handle trapdoor blocks specifically
    if (blockType.includes('_trapdoor') || blockType === 'trapdoor') {
        console.log(`Processing trapdoor texture: ${blockType}, face: ${face}`);
        
        // If it's a generic 'trapdoor', we need to be careful not to default to oak
        if (blockType === 'trapdoor') {
            console.log(`WARNING: Generic 'trapdoor' type detected, using 'oak_trapdoor' texture.`);
            return 'textures/blocks/oak_trapdoor.png'; // Default oak trapdoor texture
        }
        
        // Check for special case mappings for trapdoors
        if (SPECIAL_TEXTURE_MAPPINGS[blockType]) {
            if (SPECIAL_TEXTURE_MAPPINGS[blockType][face]) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType][face]}`;
                console.log(`Using special mapping for trapdoor: ${texturePath}`);
                return texturePath;
            } else if (SPECIAL_TEXTURE_MAPPINGS[blockType]['default']) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType]['default']}`;
                console.log(`Using default special mapping for trapdoor: ${texturePath}`);
                return texturePath;
            }
        }
        
        // Use material_trapdoor.png naming scheme directly
        console.log(`Using trapdoor texture: textures/blocks/${blockType}.png`);
        return `textures/blocks/${blockType}.png`;
    }
    
    // Handle door blocks specifically
    if (blockType === 'door' || (blockType.endsWith('_door') && !blockType.includes('trapdoor'))) {
        console.log(`Processing door texture: ${blockType}, face: ${face}`);
        
        // If it's a generic 'door', we need to be careful not to default to oak
        if (blockType === 'door') {
            console.log(`WARNING: Generic 'door' type detected, using dark oak door texture.`);
            return `textures/blocks/door_dark_oak_${face}.png`; // Default dark oak door texture
        }
        
        // Check for special case mappings for doors
        if (SPECIAL_TEXTURE_MAPPINGS[blockType]) {
            if (SPECIAL_TEXTURE_MAPPINGS[blockType][face]) {
                const texturePath = `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType][face]}`;
                console.log(`Using special mapping for door: ${texturePath}`);
                return texturePath;
            }
        }
        
        // Use material_door_lower/upper.png naming scheme directly
        const texturePath = `textures/blocks/${blockType}_${face}.png`;
        console.log(`Using door texture: ${texturePath}`);
        return texturePath;
    }
    
    // Check for special case mappings
    if (SPECIAL_TEXTURE_MAPPINGS[blockType]) {
        if (SPECIAL_TEXTURE_MAPPINGS[blockType][face]) {
            return `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType][face]}`;
        } else if (SPECIAL_TEXTURE_MAPPINGS[blockType]['default']) {
            return `textures/blocks/${SPECIAL_TEXTURE_MAPPINGS[blockType]['default']}`;
        }
    }
    
    // Check for texture mappings
    if (TEXTURE_NAME_MAPPINGS[blockType]) {
        return `textures/blocks/${TEXTURE_NAME_MAPPINGS[blockType]}`;
    }
    
    // Check for fallback categories
    for (const [pattern, blocks] of Object.entries(BLOCK_CATEGORIES_FALLBACKS)) {
        if (blocks.includes(blockType) || blockType.includes(pattern)) {
            return `textures/blocks/${blockType}_${face}.png`;
        }
    }
    
    // Default fallback
    return `textures/blocks/${blockType}.png`;
}

/**
 * Load textures for a block
 * @param {string} blockType - The type of block
 * @param {string} category - The category of the block
 * @returns {Promise<Object>} - Promise that resolves to an object containing the loaded textures
 */
export async function loadBlockTextures(blockType, category) {
    try {
        switch (category) {
            case BLOCK_CATEGORIES.uniform:
                // Uniform blocks have the same texture on all sides
                const uniformTexture = await loadTexture(getTexturePath(blockType));
                return { texture: uniformTexture };
                
            case BLOCK_CATEGORIES.tbs:
                // Top-bottom-sides blocks have different textures for top, bottom, and sides
                const topTexture = await loadTexture(getTexturePath(blockType, 'top'));
                const bottomTexture = await loadTexture(getTexturePath(blockType, 'bottom'));
                const sideTexture = await loadTexture(getTexturePath(blockType, 'side'));
                return { topTexture, bottomTexture, sideTexture };
                
            case BLOCK_CATEGORIES.directional:
                // Directional blocks have different textures for ends and sides
                const endTexture = await loadTexture(getTexturePath(blockType, 'end'));
                const dirSideTexture = await loadTexture(getTexturePath(blockType, 'side'));
                return { endTexture, sideTexture: dirSideTexture };
                
            case BLOCK_CATEGORIES.leaves:
                // Leaf blocks have a special texture
                const leafTexture = await loadTexture(getTexturePath(blockType));
                return { texture: leafTexture };
                
            case BLOCK_CATEGORIES.wall:
                // Wall blocks use a single texture for all parts
                const wallTexture = await loadTexture(getTexturePath(blockType));
                console.log(`Loaded wall texture for ${blockType}`);
                return { texture: wallTexture };
                
            case BLOCK_CATEGORIES.fence:
                // Fence blocks use a single texture for all parts
                const fenceTexture = await loadTexture(getTexturePath(blockType));
                console.log(`Loaded fence texture for ${blockType}`);
                return { texture: fenceTexture };
                
            case BLOCK_CATEGORIES.trapdoor:
                // Trapdoor blocks use a single texture
                const trapdoorTexture = await loadTexture(getTexturePath(blockType));
                console.log(`Loaded trapdoor texture for ${blockType}`);
                return { texture: trapdoorTexture };
                
            case BLOCK_CATEGORIES.door:
                // Door blocks use separate textures for upper and lower parts
                const lowerTexture = await loadTexture(getTexturePath(blockType, 'lower'));
                const upperTexture = await loadTexture(getTexturePath(blockType, 'upper'));
                console.log(`Loaded door textures for ${blockType}`);
                return { lowerTexture, upperTexture };
                
            default:
                // Default to uniform texture
                const defaultTexture = await loadTexture(getTexturePath(blockType));
                return { texture: defaultTexture };
        }
    } catch (error) {
        console.error(`Error loading textures for ${blockType}:`, error);
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
 * Clear the texture cache
 */
export function clearTextureCache() {
    textureCache.clear();
}

/**
 * Get the size of the texture cache
 * @returns {number} - The number of textures in the cache
 */
export function getTextureCacheSize() {
    return textureCache.size;
} 