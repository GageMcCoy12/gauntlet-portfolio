import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { WorldLoader } from './worldLoader.js';
import { TextureLoader } from './textureLoader.js';

// Helper function for trapdoor rotation
function getTrapdoorRotation(facing, isOpen) {
    // Base rotation in radians for each facing direction
    const baseRotations = {
        'north': Math.PI,      // Facing north (180 degrees)
        'south': 0,            // Facing south (0 degrees)
        'west': Math.PI * 1.5, // Facing west (270 degrees)
        'east': Math.PI * 0.5  // Facing east (90 degrees)
    };
    
    // Get base rotation from facing direction (default to north if invalid)
    let rotation = baseRotations[facing] || Math.PI;
    
    // If open, rotate 90 degrees around the hinge
    if (isOpen) {
        rotation += Math.PI * 0.5;
    }
    
    return rotation;
}

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Add fog to create atmosphere around the edges
const fogColor = new THREE.Color(0x87CEEB); // Match sky blue color
scene.fog = new THREE.FogExp2(fogColor, 0.01); // Reduced fog density from 0.02 to 0.01

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 75);
camera.position.set(0, 40, 30);
camera.lookAt(0, 0, 0);

// Camera path points in a wavy circle around the house
const cameraPathPoints = [
    { position: new THREE.Vector3(-30, 20, 30), name: 'SlackClone', color: '#FF5733' },
    { position: new THREE.Vector3(30, 15, 30), name: 'AutoCRM', color: '#33FF57' },
    { position: new THREE.Vector3(40, 30, -10), name: 'Queued', color: '#3357FF' },
    { position: new THREE.Vector3(0, 40, -40), name: 'shotcut', color: '#FFD700' },
    { position: new THREE.Vector3(-40, 25, -20), name: 'Marker Magic!', color: '#FF33A1' },
    { position: new THREE.Vector3(-35, 15, 15), name: 'OTD', color: '#33FFF6' }
];

// Project data
const projectData = {
    'SlackClone': {
        title: 'ChatGenius',
        description: 'A project that replicates Slack functionality. Built in just 2 weeks.',
        technologies: ['v0', 'Cursor', 'Supabase', 'Vercel', 'UploadThing', 'Pinecone', 'Langchain'],
        aiFeatures: ['Personalized AI Agents', 'gAIge summarizer', 'AI Austen Voice'],
        details: 'This project demonstrates how quickly a functional Slack clone can be built using modern tools and AI assistance. The implementation includes real-time messaging, user authentication, and AI-powered features.',
        notes: 'This was my first time developing ever. Started my journey into software development with this project.',
        videos: ['chatgenius_week1.mp4', 'chatgenius_week2_mvp.mp4'],
        repoUrl: 'https://github.com/GageMcCoy12/ChatGenius'
    },
    'AutoCRM': {
        title: 'AutoCRM',
        description: 'A ZenDesk Clone focused on customer relationship management with powerful AI automation.',
        technologies: ['React', 'Node.js', 'MongoDB', 'OpenAI API', 'Pinecone', 'Langchain'],
        aiFeatures: ['Auto Ticket Resolution', 'Auto Ticket Escalation', 'Auto Customer Support from knowledge base'],
        details: 'AutoCRM streamlines customer support workflows with AI-powered automation. The system can automatically resolve common tickets, escalate complex issues to the right team members, and provide customer support by pulling information from your knowledge base.',
        notes: 'This project was focused on learning AI Agents and how they could be implemented in a business context.',
        videos: ['autocrm_week1_mvp.mp4', 'autocrm_week2.mp4'],
        repoUrl: 'https://github.com/GageMcCoy12/gm-autocrm'
    },
    'Queued': {
        title: 'Queued',
        description: 'A TikTok Clone focused on music with full base functionality plus innovative AI features.',
        technologies: ['Swift', 'Appwrite', 'Apple Music API', 'TensorFlow'],
        aiFeatures: ['Song to Sheet Music conversion', 'AI music recommendation system'],
        details: 'Queued combines social media with music discovery. The app features Apple Music integration and innovative AI tools like automatic sheet music generation. This project was a significant milestone in developing product skills and understanding user experience design.',
        notes: 'My first mobile app, built while I was sick. This was my first time using Swift and Appwrite, which became my go-to for later mobile projects.',
        videos: [],
        repoUrl: 'https://github.com/Gauntlet-AI/Queued'
    },
    'shotcut': {
        title: 'Shotcut',
        description: 'Contributions to the open-source video editor with added AI capabilities.',
        technologies: ['C++', 'Qt', 'FFmpeg', 'OpenCV', 'Shotcut'],
        aiFeatures: ['Auto tag clips', 'Auto suggest cuts to beat', 'Automatic audio ducking'],
        details: 'Enhanced the open-source video editor Shotcut with AI-powered features to streamline the editing workflow. Added YouTube Music auto download functionality and intelligent audio processing to make video editing faster and more intuitive.',
        notes: 'This was my first open-source project and first time using C++. Built upon Queued\'s success, this project was when everything CLICKED - I was able to connect product/customer needs to my experience in marketing and business.',
        videos: ['shotcut.mp4'],
        repoUrl: 'https://github.com/Gauntlet-AI/shotcut'
    },
    'Marker Magic!': {
        title: 'Marker Magic!',
        description: 'A hackathon project: Fully automated AI creativity helper for artists.',
        technologies: ['Swift', 'Appwrite', 'OpenAI API', 'StableDiffusion'],
        aiFeatures: ['Color scanning and suggestion', 'AI art generation', 'Automatic color-by-number conversion'],
        details: 'Developed in collaboration with high school business teacher Nick Redd, Marker Magic allows artists to scan colors, receive AI suggestions, generate art based on those suggestions, and automatically convert the art into color-by-number templates. This project is being developed further beyond the hackathon.',
        notes: 'My first hackathon ever and first time making an app for someone else. This project significantly boosted my confidence and encouraged me to take more risks.',
        videos: [],
        repoUrl: 'https://github.com/GageMcCoy12/marker_scanner'
    },
    'OTD': {
        title: 'OTD',
        description: 'Outfit of the Day - A fashion-focused social media platform developed with Sloane.',
        technologies: ['Swift', 'Appwrite', 'OpenAI', 'SAM (Segment Anything Model from META)'],
        aiFeatures: ['AI Clothing Item Detection', 'AI Fashion Assistant'],
        details: 'OTD is a social platform where users can share their daily outfits and get fashion recommendations. The app uses AI to detect clothing items in photos and provide personalized fashion advice based on user preferences and current trends.',
        notes: 'The culmination of all previous projects, using specific models and techniques learned along the way. Like Marker Magic, this project boosted my confidence and encouraged me to put myself out there more.',
        videos: [],
        repoUrl: 'https://github.com/GageMcCoy12/ootd'
    }
};

