// For now, we'll use a simplified chunk format
export class WorldLoader {
    constructor() {
        this.chunkSize = 16;
        this.apiUrl = '/spawn-chunk';
        this.blockStats = {};
        this.chunkRange = 1; // Default to loading a 3x3 grid (range=1 means 1 chunk in each direction)
        this.customData = null; // Store custom data from direct fetch
    }

    /**
     * Set custom data from a direct fetch
     * @param {Object} data - The data from the server
     */
    setCustomData(data) {
        this.customData = data;
        
        // Update block statistics
        if (data.stats) {
            this.blockStats = data.stats;
            console.log('Updated block statistics from custom data');
        }
    }

    async loadSpawnChunk() {
        try {
            // If we have custom data, use it instead of fetching
            if (this.customData) {
                console.log('Using custom data instead of fetching from server');
                const data = this.customData;
                this.customData = null; // Clear custom data after use
                
                // Store block statistics if available
                if (data.stats) {
                    this.blockStats = data.stats;
                    console.log('Block statistics:', this.blockStats);
                    
                    // Log loaded chunks information
                    if (this.blockStats.loaded_chunks) {
                        console.log(`Loaded specific chunks: ${JSON.stringify(this.blockStats.loaded_chunks)}`);
                    }
                    
                    if (this.blockStats.center_chunk) {
                        console.log(`Center chunk: (${this.blockStats.center_chunk.x}, ${this.blockStats.center_chunk.z})`);
                    }
                    
                    if (this.blockStats.chunk_range) {
                        console.log(`Chunk range: ${this.blockStats.chunk_range}`);
                    }
                    
                    if (this.blockStats.height_range) {
                        console.log(`Height range: ${this.blockStats.height_range.min} to ${this.blockStats.height_range.max}`);
                    }
                    
                    // Log leaf block information
                    console.log(`Found ${this.blockStats.leaf_blocks} leaf blocks out of ${this.blockStats.total_blocks} total blocks`);
                    
                    // Log the top 5 most common blocks
                    const topBlocks = Object.entries(this.blockStats.block_counts || {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);
                    
                    console.log('Top 5 most common blocks:');
                    topBlocks.forEach(([type, count], index) => {
                        console.log(`${index + 1}. ${type}: ${count}`);
                    });
                }
                
                // Ensure blocks array exists
                if (!data.blocks || !Array.isArray(data.blocks)) {
                    console.error('No blocks array in server response:', data);
                    return this.generateTestChunk(); // Fallback to test chunk
                }
                
                // Process blocks to handle double plants and slabs
                const processedBlocks = this.processBlocks(data.blocks);
                
                // Validate blocks
                const validBlocks = processedBlocks.filter(block => {
                    return block && typeof block.type === 'string' && 
                           typeof block.x === 'number' && 
                           typeof block.y === 'number' && 
                           typeof block.z === 'number';
                });
                
                if (validBlocks.length === 0) {
                    console.error('No valid blocks in server response');
                    return this.generateTestChunk(); // Fallback to test chunk
                }
                
                console.log(`Loaded ${validBlocks.length} blocks from server`);
                return validBlocks;
            }
            
            // Otherwise, fetch from server as usual
            console.log(`Loading chunks with range ${this.chunkRange} from server...`);
            const response = await fetch(`${this.apiUrl}?chunk_range=${this.chunkRange}`);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('🔍 RECEIVED DATA FROM SERVER:', data);
            console.log('🔍 DATA STRUCTURE:', Object.keys(data));
            console.log('🔍 BLOCKS ARRAY TYPE:', Array.isArray(data.blocks) ? 'Array' : typeof data.blocks);
            console.log('🔍 BLOCKS COUNT:', data.blocks?.length || 0);
            console.log('🔍 SAMPLE BLOCKS:', data.blocks?.slice(0, 3));
            
            // Store block statistics if available
            if (data.stats) {
                this.blockStats = data.stats;
                console.log('Block statistics:', this.blockStats);
                
                // Log loaded chunks information
                if (this.blockStats.loaded_chunks) {
                    console.log(`Loaded specific chunks: ${JSON.stringify(this.blockStats.loaded_chunks)}`);
                } else if (this.blockStats.chunk_range) {
                    // Backward compatibility for old format
                    console.log(`Loaded chunks with range ${this.blockStats.chunk_range} centered at (${this.blockStats.center_chunk?.x || 0}, ${this.blockStats.center_chunk?.z || 0})`);
                }
                
                // Log leaf block information
                if (this.blockStats.leaf_blocks !== undefined) {
                    console.log(`Found ${this.blockStats.leaf_blocks} leaf blocks out of ${this.blockStats.total_blocks} total blocks`);
                }
                
                // Log the top 5 most common blocks
                if (this.blockStats.block_counts) {
                    const topBlocks = Object.entries(this.blockStats.block_counts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);
                    
                    console.log('Top 5 most common blocks:');
                    topBlocks.forEach(([type, count], index) => {
                        console.log(`${index + 1}. ${type}: ${count}`);
                    });
                }
            }
            
            // Ensure blocks array exists
            if (!data.blocks || !Array.isArray(data.blocks)) {
                console.error('No blocks array in server response:', data);
                return this.generateTestChunk(); // Fallback to test chunk
            }
            
            // Process blocks to handle double plants and slabs
            const processedBlocks = this.processBlocks(data.blocks);
            
            // Validate blocks
            const validBlocks = processedBlocks.filter(block => {
                return block && typeof block.type === 'string' && 
                       typeof block.x === 'number' && 
                       typeof block.y === 'number' && 
                       typeof block.z === 'number';
            });
            
            if (validBlocks.length === 0) {
                console.error('No valid blocks in server response');
                return this.generateTestChunk(); // Fallback to test chunk
            }
            
            console.log(`Loaded ${validBlocks.length} blocks from server`);
            return validBlocks;
        } catch (error) {
            console.error('Error loading chunks:', error);
            return this.generateTestChunk(); // Fallback to test chunk
        }
    }
    
    /**
     * Process blocks to identify and mark special blocks like double plants and slabs
     * @param {Array} blocks - The blocks to process
     * @returns {Array} - The processed blocks
     */
    processBlocks(blocks) {
        // Create a map to quickly look up blocks by position
        const blockMap = new Map();
        blocks.forEach(block => {
            const key = `${block.x},${block.y},${block.z}`;
            blockMap.set(key, block);
        });
        
        // Process blocks
        const processedBlocks = [];
        
        for (const block of blocks) {
            // Skip blocks we've already processed
            const key = `${block.x},${block.y},${block.z}`;
            if (blockMap.get(key) === null) continue;
            
            // Check if this is a double plant
            if (block.type.includes('double_plant')) {
                // Extract the plant type (grass, fern, etc.)
                let plantType = 'grass'; // Default
                const parts = block.type.split('_');
                if (parts.length > 2) {
                    plantType = parts[2];
                }
                
                // This is the bottom part
                processedBlocks.push({
                    ...block,
                    type: `double_plant_${plantType}_bottom`,
                    is_double_plant_bottom: true
                });
                
                // Add a top part at y+1
                processedBlocks.push({
                    type: `double_plant_${plantType}_top`,
                    x: block.x,
                    y: block.y + 1,
                    z: block.z,
                    is_double_plant_top: true
                });
                
                // Mark the original block at y+1 as processed (if it exists)
                const topKey = `${block.x},${block.y + 1},${block.z}`;
                blockMap.set(topKey, null);
            } 
            // Check if this is a slab
            else if (block.type.includes('_slab') || block.type === 'slab') {
                console.log(`🎯 Found slab at (${block.x}, ${block.y}, ${block.z})`);
                console.log('📦 Raw block data:', JSON.stringify(block, null, 2));
                
                // Check for isUpperSlab in both root and extra_data
                const isUpperSlab = block.isUpperSlab === true || block.extra_data?.isUpperSlab === true;
                console.log(`⬆️ isUpperSlab found in:`, {
                    root: block.isUpperSlab,
                    extra_data: block.extra_data?.isUpperSlab,
                    final: isUpperSlab
                });
                
                // If it's a generic 'slab', try to determine the specific type
                if (block.type === 'slab') {
                    console.log(`🔍 Processing generic slab with data:`, block.data);
                    
                    // Try to determine slab type from data value
                    let slabType = 'stone_slab'; // Default to stone slab
                    
                    if (block.data !== undefined) {
                        const materialBits = block.data & 0x7; // Extract material bits
                        console.log(`🧮 Material bits: ${materialBits}`);
                        
                        // Map material bits to slab types
                        switch (materialBits) {
                            case 0: slabType = 'stone_slab'; break;
                            case 1: slabType = 'sandstone_slab'; break;
                            case 2: slabType = 'oak_slab'; break;
                            case 3: slabType = 'cobblestone_slab'; break;
                            case 4: slabType = 'brick_slab'; break;
                            case 5: slabType = 'stone_brick_slab'; break;
                            case 6: slabType = 'nether_brick_slab'; break;
                            case 7: slabType = 'quartz_slab'; break;
                            default: slabType = 'stone_slab'; break;
                        }
                        
                        console.log(`🎨 Determined slab type: ${slabType}`);
                    }
                    
                    // Add the slab with the determined type
                    const processedBlock = {
                        ...block,
                        type: slabType,
                        isUpperSlab: isUpperSlab,
                        originalData: block.data,
                        originalType: 'slab'
                    };
                    
                    console.log(`✅ Processed generic slab:`, processedBlock);
                    processedBlocks.push(processedBlock);
                } else {
                    // Already has a specific slab type
                    const processedBlock = {
                        ...block,
                        isUpperSlab: isUpperSlab,
                        originalData: block.data
                    };
                    
                    console.log(`✨ Processed specific slab: ${processedBlock.type}, isUpper: ${isUpperSlab}`);
                    processedBlocks.push(processedBlock);
                }
            } 
            // Check if this is a stair
            else if (block.type.includes('_stairs') || block.type === 'stairs') {
                console.log(`========== STAIR PROCESSING DETAILS ==========`);
                console.log(`Found stair at (${block.x}, ${block.y}, ${block.z})`);
                console.log('Raw block data:', JSON.stringify(block, null, 2));
                
                // Get stair data from the server's metadata
                const stairData = block.stairData || {};
                console.log('Stair metadata from server:', stairData);
                
                // If it's a generic 'stairs', we'll use spruce
                if (block.type === 'stairs') {
                    console.log(`Found generic stairs at (${block.x}, ${block.y}, ${block.z})`);
                    
                    // Add the stair with the metadata from server
                    const processedBlock = {
                        ...block,
                        type: 'spruce_stairs',
                        facing: stairData.facing,
                        half: stairData.half,
                        shape: stairData.shape,
                        originalType: 'stairs'
                    };
                    
                    console.log(`Processed stair:`, JSON.stringify(processedBlock, null, 2));
                    processedBlocks.push(processedBlock);
                } else {
                    // Already has a specific stair type, just add the metadata
                    const processedBlock = {
                        ...block,
                        facing: stairData.facing,
                        half: stairData.half,
                        shape: stairData.shape
                    };
                    
                    console.log(`Processed specific stair:`, JSON.stringify(processedBlock, null, 2));
                    processedBlocks.push(processedBlock);
                }
                
                console.log(`=========================================`);
            } 
            // Check if this is a trapdoor
            else if (block.type.includes('_trapdoor') || block.type === 'trapdoor') {
                console.log('========== RAW TRAPDOOR DATA FROM WORLD ==========');
                console.log('Block type:', block.type);
                console.log('Raw block data:', JSON.stringify(block, null, 2));
                console.log('Properties:', block.properties);
                console.log('Extra data:', block.extra_data);
                console.log('Position:', `(${block.x}, ${block.y}, ${block.z})`);
                console.log('===============================================');

                // Pass along the trapdoor state information
                if (block.trapdoorState) {
                    processedBlocks.push({
                        ...block,
                        trapdoorState: block.trapdoorState
                    });
                    console.log(`Processed trapdoor: ${block.type} with state:`, block.trapdoorState);
                } else {
                    // If no state information is available, use defaults
                    processedBlocks.push({
                        ...block,
                        trapdoorState: {
                            open: false,
                            half: 'bottom',
                            facing: 'north'
                        }
                    });
                    console.log(`Processed trapdoor: ${block.type} with default state`);
                }
            }
            // Check if this is a colored block (concrete, concrete_powder, wool)
            else if (block.type.includes('concrete') || block.type.includes('wool')) {
                console.log(`🎨 Processing colored block:`, {
                    type: block.type,
                    color: block.color,
                    position: [block.x, block.y, block.z]
                });

                // Get color from block data
                let color = block.color || 'white'; // default to white if no color specified
                
                // Create the processed block with color info
                const processedBlock = {
                    ...block,
                    type: block.type, // server should have already formatted this correctly
                    color: color
                };
                
                console.log(`✨ Processed colored block:`, processedBlock);
                processedBlocks.push(processedBlock);
            }
            else {
                // Not a special block, add as is
                processedBlocks.push(block);
            }
        }
        
        return processedBlocks;
    }

    // Temporary function to generate a test chunk
    generateTestChunk() {
        console.log('Generating test chunk...');
        const blocks = [];
        
        // Create a simple terrain pattern
        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                // Base layer (y=0) is bedrock
                blocks.push({ type: 'bedrock', x, y: 0, z });
                
                // Layers 1-3 are stone
                for (let y = 1; y <= 3; y++) {
                    blocks.push({ type: 'stone', x, y, z });
                }
                
                // Layer 4 is dirt
                blocks.push({ type: 'dirt', x, y: 4, z });
                
                // Layer 5 is grass
                blocks.push({ type: 'grass_block', x, y: 5, z });
                
                // Add some trees
                if ((x === 4 && z === 4) || (x === 12 && z === 12)) {
                    // Tree trunk
                    for (let y = 6; y <= 10; y++) {
                        blocks.push({ type: 'oak_log', x, y, z });
                    }
                    
                    // Tree leaves
                    for (let lx = x - 2; lx <= x + 2; lx++) {
                        for (let lz = z - 2; lz <= z + 2; lz++) {
                            for (let ly = 9; ly <= 11; ly++) {
                                if (lx >= 0 && lx < this.chunkSize && lz >= 0 && lz < this.chunkSize) {
                                    blocks.push({ type: 'oak_leaves', x: lx, y: ly, z: lz, is_leaf: true });
                                }
                            }
                        }
                    }
                }
                
                // Add some double plants
                if ((x === 6 && z === 6) || (x === 10 && z === 10) || (x === 8 && z === 2)) {
                    // Add double plant (grass type) - only need to add the bottom part
                    blocks.push({ 
                        type: 'double_plant_grass', 
                        x, 
                        y: 6, 
                        z
                    });
                }
                
                // Add some fern double plants
                if ((x === 7 && z === 7) || (x === 11 && z === 11)) {
                    // Add double plant (fern type) - only need to add the bottom part
                    blocks.push({ 
                        type: 'double_plant_fern', 
                        x, 
                        y: 6, 
                        z
                    });
                }
                
                // Add various slab types
                
                // Stone slabs
                if ((x === 3 && z === 3) || (x === 9 && z === 9)) {
                    // Add stone slab (lower)
                    blocks.push({ 
                        type: 'stone_slab', 
                        x, 
                        y: 6, 
                        z,
                        isUpperSlab: false
                    });
                }
                
                if ((x === 3 && z === 4) || (x === 9 && z === 10)) {
                    // Add stone slab (upper)
                    blocks.push({ 
                        type: 'stone_slab', 
                        x, 
                        y: 6, 
                        z,
                        isUpperSlab: true
                    });
                }
                
                // Oak slabs
                if ((x === 5 && z === 3) || (x === 11 && z === 9)) {
                    // Add oak slab (lower)
                    blocks.push({ 
                        type: 'oak_slab', 
                        x, 
                        y: 6, 
                        z,
                        isUpperSlab: false
                    });
                }
                
                if ((x === 5 && z === 4) || (x === 11 && z === 10)) {
                    // Add oak slab (upper)
                    blocks.push({ 
                        type: 'oak_slab', 
                        x, 
                        y: 6, 
                        z,
                        isUpperSlab: true
                    });
                }
                
                // Spruce slabs
                if ((x === 7 && z === 3) || (x === 13 && z === 9)) {
                    // Add spruce slab (lower)
                    blocks.push({ 
                        type: 'spruce_slab', 
                        x, 
                        y: 6, 
                        z,
                        isUpperSlab: false
                    });
                }
                
                // Sandstone slabs
                if ((x === 7 && z === 4) || (x === 13 && z === 10)) {
                    // Add sandstone slab (upper)
                    blocks.push({ 
                        type: 'sandstone_slab', 
                        x, 
                        y: 6, 
                        z,
                        isUpperSlab: true
                    });
                }
                
                // Cobblestone slabs
                if (x === 9 && z === 3) {
                    // Add cobblestone slab (lower)
                    blocks.push({ 
                        type: 'cobblestone_slab', 
                        x, 
                        y: 6, 
                        z,
                        isUpperSlab: false
                    });
                }
                
                // Brick slabs
                if (x === 9 && z === 4) {
                    // Add brick slab (upper)
                    blocks.push({
                        type: 'brick_slab', 
                        x, 
                        y: 6, 
                        z,
                        isUpperSlab: true
                    });
                }
            }
        }
        
        console.log(`Generated ${blocks.length} blocks for test chunk`);
        return blocks;
    }

    getBlockStats() {
        return this.blockStats;
    }

    /**
     * Set the chunk range to load
     * @param {number} range - The range of chunks to load in each direction (0 = just center chunk, 1 = 3x3 grid, etc.)
     */
    setChunkRange(range) {
        this.chunkRange = Math.max(0, range); // Ensure range is not negative
        console.log(`Set chunk range to ${this.chunkRange} (${2*this.chunkRange+1}x${2*this.chunkRange+1} grid)`);
    }
} 