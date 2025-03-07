// Script to identify and list unused texture files based on world_data.json
// Run with: node cleanupTextures.js

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

async function cleanupTextures() {
    console.log('🧹 Starting texture cleanup analysis...');
    
    try {
        // Load the world data
        const worldDataPath = path.join(__dirname, 'world_data.json');
        const worldDataRaw = await readFileAsync(worldDataPath, 'utf8');
        const worldData = JSON.parse(worldDataRaw);
        
        if (!worldData.stats || !worldData.stats.block_counts) {
            throw new Error('No block counts found in world_data.json');
        }
        
        // Get the block types used in the world
        const usedBlockTypes = Object.keys(worldData.stats.block_counts);
        console.log('🧱 Block types used in world:', usedBlockTypes);
        
        // Categories to always keep (these are used by multiple block types)
        const essentialCategories = [
            'stone', 'wood', 'planks', 'dirt', 'grass', 'leaves', 
            'log', 'wool', 'concrete', 'glass', 'water'
        ];
        
        // Special textures to always keep
        const essentialTextures = [
            'missing', 'error', 'default', 'particle', 
            'grass_top', 'grass_side', 'dirt', 'stone'
        ];
        
        // Mapping of block types to their texture names (when different)
        const blockToTextureMap = {
            // Plants and vegetation
            'double_plant': ['double_grass', 'double_fern', 'double_rose', 'large_fern', 'lilac', 'peony', 'rose_bush', 'sunflower', 'tall_grass'],
            'plant': ['grass', 'fern', 'dead_bush', 'sapling', 'flower', 'dandelion', 'poppy', 'blue_orchid', 'allium', 'azure_bluet', 'red_tulip', 'orange_tulip', 'white_tulip', 'pink_tulip', 'oxeye_daisy', 'cornflower', 'lily_of_the_valley'],
            'sweet_berry_bush': ['sweet_berry_bush', 'sweet_berries'],
            
            // Blocks with multiple states
            'grass_block': ['grass_block', 'grass_block_side', 'grass_block_snow', 'grass_top', 'grass_side', 'grass_path', 'grass_path_top', 'grass_path_side'],
            'campfire': ['campfire', 'campfire_log', 'campfire_fire', 'campfire_lit'],
            
            // Redstone components
            'button': ['stone_button', 'oak_button', 'spruce_button', 'birch_button', 'jungle_button', 'acacia_button', 'dark_oak_button'],
            
            // Containers and functional blocks
            'chest': ['chest', 'ender_chest', 'trapped_chest'],
            'barrel': ['barrel', 'barrel_top', 'barrel_bottom', 'barrel_side'],
            'composter': ['composter', 'composter_top', 'composter_bottom', 'composter_side'],
            
            // Decorative blocks
            'cobweb': ['cobweb', 'web'],
            'lantern': ['lantern', 'soul_lantern'],
            
            // Misc blocks
            'grindstone': ['grindstone', 'grindstone_pivot', 'grindstone_round', 'grindstone_side'],
            'crafting_table': ['crafting_table', 'crafting_table_top', 'crafting_table_front', 'crafting_table_side'],
            'torch': ['torch', 'torch_on', 'wall_torch']
        };
        
        // Create a list of textures to keep based on block types
        const texturesToKeep = new Set();
        
        // Add essential textures
        essentialTextures.forEach(texture => texturesToKeep.add(texture));
        
        // Add textures for each block type
        usedBlockTypes.forEach(blockType => {
            // Add the block type itself
            texturesToKeep.add(blockType);
            
            // Add common variations
            texturesToKeep.add(`${blockType}_top`);
            texturesToKeep.add(`${blockType}_bottom`);
            texturesToKeep.add(`${blockType}_side`);
            texturesToKeep.add(`${blockType}_front`);
            texturesToKeep.add(`${blockType}_back`);
            
            // Add mapped textures if this block type has special texture names
            if (blockToTextureMap[blockType]) {
                blockToTextureMap[blockType].forEach(textureName => {
                    texturesToKeep.add(textureName);
                    // Also add common variations of the mapped texture
                    texturesToKeep.add(`${textureName}_top`);
                    texturesToKeep.add(`${textureName}_bottom`);
                    texturesToKeep.add(`${textureName}_side`);
                });
            }
            
            // Handle special cases
            if (blockType === 'log') {
                ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak'].forEach(wood => {
                    texturesToKeep.add(`${wood}_log`);
                    texturesToKeep.add(`${wood}_log_top`);
                    texturesToKeep.add(`${wood}_log_side`);
                });
            }
            
            if (blockType === 'planks') {
                ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak'].forEach(wood => {
                    texturesToKeep.add(`${wood}_planks`);
                });
            }
            
            if (blockType === 'leaves') {
                ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak'].forEach(wood => {
                    texturesToKeep.add(`${wood}_leaves`);
                });
            }
            
            if (blockType === 'stairs') {
                ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'stone', 'cobblestone'].forEach(material => {
                    texturesToKeep.add(`${material}_stairs`);
                });
            }
            
            if (blockType === 'slab') {
                ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'stone', 'cobblestone'].forEach(material => {
                    texturesToKeep.add(`${material}_slab`);
                    texturesToKeep.add(`${material}_slab_top`);
                    texturesToKeep.add(`${material}_slab_side`);
                });
            }
            
            if (blockType === 'trapdoor') {
                ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'iron'].forEach(material => {
                    texturesToKeep.add(`${material}_trapdoor`);
                });
            }
            
            if (blockType === 'door') {
                ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'iron'].forEach(material => {
                    texturesToKeep.add(`${material}_door_top`);
                    texturesToKeep.add(`${material}_door_bottom`);
                });
            }
            
            if (blockType === 'fence') {
                ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak'].forEach(wood => {
                    texturesToKeep.add(`${wood}_fence`);
                });
            }
            
            if (blockType === 'wall') {
                ['cobblestone', 'mossy_cobblestone', 'stone_brick', 'mossy_stone_brick', 'andesite', 'diorite', 'granite', 'sandstone', 'red_sandstone', 'brick', 'prismarine', 'nether_brick', 'red_nether_brick', 'end_stone_brick'].forEach(material => {
                    texturesToKeep.add(`${material}_wall`);
                });
            }
            
            if (blockType === 'wool' || blockType === 'concrete' || blockType === 'concrete_powder') {
                ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 
                 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'].forEach(color => {
                    texturesToKeep.add(`${color}_${blockType}`);
                });
            }
        });
        
        // Add textures from blockData.js if available
        try {
            const blockDataPath = path.join(__dirname, 'blockData.js');
            const blockDataCode = await readFileAsync(blockDataPath, 'utf8');
            
            // Extract texture names from TEXTURE_NAME_MAPPINGS and SPECIAL_TEXTURE_MAPPINGS
            const textureMapRegex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
            let match;
            
            while ((match = textureMapRegex.exec(blockDataCode)) !== null) {
                // Add both the key and value as potential texture names
                texturesToKeep.add(match[1]);
                texturesToKeep.add(match[2]);
            }
            
            console.log('📚 Added texture names from blockData.js');
        } catch (e) {
            console.log('Could not fetch blockData.js:', e.message);
        }
        
        console.log('✅ Textures to keep:', Array.from(texturesToKeep).sort());
        
        // Create a list of all texture files
        const allTextures = await listAllTextures();
        console.log('📋 All textures found:', allTextures.length);
        
        // Find unused textures
        const unusedTextures = allTextures.filter(texture => {
            // Extract the base name without extension
            const baseName = path.basename(texture).split('.')[0];
            
            // Check if any texture to keep is part of this filename
            return !Array.from(texturesToKeep).some(keep => 
                baseName === keep || 
                baseName.includes(keep) || 
                keep.includes(baseName)
            );
        });
        
        console.log('🗑️ Unused textures:', unusedTextures);
        console.log(`Found ${unusedTextures.length} unused textures out of ${allTextures.length} total textures`);
        
        // Write the list of unused textures to a file
        await writeFileAsync('unused_textures.txt', unusedTextures.join('\n'));
        console.log('💾 Saved list of unused textures to unused_textures.txt');
        
        // Create a shell script to delete the unused textures
        let shellScript = '#!/bin/bash\n\n';
        shellScript += '# Script to delete unused texture files\n';
        shellScript += '# Generated by cleanupTextures.js\n\n';
        
        unusedTextures.forEach(texture => {
            shellScript += `rm -f "${texture}"\n`;
        });
        
        await writeFileAsync('delete_unused_textures.sh', shellScript);
        console.log('💾 Saved shell script to delete_unused_textures.sh');
        console.log('⚠️ Make sure to review the list before deleting any files!');
        
        return { 
            kept: Array.from(texturesToKeep).length,
            unused: unusedTextures.length,
            total: allTextures.length
        };
    } catch (error) {
        console.error('❌ Error cleaning up textures:', error);
    }
}

// Helper function to list all texture files
async function listAllTextures() {
    const textureDir = path.join(__dirname, 'textures');
    return await walkDir(textureDir);
}

// Helper function to recursively walk a directory
async function walkDir(dir) {
    const files = [];
    
    try {
        const entries = await readdirAsync(dir);
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stat = await statAsync(fullPath);
            
            if (stat.isDirectory()) {
                const subDirFiles = await walkDir(fullPath);
                files.push(...subDirFiles);
            } else if (isTextureFile(entry)) {
                // Get path relative to the script
                const relativePath = path.relative(__dirname, fullPath);
                files.push(relativePath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }
    
    return files;
}

// Helper function to check if a file is a texture
function isTextureFile(filename) {
    const textureExtensions = ['.png', '.jpg', '.jpeg', '.tga'];
    const ext = path.extname(filename).toLowerCase();
    return textureExtensions.includes(ext);
}

// Run the cleanup function
cleanupTextures().then(result => {
    if (result) {
        console.log(`✅ Texture cleanup complete! Kept: ${result.kept}, Unused: ${result.unused}, Total: ${result.total}`);
    } else {
        console.log('❌ Texture cleanup failed');
    }
}); 