// Camera rotation parameters
const cameraRadius = 35; // Average distance from center
const cameraHeight = 25; // Average height
const cameraHeightVariation = 15; // How much height varies
const totalAngle = Math.PI * 2; // Full 360 degrees
const angleStep = totalAngle / cameraPathPoints.length; // Angle between points

// Animation state
let targetAngle = 0; // Target angle to animate to
let currentAngle = 0; // Current angle of the camera
let isAnimating = false; // Flag to track if animation is in progress
let scrollDirection = 0; // Direction of scroll
let momentum = 0; // Current momentum (angular velocity)
const scrollSensitivity = 0.01; // How sensitive the scroll is
const momentumDecay = 0.25; // How quickly momentum decays naturally (0-1, higher = less decay)
const slowdownThreshold = 0.15; // How close to a point before we slow down
const slowdownFactor = 0.5; // How much to slow down by near points (0-1, lower = more slowdown)

// Create HTML UI for point indicators
function createPointIndicators() {
    // Remove any existing UI
    const existingUI = document.getElementById('point-indicators');
    if (existingUI) {
        existingUI.remove();
    }
    
    // Create container for the position indicator
    const container = document.createElement('div');
    container.id = 'point-indicators';
    container.style.position = 'absolute';
    container.style.top = '20px'; // Position at top
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.pointerEvents = 'none'; // Don't interfere with 3D scene
    container.style.zIndex = '1000';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    
    // Create indicator element
    const indicator = document.createElement('div');
    indicator.style.padding = '15px 30px';
    indicator.style.borderRadius = '10px';
    indicator.style.backgroundColor = cameraPathPoints[0].color;
    indicator.style.color = 'white';
    indicator.style.fontFamily = 'Arial, sans-serif';
    indicator.style.fontSize = '24px';
    indicator.style.fontWeight = 'bold';
    indicator.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    indicator.style.opacity = '0';
    indicator.style.transition = 'opacity 0.3s ease, background-color 0.3s ease';
    indicator.textContent = cameraPathPoints[0].name;
    
    container.appendChild(indicator);
    document.body.appendChild(container);
    
    // Create project info panel
    createProjectInfoPanel();
    
    return indicator;
}

