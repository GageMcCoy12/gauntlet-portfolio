/**
 * Block data and texture mappings
 * Contains all static data related to block properties and textures
 */

// Block categories for different texture patterns
export const BLOCK_CATEGORIES = {
    uniform: 'uniform',           // Same texture on all sides (stone, dirt)
    tbs: 'tbs',                   // Different top/bottom/sides (grass, mycelium)
    directional: 'directional',   // Oriented (logs, furnace)
    connected: 'connected',       // Connects to adjacent blocks (glass panes, fences)
    leaves: 'leaves',             // Leaf blocks with transparency and tint
    slab: 'slab',                 // Half-height blocks (slabs)
    wall: 'wall',                 // Wall blocks that connect to adjacent blocks
    fence: 'fence',               // Fence blocks that connect to adjacent blocks
    trapdoor: 'trapdoor',         // Trapdoor blocks with open/closed states
    door: 'door',                 // Door blocks with open/closed states and upper/lower parts
    grindstone: 'grindstone'
};

// Block properties for special rendering characteristics
export const BLOCK_PROPERTIES = {
    // Leaf blocks with consistent green color - lighter tint
    'oak_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'birch_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'spruce_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'jungle_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'acacia_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'dark_oak_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'big_oak_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Alias for dark_oak
    'cherry_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'mangrove_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'azalea_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'flowering_azalea_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'pale_oak_leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 },
    'leaves': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Generic leaves
    
    // Glass and other transparent blocks
    'glass': { transparent: true, alphaCutoff: 0.1 },
    'glass_pane': { transparent: true, alphaCutoff: 0.1 },
    'water': { transparent: true, opacity: 0.7, tintColor: 0x3F76E4 },
    'flowing_water': { transparent: true, opacity: 0.7, tintColor: 0x3F76E4 },
    'seagrass': { transparent: true, alphaCutoff: 0.1, tintColor: 0x3F76E4 },
    
    // Multi-textured blocks with tint - lighter green for grass
    'grass_block': { category: 'tbs', tintColor: 0x4CAF50 }, // Lighter green
    'dirt_path': { category: 'tbs', tintColor: 0xBDB76B },
    'grass_path': { category: 'tbs', tintColor: 0xBDB76B },
    'mycelium': { category: 'tbs', tintColor: 0xA29084 },
    'podzol': { category: 'tbs', tintColor: 0x8B4513 },
    'farmland': { category: 'tbs', tintColor: 0x8B4513 },
    'farmland_moist': { category: 'tbs', tintColor: 0x8B4513 },
    
    // Stone and brick blocks
    'brick': { category: 'uniform' },
    'brick_block': { category: 'uniform' }, // Alternative name for brick
    'stone_bricks': { category: 'uniform' },
    
    // Full block mappings
    'smooth_quartz': { category: 'uniform' },
    'cobbled_deepslate': { category: 'uniform' },
    'hay_block': { category: 'directional' },
    'tuff': { category: 'uniform' },
    'concrete': { category: 'uniform' },
    'nether_wart_block': { category: 'uniform' },
    'honey_block': { category: 'directional' },
    'smooth_basalt': { category: 'uniform' },
    'dark_prismarine': { category: 'uniform' },
    'copper_block': { category: 'uniform' },
    'wool': { category: 'uniform' },
    'log': { category: 'directional' },
    'rooted_dirt': { category: 'uniform' },
    'cactus': { category: 'tbs', transparent: true, alphaCutoff: 0.5 },
    'tinted_glass': { category: 'uniform', transparent: true, alphaCutoff: 0.5 },
    'copper_grate': { category: 'uniform', transparent: true, alphaCutoff: 0.5 },
    'iron_bars': { category: 'uniform', transparent: true, alphaCutoff: 0.5 },
    'dispenser': { category: 'directional' },
    'deepslate': { category: 'uniform' },
    
    // Adding new full blocks
    'mushroom_stem': { category: 'uniform' },
    'stained_glass': { category: 'uniform', transparent: true, alphaCutoff: 0.1 },
    'stained_terracotta': { category: 'uniform' },
    'mossy_cobblestone': { category: 'uniform' },
    'brown_mushroom_block': { category: 'uniform' },
    'mud': { category: 'uniform' },
    'clay': { category: 'uniform' },
    'frosted_ice': { category: 'uniform', transparent: true, alphaCutoff: 0.2 },
    'slime_block': { category: 'uniform', transparent: true, alphaCutoff: 0.2 },
    'polished_blackstone': { category: 'uniform' },
    // Trapdoor blocks
    'oak_trapdoor': { category: 'trapdoor' },
    'spruce_trapdoor': { category: 'trapdoor' },
    'birch_trapdoor': { category: 'trapdoor' },
    'jungle_trapdoor': { category: 'trapdoor' },
    'acacia_trapdoor': { category: 'trapdoor' },
    'dark_oak_trapdoor': { category: 'trapdoor' },
    'crimson_trapdoor': { category: 'trapdoor' },
    'warped_trapdoor': { category: 'trapdoor' },
    'mangrove_trapdoor': { category: 'trapdoor' },
    'bamboo_trapdoor': { category: 'trapdoor' },
    'cherry_trapdoor': { category: 'trapdoor' },
    'iron_trapdoor': { category: 'trapdoor' },
    'trapdoor': { category: 'trapdoor' }, // Generic trapdoor
    
    // Plant blocks with transparency and tint - lighter green
    'plant': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'tallgrass': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'fern': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'large_fern': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'grass': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'double_plant': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'double_plant_grass': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'double_plant_fern': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'double_plant_grass_top': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'double_plant_grass_bottom': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'double_plant_fern_top': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'double_plant_fern_bottom': { transparent: true, alphaCutoff: 0.5, tintColor: 0x4CAF50 }, // Lighter green
    'seagrass': { transparent: true, alphaCutoff: 0.5, tintColor: 0x3F76E4 },
    'kelp': { transparent: true, alphaCutoff: 0.5, tintColor: 0x3F76E4 },
    
    // Crops and other plants (no tint)
    'wheat': { transparent: true, alphaCutoff: 0.5 },
    'sweet_berry_bush': { transparent: true, alphaCutoff: 0.5 },
    'dead_bush': { transparent: true, alphaCutoff: 0.5 },
    'bamboo': { transparent: true, alphaCutoff: 0.5 },
    'vine': { transparent: true, alphaCutoff: 0.5, tintColor: 0x2E8B57 },
    'lily_pad': { transparent: true, alphaCutoff: 0.5, tintColor: 0x2E8B57 },
    
    // Flowers (no tint, use texture colors)
    'poppy': { transparent: true, alphaCutoff: 0.5 },
    'dandelion': { transparent: true, alphaCutoff: 0.5 },
    'blue_orchid': { transparent: true, alphaCutoff: 0.5 },
    'allium': { transparent: true, alphaCutoff: 0.5 },
    'azure_bluet': { transparent: true, alphaCutoff: 0.5 },
    'red_tulip': { transparent: true, alphaCutoff: 0.5 },
    'orange_tulip': { transparent: true, alphaCutoff: 0.5 },
    'white_tulip': { transparent: true, alphaCutoff: 0.5 },
    'pink_tulip': { transparent: true, alphaCutoff: 0.5 },
    'oxeye_daisy': { transparent: true, alphaCutoff: 0.5 },
    'cornflower': { transparent: true, alphaCutoff: 0.5 },
    'lily_of_the_valley': { transparent: true, alphaCutoff: 0.5 },
    'wither_rose': { transparent: true, alphaCutoff: 0.5 },
    'sunflower': { transparent: true, alphaCutoff: 0.5 },
    'lilac': { transparent: true, alphaCutoff: 0.5 },
    'rose_bush': { transparent: true, alphaCutoff: 0.5 },
    'peony': { transparent: true, alphaCutoff: 0.5 },
    
    // Slab blocks
    'stone_slab': { category: 'slab' },
    'sandstone_slab': { category: 'slab' },
    'cobblestone_slab': { category: 'slab' },
    'brick_slab': { category: 'slab' },
    'stone_brick_slab': { category: 'slab' },
    'nether_brick_slab': { category: 'slab' },
    'quartz_slab': { category: 'slab' },
    'red_sandstone_slab': { category: 'slab' },
    
    // Wall blocks
    'cobblestone_wall': { category: 'wall' },
    'mossy_cobblestone_wall': { category: 'wall' },
    'stone_brick_wall': { category: 'wall' },
    'mossy_stone_brick_wall': { category: 'wall' },
    'brick_wall': { category: 'wall' },
    'prismarine_wall': { category: 'wall' },
    'red_sandstone_wall': { category: 'wall' },
    'sandstone_wall': { category: 'wall' },
    'nether_brick_wall': { category: 'wall' },
    'end_stone_brick_wall': { category: 'wall' },
    'blackstone_wall': { category: 'wall' },
    'polished_blackstone_wall': { category: 'wall' },
    'polished_blackstone_brick_wall': { category: 'wall' },
    'granite_wall': { category: 'wall' },
    'andesite_wall': { category: 'wall' },
    'diorite_wall': { category: 'wall' },
    'wall': { category: 'wall' }, // Generic wall
    
    // Fence blocks
    'oak_fence': { category: 'fence' },
    'spruce_fence': { category: 'fence' },
    'birch_fence': { category: 'fence' },
    'jungle_fence': { category: 'fence' },
    'acacia_fence': { category: 'fence' },
    'dark_oak_fence': { category: 'fence' },
    'crimson_fence': { category: 'fence' },
    'warped_fence': { category: 'fence' },
    'nether_brick_fence': { category: 'fence' },
    'bamboo_fence': { category: 'fence' },
    'mangrove_fence': { category: 'fence' },
    'cherry_fence': { category: 'fence' },
    'fence': { category: 'fence' }, // Generic fence
    
    // Wood slabs
    'oak_slab': { category: 'slab' },
    'spruce_slab': { category: 'slab' },
    'birch_slab': { category: 'slab' },
    'jungle_slab': { category: 'slab' },
    'acacia_slab': { category: 'slab' },
    'dark_oak_slab': { category: 'slab' },
    'crimson_slab': { category: 'slab' },
    'warped_slab': { category: 'slab' },
    'mangrove_slab': { category: 'slab' },
    'bamboo_slab': { category: 'slab' },
    'cherry_slab': { category: 'slab' },
    
    // Generic slab
    'slab': { category: 'slab' },
    
    // Door blocks
    'door': { category: 'door' },
    'wooden_door': { category: 'door' },
    'dark_oak_door': { category: 'door' },
    'oak_door': { category: 'door' },
    'spruce_door': { category: 'door' },
    'birch_door': { category: 'door' },
    'jungle_door': { category: 'door' },
    'acacia_door': { category: 'door' },
    'iron_door': { category: 'door' },
    'crimson_door': { category: 'door' },
    'warped_door': { category: 'door' },
    'mangrove_door': { category: 'door' },
    'bamboo_door': { category: 'door' },
    'cherry_door': { category: 'door' },
    
    'grindstone': {
        category: BLOCK_CATEGORIES.grindstone,
        transparent: false,
        solid: true,
        rotatable: true
    }
};

