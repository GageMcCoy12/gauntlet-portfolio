// Script to capture the server response and save it as world_data.json
// Run this in the browser console while connected to the real server

async function captureServerResponse() {
    try {
        console.log('📡 Fetching data from server...');
        const response = await fetch('/spawn-chunk?chunk_range=1');
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Successfully captured server response!');
        console.log('📊 Data structure:', Object.keys(data));
        console.log('🧱 Block count:', data.blocks?.length || 0);
        
        // Convert to a formatted JSON string
        const jsonString = JSON.stringify(data, null, 2);
        
        // Create a download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'world_data.json';
        a.textContent = 'Download world_data.json';
        a.style.position = 'fixed';
        a.style.top = '10px';
        a.style.left = '10px';
        a.style.padding = '10px';
        a.style.backgroundColor = '#4CAF50';
        a.style.color = 'white';
        a.style.borderRadius = '5px';
        a.style.textDecoration = 'none';
        a.style.zIndex = '9999';
        
        document.body.appendChild(a);
        
        console.log('💾 Click the green button in the top-left corner to download the file');
        console.log('⚠️ After downloading, replace the existing world_data.json file with this new one');
        
        return data;
    } catch (error) {
        console.error('❌ Error capturing server response:', error);
    }
}

// Run the function
captureServerResponse(); 