// Create project info panel
function createProjectInfoPanel() {
    // Remove any existing panel
    const existingPanel = document.getElementById('project-info-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'project-info-panel';
    panel.style.position = 'absolute';
    panel.style.top = '20px'; // Keep at top
    panel.style.left = '20px';
    panel.style.width = '350px'; // Fixed width
    panel.style.maxWidth = '90vw'; // Responsive max width
    panel.style.height = 'calc(80vh - 40px)'; // Restored height
    panel.style.overflowY = 'auto';
    panel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    panel.style.borderRadius = '12px';
    panel.style.padding = '25px';
    panel.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.zIndex = '999';
    panel.style.opacity = '0';
    panel.style.transition = 'opacity 0.5s ease';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    
    // Project info content - will be updated based on current position
    updateProjectInfoContent(panel, 0); // Initialize with first project
    
    document.body.appendChild(panel);
    
    // Create buttons container below the panel
    createButtonsContainer(0); // Initialize with first project
}

// Update project info content based on current position
function updateProjectInfoContent(panel, projectIndex) {
    // Clear existing content
    panel.innerHTML = '';
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.flexGrow = '1';
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';
    contentContainer.style.height = 'calc(100% - 80px)'; // Reduced from 100px to 80px
    panel.appendChild(contentContainer);
    
    const projectName = cameraPathPoints[projectIndex].name;
    const project = projectData[projectName];
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = project.title;
    title.style.marginTop = '0';
    title.style.fontSize = '22px'; // Reduced from default h2 size
    title.style.color = '#333';
    contentContainer.appendChild(title);
    
    // Create description
    const description = document.createElement('p');
    description.textContent = project.description;
    description.style.fontSize = '14px'; // Reduced from 16px
    description.style.lineHeight = '1.4'; // Reduced from 1.5
    description.style.color = '#555';
    contentContainer.appendChild(description);
    
    // Create technologies section
    const techTitle = document.createElement('h3');
    techTitle.textContent = 'Technologies Used:';
    techTitle.style.marginBottom = '3px'; // Reduced from 5px
    techTitle.style.marginTop = '10px'; // Added margin top
    techTitle.style.fontSize = '16px'; // Reduced from default h3 size
    techTitle.style.color = '#333';
    contentContainer.appendChild(techTitle);
    
    const techList = document.createElement('ul');
    techList.style.paddingLeft = '20px';
    techList.style.marginTop = '3px'; // Reduced from 5px
    techList.style.marginBottom = '10px'; // Added margin bottom
    project.technologies.forEach(tech => {
        const item = document.createElement('li');
        item.textContent = tech;
        item.style.marginBottom = '3px'; // Reduced from 5px
        item.style.fontSize = '13px'; // Added font size
        item.style.color = '#555';
        techList.appendChild(item);
    });
    contentContainer.appendChild(techList);
    
    // Create AI features section
    const aiTitle = document.createElement('h3');
    aiTitle.textContent = 'AI Features:';
    aiTitle.style.marginBottom = '3px'; // Reduced from 5px
    aiTitle.style.fontSize = '16px'; // Reduced from default h3 size
    aiTitle.style.color = '#333';
    contentContainer.appendChild(aiTitle);
    
    const aiList = document.createElement('ul');
    aiList.style.paddingLeft = '20px';
    aiList.style.marginTop = '3px'; // Reduced from 5px
    aiList.style.marginBottom = '10px'; // Added margin bottom
    project.aiFeatures.forEach(feature => {
        const item = document.createElement('li');
        item.textContent = feature;
        item.style.marginBottom = '3px'; // Reduced from 5px
        item.style.fontSize = '13px'; // Added font size
        item.style.color = '#555';
        aiList.appendChild(item);
    });
    contentContainer.appendChild(aiList);
    
    // Create details section
    const detailsTitle = document.createElement('h3');
    detailsTitle.textContent = 'Details:';
    detailsTitle.style.marginBottom = '3px'; // Reduced from 5px
    detailsTitle.style.fontSize = '16px'; // Reduced from default h3 size
    detailsTitle.style.color = '#333';
    contentContainer.appendChild(detailsTitle);
    
    const details = document.createElement('p');
    details.textContent = project.details;
    details.style.fontSize = '13px'; // Reduced from 14px
    details.style.lineHeight = '1.4'; // Reduced from 1.5
    details.style.color = '#555';
    contentContainer.appendChild(details);
    
    // Create notes section
    const notesTitle = document.createElement('h3');
    notesTitle.textContent = 'Personal Notes:';
    notesTitle.style.marginBottom = '3px'; // Reduced from 5px
    notesTitle.style.marginTop = '10px'; // Reduced from 15px
    notesTitle.style.fontSize = '16px'; // Reduced from default h3 size
    notesTitle.style.color = '#333';
    contentContainer.appendChild(notesTitle);
    
    const notes = document.createElement('p');
    notes.textContent = project.notes;
    notes.style.fontSize = '13px'; // Reduced from 14px
    notes.style.lineHeight = '1.4'; // Reduced from 1.5
    notes.style.fontStyle = 'italic';
    notes.style.color = '#555';
    notes.style.backgroundColor = 'rgba(255, 255, 200, 0.3)';
    notes.style.padding = '8px'; // Reduced from 10px
    notes.style.borderRadius = '5px';
    contentContainer.appendChild(notes);
}

// Function to create buttons container below the panel
function createButtonsContainer(projectIndex) {
    // Remove any existing buttons container
    const existingContainer = document.getElementById('buttons-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    const projectName = cameraPathPoints[projectIndex].name;
    const project = projectData[projectName];
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'buttons-container';
    buttonsContainer.style.position = 'fixed'; // Fixed position instead of absolute
    buttonsContainer.style.left = '50%'; // Center horizontally
    buttonsContainer.style.transform = 'translateX(-50%)'; // Center horizontally
    buttonsContainer.style.bottom = '20px'; // Position at bottom of page
    buttonsContainer.style.width = '350px'; // Match panel width
    buttonsContainer.style.maxWidth = '90vw'; // Responsive max width
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';
    buttonsContainer.style.padding = '15px';
    buttonsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    buttonsContainer.style.borderRadius = '12px';
    buttonsContainer.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    buttonsContainer.style.zIndex = '999';
    buttonsContainer.style.opacity = '0';
    buttonsContainer.style.transition = 'opacity 0.5s ease';
    
    // Create Resume button
    const resumeButton = document.createElement('button');
    resumeButton.textContent = 'Resume';
    resumeButton.style.padding = '10px 20px';
    resumeButton.style.backgroundColor = '#34A853'; // Green color
    resumeButton.style.color = 'white';
    resumeButton.style.border = 'none';
    resumeButton.style.borderRadius = '5px';
    resumeButton.style.fontWeight = 'bold';
    resumeButton.style.fontSize = '14px';
    resumeButton.style.cursor = 'pointer';
    resumeButton.style.transition = 'background-color 0.2s ease';
    resumeButton.style.flex = '1';
    resumeButton.style.marginRight = '10px';
    resumeButton.addEventListener('mouseover', () => {
        resumeButton.style.backgroundColor = '#2E8B57'; // Darker green on hover
    });
    resumeButton.addEventListener('mouseout', () => {
        resumeButton.style.backgroundColor = '#34A853';
    });

    // Add click event for resume button
    resumeButton.addEventListener('click', () => {
        showResume();
    });

    buttonsContainer.appendChild(resumeButton);
    
    // Create Code button
    const codeButton = document.createElement('button');
    codeButton.textContent = 'Code';
    codeButton.style.padding = '10px 20px';
    codeButton.style.backgroundColor = '#4285F4';
    codeButton.style.color = 'white';
    codeButton.style.border = 'none';
    codeButton.style.borderRadius = '5px';
    codeButton.style.fontWeight = 'bold';
    codeButton.style.fontSize = '14px';
    codeButton.style.cursor = 'pointer';
    codeButton.style.transition = 'background-color 0.2s ease';
    codeButton.style.flex = '1';
    codeButton.style.marginLeft = '5px';
    codeButton.style.marginRight = '5px';
    codeButton.addEventListener('mouseover', () => {
        codeButton.style.backgroundColor = '#3367D6';
    });
    codeButton.addEventListener('mouseout', () => {
        codeButton.style.backgroundColor = '#4285F4';
    });

    // Add click event for code button
    codeButton.addEventListener('click', () => {
        // Check if project has a repository URL
        if (project.repoUrl) {
            // Open GitHub repository in a new tab
            window.open(project.repoUrl, '_blank');
        } else {
            alert('No code repository available for this project.');
        }
    });

    buttonsContainer.appendChild(codeButton);
    
    // Create Video button
    const videoButton = document.createElement('button');
    videoButton.textContent = 'Video';
    videoButton.style.padding = '10px 20px';
    videoButton.style.backgroundColor = '#EA4335';
    videoButton.style.color = 'white';
    videoButton.style.border = 'none';
    videoButton.style.borderRadius = '5px';
    videoButton.style.fontWeight = 'bold';
    videoButton.style.fontSize = '14px';
    videoButton.style.cursor = 'pointer';
    videoButton.style.transition = 'background-color 0.2s ease';
    videoButton.style.flex = '1';
    videoButton.style.marginLeft = '10px';
    videoButton.addEventListener('mouseover', () => {
        videoButton.style.backgroundColor = '#C62828';
    });
    videoButton.addEventListener('mouseout', () => {
        videoButton.style.backgroundColor = '#EA4335';
    });

    // Add click event for video button
    videoButton.addEventListener('click', () => {
        // Check if project has videos
        if (project.videos && project.videos.length > 0) {
            // Show video tab on the right side
            showVideoTab(project.videos, projectName);
        } else {
            alert('No videos available for this project.');
        }
    });

    buttonsContainer.appendChild(videoButton);
    document.body.appendChild(buttonsContainer);
    
    // Make the buttons container visible
    setTimeout(() => {
        buttonsContainer.style.opacity = '1';
    }, 100);
}

// Function to show video tab on the right side
function showVideoTab(videos, projectName) {
    // Remove any existing video tab
    const existingTab = document.getElementById('video-tab');
    if (existingTab) {
        existingTab.remove();
    }
    
    // Create video tab container
    const videoTab = document.createElement('div');
    videoTab.id = 'video-tab';
    videoTab.style.position = 'fixed';
    videoTab.style.top = '20px';
    videoTab.style.right = '20px';
    videoTab.style.width = '350px';
    videoTab.style.maxHeight = 'calc(80vh - 40px)';
    videoTab.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    videoTab.style.borderRadius = '12px';
    videoTab.style.padding = '25px';
    videoTab.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    videoTab.style.zIndex = '1500';
    videoTab.style.overflowY = 'auto';
    videoTab.style.display = 'flex';
    videoTab.style.flexDirection = 'column';
    
    // Create header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = `${projectName} Videos`;
    title.style.margin = '0';
    title.style.color = '#333';
    title.style.fontSize = '22px';
    header.appendChild(title);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#333';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '5px';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.transition = 'background-color 0.2s ease';
    
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    });
    
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = 'transparent';
    });
    
    closeButton.addEventListener('click', () => {
        videoTab.remove();
    });
    
    header.appendChild(closeButton);
    videoTab.appendChild(header);
    
    // Create video list
    const videoList = document.createElement('div');
    videoList.style.display = 'flex';
    videoList.style.flexDirection = 'column';
    videoList.style.gap = '15px';
    
    videos.forEach(video => {
        // Create video item
        const videoItem = document.createElement('div');
        videoItem.style.backgroundColor = '#f5f5f5';
        videoItem.style.borderRadius = '8px';
        videoItem.style.padding = '15px';
        videoItem.style.cursor = 'pointer';
        videoItem.style.transition = 'background-color 0.2s ease';
        
        // Create video title
        const videoTitle = document.createElement('h3');
        videoTitle.textContent = video.replace('.mp4', '').replace(/_/g, ' ');
        videoTitle.style.margin = '0';
        videoTitle.style.color = '#333';
        videoTitle.style.fontSize = '16px';
        videoItem.appendChild(videoTitle);
        
        // Add hover effect
        videoItem.addEventListener('mouseover', () => {
            videoItem.style.backgroundColor = '#e0e0e0';
        });
        
        videoItem.addEventListener('mouseout', () => {
            videoItem.style.backgroundColor = '#f5f5f5';
        });
        
        // Add click event
        videoItem.addEventListener('click', () => {
            playVideo(video);
        });
        
        videoList.appendChild(videoItem);
    });
    
    videoTab.appendChild(videoList);
    document.body.appendChild(videoTab);
}