// Leaf texture mappings to handle different naming patterns
export const LEAF_TEXTURE_MAPPINGS = {
    'oak_leaves': 'leaves_oak.tga',
    'birch_leaves': 'leaves_birch.tga',
    'spruce_leaves': 'leaves_spruce.tga',
    'jungle_leaves': 'leaves_jungle.tga',
    'acacia_leaves': 'leaves_acacia.tga',
    'dark_oak_leaves': 'leaves_big_oak.tga',
    'big_oak_leaves': 'leaves_big_oak.tga',
    'cherry_leaves': 'cherry_leaves.tga',
    'mangrove_leaves': 'mangrove_leaves.tga',
    'azalea_leaves': 'azalea_leaves.tga',
    'flowering_azalea_leaves': 'azalea_leaves_flowers.tga',
    'pale_oak_leaves': 'pale_oak_leaves.tga',
    'leaves': 'leaves_oak.tga' // Default to oak leaves for generic "leaves"
};

// Common texture name patterns
export const TEXTURE_PATTERNS = {
    DEFAULT: '{blockType}.png',
    TOP: '{blockType}_top.png',
    BOTTOM: '{blockType}_bottom.png',
    SIDE: '{blockType}_side.png',
    NORTH: '{blockType}_north.png',
    SOUTH: '{blockType}_south.png',
    EAST: '{blockType}_east.png',
    WEST: '{blockType}_west.png'
};

