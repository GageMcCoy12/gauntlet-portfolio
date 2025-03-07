// Mock server to replace the Python backend
// This intercepts fetch requests to /spawn-chunk and returns data from world_data.json

// Store the original fetch function
const originalFetch = window.fetch;

// Flag to toggle between mock and real server
const useMockServer = true;

// Override the fetch function
window.fetch = async function(url, options) {
    // Check if this is a request to our API endpoint
    if (typeof url === 'string' && url.includes('/spawn-chunk')) {
        console.log('🔄 Intercepting API request to /spawn-chunk');
        
        if (useMockServer) {
            try {
                // Load the pre-generated world data
                const response = await originalFetch('./world_data.json');
                const worldData = await response.json();
                
                console.log('📦 Loaded world data from static file');
                console.log('📊 Data structure:', Object.keys(worldData));
                console.log('🧱 First few blocks:', worldData.blocks?.slice(0, 3));
                
                // Create a Response object that mimics what the server would return
                return new Response(JSON.stringify(worldData), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('❌ Error loading world data:', error);
                return new Response(JSON.stringify({ error: 'Failed to load world data' }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        } else {
            // Use the real server but log the response for comparison
            const response = await originalFetch(url, options);
            const clonedResponse = response.clone();
            
            try {
                const data = await clonedResponse.json();
                console.log('🌐 Real server response:', Object.keys(data));
                console.log('🧱 First few blocks from real server:', data.blocks?.slice(0, 3));
            } catch (e) {
                console.error('Error parsing real server response:', e);
            }
            
            return response;
        }
    }
    
    // For all other requests, use the original fetch
    return originalFetch(url, options);
};

console.log('🚀 Mock server initialized - API requests will be intercepted'); 