// Function to play a video
function playVideo(videoFile) {
    // Remove any existing video player
    const existingPlayer = document.getElementById('video-player-modal');
    if (existingPlayer) {
        existingPlayer.remove();
    }
    
    // Create video player modal
    const modal = document.createElement('div');
    modal.id = 'video-player-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    
    // Create video element
    const video = document.createElement('video');
    video.style.maxWidth = '90%';
    video.style.maxHeight = '90%';
    video.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    video.controls = true;
    video.autoplay = true;
    
    // Set video source
    const source = document.createElement('source');
    source.src = `videos/${videoFile}`;
    source.type = 'video/mp4';
    
    video.appendChild(source);
    modal.appendChild(video);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = 'white';
    closeButton.style.border = '2px solid white';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    
    closeButton.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.appendChild(closeButton);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Close modal when clicking outside the video
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

// Function to update camera position based on current angle
function updateCameraPosition() {
    // Calculate base position on the circle
    const x = Math.sin(currentAngle) * cameraRadius;
    const z = Math.cos(currentAngle) * cameraRadius;
    
    // Add height variation based on sine wave
    const heightOffset = Math.sin(currentAngle * 2) * cameraHeightVariation;
    const y = cameraHeight + heightOffset;
    
    // Update camera position
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
    
    // Update controls target
    controls.target.set(0, 0, 0);
    
    // Update UI indicator
    updatePointIndicator();
}

// Function to update the HTML point indicator based on camera position
function updatePointIndicator() {
    const indicator = document.getElementById('point-indicators')?.children[0];
    if (!indicator) return;
    
    // Find the closest point
    let closestPointIndex = 0;
    let closestDistance = Infinity;
    
    cameraPathPoints.forEach((point, index) => {
        // Calculate distance from current angle to this point's angle
        const pointAngle = index * angleStep;
        let angleDiff = Math.abs(currentAngle - pointAngle);
        
        // Handle wraparound (e.g. difference between 355° and 5°)
        angleDiff = Math.min(angleDiff, totalAngle - angleDiff);
        
        if (angleDiff < closestDistance) {
            closestDistance = angleDiff;
            closestPointIndex = index;
        }
    });
    
    // Calculate opacity based on proximity (max opacity when at the point)
    // Increased from 0.3 to 0.5 for a larger display window
    const maxAngleDiff = angleStep * 0.5; 
    const opacity = Math.max(0, 1 - (closestDistance / maxAngleDiff));
    
    // Update indicator
    indicator.style.opacity = opacity.toString();
    indicator.style.backgroundColor = cameraPathPoints[closestPointIndex].color;
    indicator.textContent = cameraPathPoints[closestPointIndex].name;
    
    // Update project info panel
    const panel = document.getElementById('project-info-panel');
    if (panel) {
        // Update content if we're close to a point
        // Reduced threshold from 0.7 to 0.4 to show panel earlier
        if (opacity > 0.4) {
            updateProjectInfoContent(panel, closestPointIndex);
            panel.style.opacity = opacity.toString();
            
            // Update buttons container
            const buttonsContainer = document.getElementById('buttons-container');
            if (buttonsContainer) {
                buttonsContainer.style.opacity = opacity.toString();
            } else {
                // Create buttons container if it doesn't exist
                createButtonsContainer(closestPointIndex);
            }
        } else {
            panel.style.opacity = '0';
            
            // Hide buttons container
            const buttonsContainer = document.getElementById('buttons-container');
            if (buttonsContainer) {
                buttonsContainer.style.opacity = '0';
            }
        }
    }
}

// Animation loop for smooth camera movement
function animateCamera() {
    // Check if we're near a project point to apply additional slowdown
    const proximityFactor = getProximityFactor();
    
    // Apply momentum with decay and proximity slowdown
    if (Math.abs(momentum) > 0.0001) {
        // Apply momentum to current angle
        currentAngle += momentum;
        
        // Apply natural decay to momentum
        momentum *= momentumDecay;
        
        // Apply additional slowdown based on proximity to points
        momentum *= proximityFactor;
        
        // Keep angle in 0-2π range
        currentAngle = (currentAngle + totalAngle) % totalAngle;
        
        // Update camera position
        updateCameraPosition();
        
        // Continue animation
        requestAnimationFrame(animateCamera);
    } else {
        // Stop animation when momentum is effectively zero
        isAnimating = false;
        momentum = 0;
    }
}

// Get proximity factor based on distance to nearest project point
function getProximityFactor() {
    // Find the closest point
    let closestDistance = Infinity;
    
    cameraPathPoints.forEach((point, index) => {
        // Calculate distance from current angle to this point's angle
        const pointAngle = index * angleStep;
        let angleDiff = Math.abs(currentAngle - pointAngle);
        
        // Handle wraparound (e.g. difference between 355° and 5°)
        angleDiff = Math.min(angleDiff, totalAngle - angleDiff);
        
        if (angleDiff < closestDistance) {
            closestDistance = angleDiff;
        }
    });
    
    // If we're close to a point, apply slowdown
    if (closestDistance < slowdownThreshold) {
        // Calculate slowdown factor - closer to point = more slowdown
        // Map distance from 0-threshold to slowdownFactor-1
        // When at the point: slowdownFactor, when at threshold: 1 (no slowdown)
        return slowdownFactor + (1 - slowdownFactor) * (closestDistance / slowdownThreshold);
    }
    
    // No additional slowdown if not near a point
    return 1.0;
}

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // Increase exposure
renderer.outputEncoding = THREE.sRGBEncoding; // Use sRGB encoding for better color accuracy
document.body.appendChild(renderer.domElement);

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add bloom effect for glow
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,    // strength - increased for more intense bloom
    0.5,    // radius - increased for wider glow
    0.6     // threshold - decreased to catch more light sources
);
composer.addPass(bloomPass);