// Special case mappings for blocks with non-standard texture names
export const SPECIAL_TEXTURE_MAPPINGS = {
    // Stone variants
    'granite': { default: 'stone_granite.png' },
    'andesite': { default: 'stone_andesite.png' },
    'diorite': { default: 'stone_diorite.png' },
    'polished_granite': { default: 'stone_granite_smooth.png' },
    'polished_andesite': { default: 'stone_andesite_smooth.png' },
    'polished_diorite': { default: 'stone_diorite_smooth.png' },
    'brick': { default: 'brick.png' },
    'brick_block': { default: 'brick.png' }, // Alternative name for brick
    'stone_bricks': { default: 'stonebrick.png' },
    
    // Full block mappings
    'smooth_quartz': { default: 'quartz_block_bottom.png' },
    'cobbled_deepslate': { default: 'deepslate_cobbled.png' },
    'hay_block': { default: 'hay_block_side.png' },
    'tuff': { default: 'tuff.png' },
    'concrete': { default: 'concrete_white.png' },
    'concrete_powder': { default: 'concrete_powder_white.png' },
    'nether_wart_block': { default: 'nether_wart_block.png' },
    'honey_block': { default: 'honey_block_side.png' },
    'smooth_basalt': { default: 'basalt_side.png' },
    'dark_prismarine': { default: 'prismarine_dark.png' },
    'copper_block': { default: 'copper_block.png' },
    'wool': { default: 'wool_colored_white.png' }, // Default to white wool
    'log': { 
        side: 'log_oak.png', 
        top: 'log_oak_top.png',
        end: 'log_oak_top.png'
    }, // Default to oak log
    'barrel': {
        top: 'barrel_top.png',
        bottom: 'barrel_bottom.png',
        side: 'barrel_side.png'
    },
    'chest': {
        top: 'chest_top.png',
        bottom: 'chest_bottom.png',
        front: 'chest_front.png',
        side: 'chest_side.png'
    },
    'crafting_table': {
        top: 'crafting_table_top.png',
        bottom: 'planks_oak.png',
        front: 'crafting_table_front.png',
        side: 'crafting_table_side.png'
    },
    'jukebox': {
        top: 'jukebox_top.png',
        bottom: 'jukebox_side.png',
        side: 'jukebox_side.png',
        north: 'jukebox_side.png',
        south: 'jukebox_side.png',
        east: 'jukebox_side.png',
        west: 'jukebox_side.png'
    },
    'loom': {
        top: 'loom_top.png',
        bottom: 'loom_bottom.png',
        front: 'loom_front.png',
        side: 'loom_side.png',
        north: 'loom_front.png',
        south: 'loom_side.png',
        east: 'loom_side.png',
        west: 'loom_side.png'
    },
    'chiseled_bookshelf': {
        top: 'chiseled_bookshelf_top.png',
        bottom: 'chiseled_bookshelf_top.png',
        front: 'chiseled_bookshelf_empty.png',
        side: 'chiseled_bookshelf_side.png',
        north: 'chiseled_bookshelf_empty.png',
        south: 'chiseled_bookshelf_side.png',
        east: 'chiseled_bookshelf_side.png',
        west: 'chiseled_bookshelf_side.png'
    },
    'bee_nest': {
        top: 'bee_nest_top.png',
        bottom: 'bee_nest_bottom.png',
        front: 'bee_nest_front.png',
        side: 'bee_nest_side.png',
        north: 'bee_nest_front.png',
        south: 'bee_nest_side.png',
        east: 'bee_nest_side.png',
        west: 'bee_nest_side.png'
    },
    'furnace': {
        top: 'furnace_top.png',
        bottom: 'furnace_bottom.png',
        front: 'furnace_front_on.png',
        side: 'furnace_side.png'
    },
    'blast_furnace': {
        top: 'blast_furnace_top.png',
        bottom: 'blast_furnace_bottom.png',
        front: 'blast_furnace_front_on.png',
        side: 'blast_furnace_side.png'
    },
    'cartography_table': {
        top: 'cartography_table_top.png',
        bottom: 'cartography_table_bottom.png',
        front: 'cartography_table_front.png',
        side: 'cartography_table_side.png'
    },
    'lectern': {
        top: 'lectern_top.png',
        bottom: 'lectern_base.png',
        front: 'lectern_front.png',
        side: 'lectern_sides.png'
    },
    'stonecutter': {
        top: 'stonecutter_top.png',
        bottom: 'stonecutter_bottom.png',
        front: 'stonecutter_front.png',
        side: 'stonecutter_side.png'
    },
    'bookshelf': { default: 'bookshelf.png' },
    'target': {
        top: 'target_top.png',
        bottom: 'target_bottom.png',
        side: 'target_side.png'
    },
    'lodestone': {
        top: 'lodestone_top.png',
        bottom: 'lodestone_bottom.png',
        side: 'lodestone_side.png'
    },
    'respawn_anchor': {
        top: 'respawn_anchor_top.png',
        bottom: 'respawn_anchor_bottom.png',
        side: 'respawn_anchor_side.png'
    },
    
    // Sandstone variants
    'sandstone': { 
        top: 'sandstone_top.png',
        bottom: 'sandstone_bottom.png',
        side: 'sandstone_normal.png'
    },
    'red_sandstone': { 
        top: 'red_sandstone_top.png',
        bottom: 'red_sandstone_bottom.png',
        side: 'red_sandstone_normal.png'
    },
    'chiseled_sandstone': { default: 'sandstone_carved.png' },
    'smooth_sandstone': { default: 'sandstone_smooth.png' },
    'chiseled_red_sandstone': { default: 'red_sandstone_carved.png' },
    'smooth_red_sandstone': { default: 'red_sandstone_smooth.png' },
    
    // Water
    'water': { default: 'water_still.png' },
    'flowing_water': { default: 'water_flow.png' },
    
    // Dropper and dispenser
    'dropper': { 
        top: 'dropper_front_vertical.png',
        front: 'dropper_front_horizontal.png',
        side: 'furnace_side.png' // Reuse furnace side texture
    },
    
    // Lectern
    'lectern': {
        top: 'lectern_top.png',
        bottom: 'lectern_base.png',
        front: 'lectern_front.png',
        side: 'lectern_sides.png'
    },
    
    // Wood logs - handle both old and new naming conventions
    'oak_log': { 
        side: 'log_oak.png', 
        top: 'log_oak_top.png',
        end: 'log_oak_top.png'
    },
    'birch_log': { 
        side: 'log_birch.png', 
        top: 'log_birch_top.png',
        end: 'log_birch_top.png'
    },
    'spruce_log': { 
        side: 'log_spruce.png', 
        top: 'log_spruce_top.png',
        end: 'log_spruce_top.png'
    },
    'jungle_log': { 
        side: 'log_jungle.png', 
        top: 'log_jungle_top.png',
        end: 'log_jungle_top.png'
    },
    'acacia_log': { 
        side: 'log_acacia.png', 
        top: 'log_acacia_top.png',
        end: 'log_acacia_top.png'
    },
    'dark_oak_log': { 
        side: 'log_big_oak.png', 
        top: 'log_big_oak_top.png',
        end: 'log_big_oak_top.png'
    },
    
    // Newer log formats
    'cherry_log': { 
        side: 'cherry_log_side.png', 
        top: 'cherry_log_top.png',
        end: 'cherry_log_top.png'
    },
    'mangrove_log': { 
        side: 'mangrove_log_side.png', 
        top: 'mangrove_log_top.png',
        end: 'mangrove_log_top.png'
    },
    
    // Wood planks
    'oak_planks': { default: 'planks_oak.png' },
    'birch_planks': { default: 'planks_birch.png' },
    'spruce_planks': { default: 'planks_spruce.png' },
    'jungle_planks': { default: 'planks_jungle.png' },
    'acacia_planks': { default: 'planks_acacia.png' },
    'dark_oak_planks': { default: 'planks_big_oak.png' },
    'planks': { default: 'planks_oak.png' }, // Default to oak planks
    
    // Grass and dirt variants
    'grass_block': {
        top: 'grass_top.png',
        side: 'grass_side.tga',
        bottom: 'dirt.png'
    },
    'dirt_path': {
        top: 'grass_path_top.png',
        side: 'grass_path_side.png',
        bottom: 'dirt.png'
    },
    'grass_path': {
        top: 'grass_path_top.png',
        side: 'grass_path_side.png',
        bottom: 'dirt.png'
    },
    'mycelium': {
        top: 'mycelium_top.png',
        side: 'mycelium_side.png',
        bottom: 'dirt.png'
    },
    'podzol': {
        top: 'dirt_podzol_top.png',
        side: 'dirt_podzol_side.png',
        bottom: 'dirt.png'
    },
    'farmland': {
        top: 'farmland_dry.png',
        side: 'dirt.png',
        bottom: 'dirt.png'
    },
    'farmland_moist': {
        top: 'farmland_wet.png',
        side: 'dirt.png',
        bottom: 'dirt.png'
    },
    
    // Plant textures
    'plant': { default: 'tallgrass.tga' },
    'tallgrass': { default: 'tallgrass.tga' },
    'fern': { default: 'fern.tga' },
    'large_fern': { default: 'double_plant_fern_top.tga' },
    'double_plant': { default: 'double_plant_grass_top.tga' },
    'double_plant_grass': { default: 'double_plant_grass_top.tga' },
    'double_plant_fern': { default: 'double_plant_fern_top.tga' },
    'wheat': { default: 'wheat_stage_7.png' },
    'sweet_berry_bush': { default: 'sweet_berry_bush_stage3.png' },
    
    // Fallbacks for common blocks
    'plant': { default: 'tallgrass.tga' },
    'sweet_berry_bush': { default: 'sweet_berry_bush_stage3.png' },
    'fence': { default: 'planks_oak.png' },
    'wall': { default: 'cobblestone.png' },
    'wheat': { default: 'wheat_stage_7.png' },
    'double_plant': { default: 'double_plant_grass_top.tga' },
    
    // Wall block textures
    'cobblestone_wall': { default: 'cobblestone.png' },
    'mossy_cobblestone_wall': { default: 'cobblestone_mossy.png' },
    'stone_brick_wall': { default: 'stonebrick.png' },
    'mossy_stone_brick_wall': { default: 'stonebrick_mossy.png' },
    'brick_wall': { default: 'brick.png' },
    'prismarine_wall': { default: 'prismarine_rough.png' },
    'red_sandstone_wall': { default: 'red_sandstone_normal.png' },
    'sandstone_wall': { default: 'sandstone_normal.png' },
    'nether_brick_wall': { default: 'nether_brick.png' },
    'end_stone_brick_wall': { default: 'end_bricks.png' },
    'blackstone_wall': { default: 'blackstone.png' },
    'polished_blackstone_wall': { default: 'polished_blackstone.png' },
    'polished_blackstone_brick_wall': { default: 'polished_blackstone_bricks.png' },
    'granite_wall': { default: 'stone_granite.png' },
    'andesite_wall': { default: 'stone_andesite.png' },
    'diorite_wall': { default: 'stone_diorite.png' },
    
    // Fence block textures
    'oak_fence': { default: 'planks_oak.png' },
    'spruce_fence': { default: 'planks_spruce.png' },
    'birch_fence': { default: 'planks_birch.png' },
    'jungle_fence': { default: 'planks_jungle.png' },
    'acacia_fence': { default: 'planks_acacia.png' },
    'dark_oak_fence': { default: 'planks_big_oak.png' },
    'crimson_fence': { default: 'crimson_planks.png' },
    'warped_fence': { default: 'warped_planks.png' },
    'nether_brick_fence': { default: 'nether_brick.png' },
    'bamboo_fence': { default: 'bamboo_planks.png' },
    'mangrove_fence': { default: 'mangrove_planks.png' },
    'cherry_fence': { default: 'cherry_planks.png' },
    
    // Double-height plant textures
    'double_plant': { 
        default: 'double_plant_grass_top.tga',
        top: 'double_plant_grass_top.tga',
        bottom: 'double_plant_grass_bottom.tga'
    },
    'double_plant_grass': { 
        default: 'double_plant_grass_top.tga',
        top: 'double_plant_grass_top.tga',
        bottom: 'double_plant_grass_bottom.tga'
    },
    'double_plant_fern': { 
        default: 'double_plant_fern_top.tga',
        top: 'double_plant_fern_top.tga',
        bottom: 'double_plant_fern_bottom.tga'
    },
    'double_plant_rose': { 
        default: 'double_plant_rose_top.png',
        top: 'double_plant_rose_top.png',
        bottom: 'double_plant_rose_bottom.png'
    },
    'double_plant_paeonia': { 
        default: 'double_plant_paeonia_top.png',
        top: 'double_plant_paeonia_top.png',
        bottom: 'double_plant_paeonia_bottom.png'
    },
    'double_plant_syringa': { 
        default: 'double_plant_syringa_top.tga',
        top: 'double_plant_syringa_top.tga',
        bottom: 'double_plant_syringa_bottom.tga'
    },
    'double_plant_sunflower': { 
        default: 'double_plant_sunflower_top.png',
        top: 'double_plant_sunflower_top.png',
        bottom: 'double_plant_sunflower_bottom.png'
    },
    
    // Slab texture mappings
    'stone_slab': { 
        top: 'stone_slab_top.png',
        bottom: 'stone_slab_top.png',
        side: 'stone_slab_side.png'
    },
    'sandstone_slab': { 
        top: 'sandstone_top.png',
        bottom: 'sandstone_bottom.png',
        side: 'sandstone_normal.png'
    },
    'cobblestone_slab': { 
        top: 'cobblestone.png',
        bottom: 'cobblestone.png',
        side: 'cobblestone.png'
    },
    'brick_slab': { 
        top: 'brick.png',
        bottom: 'brick.png',
        side: 'brick.png'
    },
    'stone_brick_slab': { 
        top: 'stonebrick.png',
        bottom: 'stonebrick.png',
        side: 'stonebrick.png'
    },
    'nether_brick_slab': { 
        top: 'nether_brick.png',
        bottom: 'nether_brick.png',
        side: 'nether_brick.png'
    },
    'quartz_slab': { 
        top: 'quartz_block_top.png',
        bottom: 'quartz_block_bottom.png',
        side: 'quartz_block_side.png'
    },
    'oak_slab': { default: 'planks_oak.png' },
    'spruce_slab': { default: 'planks_spruce.png' },
    'birch_slab': { default: 'planks_birch.png' },
    'jungle_slab': { default: 'planks_jungle.png' },
    'acacia_slab': { default: 'planks_acacia.png' },
    'dark_oak_slab': { default: 'planks_big_oak.png' },
    'crimson_slab': { default: 'crimson_planks.png' },
    'warped_slab': { default: 'warped_planks.png' },
    'mangrove_slab': { default: 'mangrove_planks.png' },
    'bamboo_slab': { default: 'bamboo_planks.png' },
    'cherry_slab': { default: 'cherry_planks.png' },
    'beehive': {
        top: 'beehive_end.png',
        bottom: 'beehive_end.png',
        front: 'beehive_front.png',
        side: 'beehive_side.png',
        north: 'beehive_front.png',
        south: 'beehive_side.png',
        east: 'beehive_side.png',
        west: 'beehive_side.png'
    },
    'deepslate': { 
        top: 'deepslate_top.png',
        side: 'deepslate.png',
        bottom: 'deepslate.png'
    },
    'quartz_pillar': {
        top: 'quartz_block_lines_top.png',
        side: 'quartz_block_lines.png',
        bottom: 'quartz_block_lines_top.png'
    },
    'smithing_table': {
        top: 'smithing_table_top.png',
        bottom: 'smithing_table_bottom.png',
        front: 'smithing_table_front.png',
        side: 'smithing_table_side.png',
        north: 'smithing_table_front.png',
        south: 'smithing_table_front.png',
        east: 'smithing_table_side.png',
        west: 'smithing_table_side.png'
    },
    'rooted_dirt': { default: 'rooted_dirt.png' },
    'cactus': {
        top: 'cactus_top.tga',
        bottom: 'cactus_bottom.tga',
        side: 'cactus_side.tga',
        north: 'cactus_side.tga',
        south: 'cactus_side.tga',
        east: 'cactus_side.tga',
        west: 'cactus_side.tga'
    },
    'copper_grate': { default: 'copper_grate.png' },
    'composter': {
        top: 'composter_top.png',
        bottom: 'composter_bottom.png',
        side: 'composter_side.png',
        north: 'composter_side.png',
        south: 'composter_side.png',
        east: 'composter_side.png',
        west: 'composter_side.png'
    },
    'pumpkin': {
        top: 'pumpkin_top.png',
        bottom: 'pumpkin_top.png',
        front: 'pumpkin_face.png',
        side: 'pumpkin_side.png',
        north: 'pumpkin_face.png',
        south: 'pumpkin_side.png',
        east: 'pumpkin_side.png',
        west: 'pumpkin_side.png'
    },
    'scaffolding': {
        top: 'scaffolding_top.tga',
        bottom: 'scaffolding_bottom.tga',
        side: 'scaffolding_side.tga',
        north: 'scaffolding_side.tga',
        south: 'scaffolding_side.tga',
        east: 'scaffolding_side.tga',
        west: 'scaffolding_side.tga'
    },
    'sticky_piston': {
        top: 'piston_top_sticky.png',
        bottom: 'piston_bottom.png',
        side: 'piston_side.png',
        north: 'piston_top_sticky.png',
        south: 'piston_bottom.png',
        east: 'piston_side.png',
        west: 'piston_side.png'
    },
    'jack_o_lantern': {
        top: 'pumpkin_top.png',
        bottom: 'pumpkin_top.png',
        front: 'pumpkin_face_on.png',
        side: 'pumpkin_side.png',
    },
    'piston': {
        top: 'piston_top.png',
        bottom: 'piston_bottom.png',
        side: 'piston_side.png',
        north: 'piston_top.png',
        south: 'piston_bottom.png',
        east: 'piston_side.png',
        west: 'piston_side.png'
    },
    'dispenser': {
        top: 'dispenser_top.png',
        bottom: 'dispenser_bottom.png',
        front: 'dispenser_front.png',
        side: 'dispenser_side.png'
    },
    'observer': {
        top: 'observer_top.png',
        bottom: 'observer_back.png',
        front: 'observer_front.png',
        side: 'observer_side.png',
        north: 'observer_front.png',
        south: 'observer_back.png',
        east: 'observer_side.png',
        west: 'observer_side.png'
    },
    'smoker': {
        top: 'smoker_top.png',
        bottom: 'smoker_bottom.png',
        front: 'smoker_front_on.png',
        side: 'smoker_side.png',
        north: 'smoker_front_on.png',
        south: 'smoker_side.png',
        east: 'smoker_side.png',
        west: 'smoker_side.png'
    },
    'cobbled_deepslate': { default: 'deepslate_cobbled.png' },
    'mossy_cobblestone': { default: 'cobblestone_mossy.png' },
    'mud': { default: 'mud.png' },
    'clay': { default: 'clay.png' },
    'polished_blackstone': { default: 'polished_blackstone.png' },
    'calcite': { default: 'calcite.png' },
    'melon': {
        top: 'melon_top.png',
        bottom: 'melon_bottom.png',
        side: 'melon_side.png',
        north: 'melon_side.png',
        south: 'melon_side.png',
        east: 'melon_side.png',
        west: 'melon_side.png'
    },
    'cauldron': {
        top: 'cauldron_top.png',
        bottom: 'cauldron_bottom.png',
        side: 'cauldron_side.png',
        north: 'cauldron_side.png',
        south: 'cauldron_side.png',
        east: 'cauldron_side.png',
        west: 'cauldron_side.png'
    },
    'quartz_block': {
        top: 'quartz_block_top.png',
        bottom: 'quartz_block_bottom.png',
        side: 'quartz_block_side.png',
        north: 'quartz_block_side.png',
        south: 'quartz_block_side.png',
        east: 'quartz_block_side.png',
        west: 'quartz_block_side.png'
    },
    'quartz_bricks': { default: 'quartz_bricks.png' },
    'quartz_block_chiseled': {
        top: 'quartz_block_chiseled_top.png',
        bottom: 'quartz_block_chiseled_top.png',
        side: 'quartz_block_chiseled.png',
        north: 'quartz_block_chiseled.png',
        south: 'quartz_block_chiseled.png',
        east: 'quartz_block_chiseled.png',
        west: 'quartz_block_chiseled.png'
    },
    'quartz_block_lines': {
        top: 'quartz_block_lines_top.png',
        bottom: 'quartz_block_lines_top.png',
        side: 'quartz_block_lines.png',
        north: 'quartz_block_lines.png',
        south: 'quartz_block_lines.png',
        east: 'quartz_block_lines.png',
        west: 'quartz_block_lines.png'
    },
    'quartz_ore': { default: 'quartz_ore.png' },
    
    // Door blocks
    'door': {
        lower: 'door_dark_oak_lower.png',
        upper: 'door_dark_oak_upper.png'
    },
    'wooden_door': {
        lower: 'door_dark_oak_lower.png',
        upper: 'door_dark_oak_upper.png'
    },
    'dark_oak_door': {
        lower: 'door_dark_oak_lower.png',
        upper: 'door_dark_oak_upper.png'
    },
    'oak_door': {
        lower: 'door_wood_lower.png',
        upper: 'door_wood_upper.png'
    },
    'spruce_door': {
        lower: 'door_spruce_lower.png',
        upper: 'door_spruce_upper.png'
    },
    'birch_door': {
        lower: 'door_birch_lower.png',
        upper: 'door_birch_upper.png'
    },
    'jungle_door': {
        lower: 'door_jungle_lower.png',
        upper: 'door_jungle_upper.png'
    },
    'acacia_door': {
        lower: 'door_acacia_lower.png',
        upper: 'door_acacia_upper.png'
    },
    'iron_door': {
        lower: 'door_iron_lower.png',
        upper: 'door_iron_upper.png'
    },
    
    // Glass panes use glass texture
    'glass_pane': { default: 'glass.png' },
    'glass_pane_top': { default: 'glass.png' },
    
    'grindstone': {
        round: 'grindstone_round.tga',
        side: 'grindstone_side.tga',
        pivot: 'grindstone_pivot.tga'
    }
};