// Add environment map for reflections
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Create a simple environment map
const cubeRenderTarget = pmremGenerator.fromScene(new THREE.Scene());
const envMap = cubeRenderTarget.texture;
scene.environment = envMap;

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);

// Restrict camera movement to stay topside
controls.minPolarAngle = Math.PI * 0.17; // About 30 degrees from top (prevents looking straight down)
controls.maxPolarAngle = Math.PI * 0.5; // 90 degrees (prevents going below ground)

// Allow full horizontal rotation
// No azimuthal angle restrictions

// Disable all controls to prevent interference with our custom camera movement
controls.enabled = false;
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = false;

// Lighting setup
// Moderate ambient light for better base illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Add a directional light for better visibility
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 150;
directionalLight.shadow.camera.left = -75;
directionalLight.shadow.camera.right = 75;
directionalLight.shadow.camera.top = 75;
directionalLight.shadow.camera.bottom = -75;
scene.add(directionalLight);

// Create a stronger point light at the center of the minecraft world
const worldLight = new THREE.PointLight(0xffffff, 2.5, 150);
worldLight.position.set(0, 30, 0);
worldLight.castShadow = true;
worldLight.shadow.mapSize.width = 2048;
worldLight.shadow.mapSize.height = 2048;
worldLight.shadow.camera.near = 0.5;
worldLight.shadow.camera.far = 150;
scene.add(worldLight);

// Add a special light that affects all objects
const specialLight = new THREE.PointLight(0xffffff, 50, 200);
specialLight.position.set(0, 30, 0);
// Set this light to affect all objects
specialLight.layers.enableAll();
scene.add(specialLight);

// Add more blindingly bright lights from different angles
const brightLight1 = new THREE.PointLight(0xffffff, 50, 200);
brightLight1.position.set(20, 20, 20);
brightLight1.layers.enableAll();
scene.add(brightLight1);

const brightLight2 = new THREE.PointLight(0xffffff, 50, 200);
brightLight2.position.set(-20, 20, -20);
brightLight2.layers.enableAll();
scene.add(brightLight2);

// Create green grass floor
/* 
const floorGeometry = new THREE.BoxGeometry(50, 2, 50); // Thicker floor (0.5 height)
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x4CAF50, // Green color for grass
    metalness: 0.0,
    roughness: 0.8
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1.25; // Adjusted to account for thickness
floor.receiveShadow = true;
scene.add(floor);
*/

// Add some floating colored lights
const redLight = new THREE.PointLight(0xff0000, 5, 20);
redLight.position.set(10, 15, 10);
scene.add(redLight);

const blueLight = new THREE.PointLight(0x0000ff, 5, 20);
blueLight.position.set(-10, 15, -10);
scene.add(blueLight);

const greenLight = new THREE.PointLight(0x00ff00, 5, 20);
greenLight.position.set(-10, 15, 10);
scene.add(greenLight);

// Initialize loaders
const textureLoader = new TextureLoader();
const worldLoader = new WorldLoader();

// Default render height range
let minRenderHeight = -1;
let maxRenderHeight = 189;

// Debug flag to toggle post-processing
let usePostProcessing = true; // Enable post-processing by default

// Start initialization
init().catch(error => {
    console.error('Failed to initialize:', error);
});

async function init() {
    try {
        // Load blocks
        const allBlocks = await worldLoader.loadSpawnChunk();
        
        // Log all slabs we received
        console.log('🧱 ALL SLABS RECEIVED:', allBlocks.filter(b => b.type.includes('slab')).map(b => ({
            type: b.type,
            isUpperSlab: b.isUpperSlab,
            extra_data: b.extra_data,
            position: [b.x, b.y, b.z]
        })));
        
        // Calculate center point of the build
        const centerX = Math.floor((117 + 139) / 2); // center X = 128
        const centerZ = Math.floor((18 + 36) / 2);   // center Z = 27
        
        // Filter blocks and transform wood types to spruce
        const blocks = allBlocks.filter(block => {
            // Check height bounds
            if (block.y < minRenderHeight || block.y > maxRenderHeight) {
                return false;
            }
            
            // Calculate distance from center
            const dx = block.x - centerX;
            const dz = block.z - centerZ;
            const distanceFromCenter = Math.sqrt(dx * dx + dz * dz);
            
            // Filter out blocks more than 75 blocks away
            if (distanceFromCenter > 75) {
                return false;
            }
            
            return true;
        }).map(block => {
            // Special case for cobwebs
            if (block.type === 'cobweb' || block.type === 'web') {
                return {
                    ...block,
                    type: 'web',
                    texture: 'web.png',
                    renderType: 'cross',  // This will make it render like plants
                    transparent: true,     // Enable transparency
                    opacity: 0.8,         // Set opacity level
                    alphaTest: 0.1,       // Only render pixels above this opacity threshold
                    doubleSided: true,    // Render both sides of the planes
                    isCross: true,        // Tells the renderer to use crossed planes geometry
                    x: block.x - centerX,
                    z: block.z - centerZ
                };
            }

            // Transform wood types to spruce
            let type = block.type;
            
            // Handle prefixed wood types
            if (type.includes('oak_') || type.includes('birch_') || type.includes('dark_oak_') || 
                type.includes('acacia_') || type.includes('jungle_') || type.includes('mangrove_') ||
                type.includes('cherry_') || type.includes('crimson_') || type.includes('warped_')) {
                type = type.replace(/(oak|birch|dark_oak|acacia|jungle|mangrove|cherry|crimson|warped)_/, 'spruce_');
            }
            
            // Handle plain planks and logs
            if (type === 'planks') {
                type = 'spruce_planks';
            } else if (type === 'log' || type === 'wood') {
                type = 'stripped_spruce_log';
            }
            
            return {
                ...block,
                type,
                x: block.x - centerX,
                z: block.z - centerZ,
                material: block.material?.includes('_wood') || block.material === 'wood' ? 'spruce_wood' : block.material
            };
        });
        
        console.log(`Rendering ${blocks.length} blocks centered at (0,0)`);
        
        // Create instanced meshes
        const instanceGroups = new Map();
        
        // First pass: count instances of each block type with its properties
        for (const block of blocks) {
            // Create a unique key based on block type and properties
            let key = block.type;
            
            // Handle slabs - create separate groups for upper and lower slabs
            if (block.isUpperSlab !== undefined || (block.extra_data && block.extra_data.isUpperSlab !== undefined)) {
                const isUpperSlab = block.isUpperSlab ?? block.extra_data?.isUpperSlab ?? false;
                console.log(` Processing slab in main.js:`, {
                    type: block.type,
                    isUpper: isUpperSlab,
                    position: [block.x, block.y, block.z]
                });
                key = `${block.type}_slab_${isUpperSlab ? 'upper' : 'lower'}`;
                
                if (!instanceGroups.has(key)) {
                    console.log(`🎯 Creating new instance group for ${key}`);
                    instanceGroups.set(key, {
                        type: block.type,
                        options: {
                            isUpperSlab: isUpperSlab
                        },
                        positions: [],
                        count: 0
                    });
                }
                
                // Add position without y-offset since it's handled in geometry
                instanceGroups.get(key).positions.push({
                    x: block.x - centerX,
                    y: block.y,
                    z: block.z - centerZ
                });
                instanceGroups.get(key).count++;
            }
            // Handle colored blocks (concrete, concrete_powder, wool)
            else if (block.type.includes('concrete') || block.type.includes('wool')) {
                console.log(`🎨 Processing colored block:`, {
                    type: block.type,
                    color: block.color,
                    position: [block.x, block.y, block.z]
                });
                
                // Use block type as key since color is part of the type now
                if (!instanceGroups.has(key)) {
                    console.log(`🎯 Creating new instance group for ${key}`);
                    instanceGroups.set(key, {
                        type: block.type,
                        options: {
                            color: block.color || 'white' // default to white if no color specified
                        },
                        positions: [],
                        count: 0
                    });
                }
                
                instanceGroups.get(key).positions.push({
                    x: block.x - centerX,
                    y: block.y,
                    z: block.z - centerZ
                });
                instanceGroups.get(key).count++;
            }
            // Handle stairs - create groups based on facing direction and half
            else if (block.type.includes('_stairs') || block.type === 'stairs') {
                const facing = block.facing || 'east';
                const half = block.half || 'bottom';
                const shape = block.shape || 'straight';
                
                console.log(`🏗️ Processing stair in main.js:`, {
                    type: block.type,
                    facing: facing,
                    half: half,
                    position: [block.x, block.y, block.z]
                });
                
                // Create a unique key for each stair configuration
                key = `${block.type}_facing_${facing}_half_${half}`;

                if (!instanceGroups.has(key)) {
                    console.log(`🎯 Creating new instance group for ${key}`);
                    instanceGroups.set(key, {
                        type: block.type,
                        options: {
                            facing: facing,
                            half: half,
                            shape: shape
                        },
                        positions: [],
                        count: 0
                    });
                }

                // Add position to the instance group
                instanceGroups.get(key).positions.push({
                    x: block.x,
                    y: block.y,
                    z: block.z
                });
                instanceGroups.get(key).count++;
            }
            // Handle trapdoors
            else if (block.type.includes('_trapdoor') || block.type === 'trapdoor') {
                // Get trapdoor state from block data
                const trapdoorState = block.trapdoorState || {};
                const facing = trapdoorState.facing || 'north';
                const isOpen = trapdoorState.open === true || trapdoorState.open === 'true';
                const isTop = trapdoorState.half === 'top';
                
                console.log('🏗️ CREATING TRAPDOOR:', {
                    position: [block.x, block.y, block.z],
                    type: block.type,
                    rawState: block.trapdoorState,
                    processedState: {
                        facing,
                        isOpen,
                        isTop
                    }
                });
                
                // Calculate rotation
                const rotation = getTrapdoorRotation(facing, isOpen);
                
                // Create a unique key for each trapdoor state combination
                key = `${block.type}_${facing}_${isOpen ? 'open' : 'closed'}_${isTop ? 'top' : 'bottom'}`;
                
                // Set up trapdoor options
                const options = {
                    ...block,
                    rotation,
                    isTop,
                    isOpen,
                    key
                };
                
                console.log('🎨 RENDERING TRAPDOOR:', {
                    position: [block.x, block.y, block.z],
                    options,
                    rotation: {
                        radians: rotation,
                        degrees: (rotation * 180 / Math.PI)
                    }
                });
                
                if (!instanceGroups.has(key)) {
                    instanceGroups.set(key, {
                        type: block.type,
                        options: options,
                        positions: [],
                        count: 0
                    });
                }
            } else {
            if (block.connections) {
                const connectionsKey = Object.entries(block.connections)
                    .filter(([_, value]) => value === 'true')
                    .map(([dir, _]) => dir)
                    .sort()
                    .join('_');
                key += `_connections_${connectionsKey || 'none'}`;
            }
            
            if (block.hanging !== undefined) {
                key += `_${block.hanging ? 'hanging' : 'standing'}`;
            }
            
            if (!instanceGroups.has(key)) {
                instanceGroups.set(key, {
                    type: block.type,
                    options: {
                        isUpperSlab: block.isUpperSlab,
                        trapdoorState: block.trapdoorState,
                        connections: block.connections,
                        hanging: block.hanging,
                            material: block.material
                    },
                    positions: [],
                    count: 0
                });
                }
            }
            
            instanceGroups.get(key).positions.push({
                x: block.x,
                y: block.y,
                z: block.z
            });
            instanceGroups.get(key).count++;
        }
        
        // Create template cache
        const templateCache = new Map();
        const loadingPromises = [];
        
        for (const [key, group] of instanceGroups.entries()) {
            // For trapdoors, stairs, and slabs use the full key as the cache key
            const cacheKey = group.type.includes('trapdoor') || 
                           group.type.includes('_stairs') || 
                           group.type === 'stairs' ||
                           group.type.includes('_slab') || 
                           group.type === 'slab'
                ? key 
                : group.type;
            
            if (!templateCache.has(cacheKey)) {
                const loadPromise = textureLoader.loadBlock(group.type, group.options)
                    .then(template => {
                        templateCache.set(cacheKey, template);
                    })
                    .catch(error => {
                        console.error(`Failed to load template for ${group.type}:`, error);
                    });
                loadingPromises.push(loadPromise);
            }
        }
        
        await Promise.all(loadingPromises);
        
        // Create and add instanced meshes
        const instancedMeshes = [];
        
        for (const [key, group] of instanceGroups.entries()) {
            // For trapdoors, stairs, and slabs use the full key as the cache key
            const cacheKey = group.type.includes('trapdoor') || 
                           group.type.includes('_stairs') || 
                           group.type === 'stairs' ||
                           group.type.includes('_slab') || 
                           group.type === 'slab'
                ? key 
                : group.type;
            const templateBlock = templateCache.get(cacheKey);
            
            if (!templateBlock) continue;
            
                    if (templateBlock instanceof THREE.Group) {
                        const containerGroup = new THREE.Group();
                        containerGroup.name = `container_${key}`;
                        
                        for (let i = 0; i < group.positions.length; i++) {
                            const pos = group.positions[i];
                            const blockGroup = new THREE.Group();
                            blockGroup.name = `${key}_${i}`;
                            
                            templateBlock.children.forEach((child, childIndex) => {
                                if (child.isMesh) {
                                    if (i === 0) {
                                        child.userData.clonedGeometry = child.geometry.clone();
                                child.userData.clonedMaterial = Array.isArray(child.material) 
                                    ? child.material.map(m => m.clone())
                                    : child.material.clone();
                            }
                            
                                    const mesh = new THREE.Mesh(
                                        child.userData.clonedGeometry,
                                        child.userData.clonedMaterial
                                    );
                                    
                                    mesh.name = `${key}_${i}_part_${childIndex}`;
                                    mesh.position.copy(child.position);
                                    mesh.rotation.copy(child.rotation);
                                    mesh.scale.copy(child.scale);
                                    mesh.castShadow = true;
                                    mesh.receiveShadow = true;
                                    
                                    blockGroup.add(mesh);
                                }
                            });
                            
                            blockGroup.position.set(pos.x, pos.y, pos.z);
                            containerGroup.add(blockGroup);
                        }
                        
                        scene.add(containerGroup);
                    } else if (templateBlock.geometry && templateBlock.material) {
                        const instancedMesh = new THREE.InstancedMesh(
                            templateBlock.geometry,
                            templateBlock.material,
                            group.positions.length
                        );
                        instancedMesh.name = key;
                        instancedMesh.castShadow = true;
                        instancedMesh.receiveShadow = true;
                        
                        // Ensure normals are computed for the geometry
                        if (templateBlock.geometry && !templateBlock.geometry.attributes.normal) {
                            templateBlock.geometry.computeVertexNormals();
                        }
                        
                        const matrix = new THREE.Matrix4();
                        for (let i = 0; i < group.positions.length; i++) {
                            const pos = group.positions[i];
                            
                            // Reset matrix
                            matrix.identity();
                            
                            // Handle stairs rotation based on facing and half
                            if (group.type.includes('_stairs') || group.type === 'stairs') {
                                const facing = group.options.facing || 'east';
                                const half = group.options.half || 'bottom';
                                
                                // First apply rotation based on facing direction
                                switch (facing) {
                                    case 'north':
                                        matrix.makeRotationY(Math.PI);
                                        break;
                                    case 'south':
                                        matrix.makeRotationY(0);
                                        break;
                                    case 'west':
                                        matrix.makeRotationY(Math.PI * 1.5);
                                        break;
                                    case 'east':
                                        matrix.makeRotationY(Math.PI * 0.5);
                                        break;
                                }
                                
                                // If it's a top half stair, rotate 180 degrees around X axis
                                if (half === 'top') {
                                    const rotationMatrix = new THREE.Matrix4();
                                    rotationMatrix.makeRotationX(Math.PI);
                                    matrix.multiply(rotationMatrix);
                                }
                                
                                // Apply additional Y rotation
                                const yRotationMatrix = new THREE.Matrix4();
                                if (half === 'top') {
                                    yRotationMatrix.makeRotationY(-Math.PI / 2); // 90 degrees
                                } else {
                                    yRotationMatrix.makeRotationY(Math.PI / 2); // -90 degrees
                                }
                                matrix.multiply(yRotationMatrix);
                            }
                            
                            // Apply position
                            matrix.setPosition(pos.x, pos.y, pos.z);
                            instancedMesh.setMatrixAt(i, matrix);
                        }
                        
                        instancedMesh.instanceMatrix.needsUpdate = true;
                        
                        const isTransparent = Array.isArray(templateBlock.material) 
                            ? templateBlock.material.some(m => m && m.transparent) 
                            : (templateBlock.material && templateBlock.material.transparent) || false;
                            
                        instancedMeshes.push({
                            mesh: instancedMesh,
                            isTransparent: isTransparent,
                            isLeaf: key.includes('leaves'),
                            isSlab: key.includes('_slab_')  // Add slab flag for sorting
                        });
            }
        }
        
        // Sort and add instanced meshes
        instancedMeshes.sort((a, b) => {
            if (a.isTransparent && !b.isTransparent) return 1;
            if (!a.isTransparent && b.isTransparent) return -1;
            if (a.isLeaf && !b.isLeaf) return 1;
            if (!a.isLeaf && b.isLeaf) return -1;
            if (a.isSlab && !b.isSlab) return 1;
            if (!a.isSlab && b.isSlab) return -1;
            return 0;
        });
        
        for (const { mesh } of instancedMeshes) {
            scene.add(mesh);
        }
        
        // Apply environment map to all materials
        applyEnvironmentMap();
        
        // Force lighting on all materials
        forceLightingOnAllMaterials();
        
        // Ensure all geometries have normals
        ensureNormals();
        
        // Create HTML point indicators
        createPointIndicators();
        
        // Initialize camera at the first point
        initializeCamera();
        
        cleanupResources();
        
        // Start the animation loop
        animate();
        
    } catch (error) {
        console.error('Error in initialization:', error);
        throw error;
    }
}