// Common block categories for fallback textures
export const BLOCK_CATEGORIES_FALLBACKS = {
    'stone': ['stone', 'cobblestone', 'andesite', 'diorite', 'granite', 'basalt', 'tuff', 'deepslate', 'calcite'],
    'dirt': ['dirt', 'coarse_dirt', 'rooted_dirt', 'mud', 'clay', 'soul_soil', 'soul_sand'],
    'sand': ['sand', 'red_sand', 'gravel'],
    'wood': ['oak', 'birch', 'spruce', 'jungle', 'acacia', 'dark_oak', 'crimson', 'warped', 'mangrove', 'cherry', 'bamboo'],
    'ore': ['coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'emerald_ore', 'lapis_ore', 'redstone_ore', 'copper_ore'],
    'plant': ['grass', 'fern', 'sapling', 'flower', 'mushroom', 'wheat', 'berry', 'vine', 'lily']
};

// Texture name mappings for common blocks
export const TEXTURE_NAME_MAPPINGS = {
    // Stone variants
    'andesite': 'stone_andesite.png',
    'diorite': 'stone_diorite.png',
    'granite': 'stone_granite.png',
    'polished_andesite': 'stone_andesite_smooth.png',
    'polished_diorite': 'stone_diorite_smooth.png',
    'polished_granite': 'stone_granite_smooth.png',
    'stone': 'stone.png',
    'cobblestone': 'cobblestone.png',
    'gravel': 'gravel.png',
    'dirt': 'dirt.png',
    'coarse_dirt': 'coarse_dirt.png',
    'sand': 'sand.png',
    'coal_ore': 'coal_ore.png',
    'iron_ore': 'iron_ore.png',
    'seagrass': 'seagrass.png',
    'lantern': 'lantern.png',
    'trapdoor': 'trapdoor.png',
    
    // Plants
    'tallgrass': 'tallgrass.tga',
    'fern': 'fern.tga',
    'large_fern': 'double_plant_fern_top.tga',
    'double_plant_grass': 'double_plant_grass_top.tga',
    'double_plant_fern': 'double_plant_fern_top.tga',
    'wheat': 'wheat_stage_7.png',
    'sweet_berry_bush': 'sweet_berry_bush_stage3.png',
    
    // Wool colors
    'white_wool': 'wool_colored_white.png',
    'orange_wool': 'wool_colored_orange.png',
    'magenta_wool': 'wool_colored_magenta.png',
    'light_blue_wool': 'wool_colored_light_blue.png',
    'yellow_wool': 'wool_colored_yellow.png',
    'lime_wool': 'wool_colored_lime.png',
    'pink_wool': 'wool_colored_pink.png',
    'gray_wool': 'wool_colored_gray.png',
    'light_gray_wool': 'wool_colored_silver.png',
    'cyan_wool': 'wool_colored_cyan.png',
    'purple_wool': 'wool_colored_purple.png',
    'blue_wool': 'wool_colored_blue.png',
    'brown_wool': 'wool_colored_brown.png',
    'green_wool': 'wool_colored_green.png',
    'red_wool': 'wool_colored_red.png',
    'black_wool': 'wool_colored_black.png'
}; 