// Function to apply environment map to all materials in the scene
function applyEnvironmentMap() {
    scene.traverse((object) => {
        if (object.isMesh && object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (material) {
                        // Apply to any material that supports envMap
                        if (material.isMeshStandardMaterial || 
                            material.isMeshPhongMaterial || 
                            material.isMeshLambertMaterial) {
                            material.envMap = envMap;
                            material.needsUpdate = true;
                        }
                    }
                });
            } else if (object.material) {
                // Apply to any material that supports envMap
                if (object.material.isMeshStandardMaterial || 
                    object.material.isMeshPhongMaterial || 
                    object.material.isMeshLambertMaterial) {
                    object.material.envMap = envMap;
                    object.material.needsUpdate = true;
                }
            }
        }
    });
}

// Function to force lighting on all materials
function forceLightingOnAllMaterials() {
    scene.traverse((object) => {
        if (object.isMesh || object.isInstancedMesh) {
            // Skip menu items
            if (object.userData && object.userData.isMenuOption) {
                return;
            }
            
            // Skip menu background
            if (object.parent && object.parent.type === 'Group' && object.renderOrder === 998) {
                return;
            }
            
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (material) {
                        material.lights = true;
                        material.needsUpdate = true;
                    }
                });
            } else if (object.material) {
                object.material.lights = true;
                object.material.needsUpdate = true;
            }
        }
    });
}

// Function to ensure all geometries have normals
function ensureNormals() {
    scene.traverse((object) => {
        if ((object.isMesh || object.isInstancedMesh) && object.geometry) {
            // Check if normals exist
            if (!object.geometry.attributes.normal) {
                console.log(`Computing normals for ${object.name}`);
                object.geometry.computeVertexNormals();
            }
            
            // Force update
            if (object.geometry.attributes.normal) {
                object.geometry.attributes.normal.needsUpdate = true;
            }
            
            // For instanced meshes, make sure the instance matrix is updated
            if (object.isInstancedMesh) {
                object.instanceMatrix.needsUpdate = true;
            }
        }
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Update all lights in the scene
    const time = Date.now() * 0.001;
    scene.traverse((object) => {
        if (object.isLight && object.parent && object.parent.name && object.parent.name.includes('lantern')) {
            // Add subtle flicker to lantern lights
            const flicker = Math.sin(time * 10 + Math.random()) * 0.2 + 0.9;
            object.intensity = object.userData.baseIntensity || (object.intensity * flicker);
            if (!object.userData.baseIntensity) {
                object.userData.baseIntensity = object.intensity;
            }
        }
    });
    
    // Render with or without post-processing
    if (usePostProcessing) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Add scroll event listener for camera movement
window.addEventListener('wheel', (event) => {
    // Prevent default scrolling behavior
    event.preventDefault();
    
    // Determine scroll direction (negative for down, positive for up)
    scrollDirection = event.deltaY > 0 ? -1 : 1;
    
    // Add to momentum based on scroll direction
    momentum += scrollDirection * scrollSensitivity;
    
    // Start animation if not already running
    if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animateCamera);
    }
}, { passive: false });

// Add key handler to toggle post-processing
window.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        usePostProcessing = !usePostProcessing;
        console.log(`Post-processing: ${usePostProcessing ? 'ON' : 'OFF'}`);
    }
});

// Resource cleanup function
function cleanupResources() {
    if (typeof geometryCache !== 'undefined' && geometryCache instanceof Map) {
        for (const geometry of geometryCache.values()) {
            geometry.dispose();
        }
        geometryCache.clear();
    }
    
    if (window.gc) {
        window.gc();
    }
}

// Scene traversal optimization
const sceneTraversalArray = [];
function optimizedSceneTraversal(callback) {
    sceneTraversalArray.length = 0;
    scene.traverse(object => {
        sceneTraversalArray.push(object);
    });
    
    for (let i = 0; i < sceneTraversalArray.length; i++) {
        callback(sceneTraversalArray[i]);
    }
}

// Scene clearing function
function clearScene(keepObjects = []) {
    const meshesToRemove = [];
    const materialsToDispose = new Set();
    const geometriesToDispose = new Set();
    
    optimizedSceneTraversal(child => {
        if (keepObjects.includes(child)) return;
        
        if (child.isMesh || child.isInstancedMesh) {
            meshesToRemove.push(child);
            
            if (child.geometry) {
                geometriesToDispose.add(child.geometry);
            }
            
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        if (material) materialsToDispose.add(material);
                    });
                } else {
                    materialsToDispose.add(child.material);
                }
            }
            
            if (child.isInstancedMesh) {
                if (child.instanceMatrix) child.instanceMatrix.dispose();
                if (child.instanceColor) child.instanceColor.dispose();
            }
        }
    });
    
    for (const mesh of meshesToRemove) {
        scene.remove(mesh);
    }
    
    for (const geometry of geometriesToDispose) {
        geometry.dispose();
    }
    
    for (const material of materialsToDispose) {
        if (material.map) material.map.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.envMap) material.envMap.dispose();
        material.dispose();
    }
    
    meshesToRemove.length = 0;
    geometriesToDispose.clear();
    materialsToDispose.clear();
}

// Initialize camera at the first point
function initializeCamera() {
    // Start at the first point
    currentAngle = 0;
    targetAngle = 0;
    updateCameraPosition();
}

// Completely disable controls to prevent interference
controls.enabled = false;

// Check if we're exactly at a project point
function checkIfAtProjectPoint() {
    for (let i = 0; i < cameraPathPoints.length; i++) {
        const pointAngle = i * angleStep;
        if (Math.abs(currentAngle - pointAngle) < 0.01) {
            return true;
        }
    }
    return false;
}

// Function to show the resume PDF
function showResume() {
    // Remove any existing resume modal
    const existingModal = document.getElementById('resume-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'resume-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    
    // Create PDF viewer container
    const pdfContainer = document.createElement('div');
    pdfContainer.style.width = '90%';
    pdfContainer.style.height = '90%';
    pdfContainer.style.backgroundColor = 'white';
    pdfContainer.style.borderRadius = '10px';
    pdfContainer.style.overflow = 'hidden';
    pdfContainer.style.position = 'relative';
    
    // Create PDF embed
    const pdfEmbed = document.createElement('embed');
    pdfEmbed.src = 'videos/Resume- Gage McCoy.pdf';
    pdfEmbed.type = 'application/pdf';
    pdfEmbed.style.width = '100%';
    pdfEmbed.style.height = '100%';
    pdfEmbed.style.border = 'none';
    
    pdfContainer.appendChild(pdfEmbed);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeButton.style.color = 'white';
    closeButton.style.border = '2px solid white';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.zIndex = '2001';
    
    closeButton.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.appendChild(pdfContainer);
    modal.appendChild(closeButton);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Close modal when clicking outside the PDF container
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
} 