/**
 * Grindstone Factory
 * Contains functions for creating grindstone blocks with custom geometry
 */

import * as THREE from 'three';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
import { loadTexture } from './textureManager.js';

// Cache for grindstone geometries
const grindstoneGeometryCache = new Map();

/**
 * Create a grindstone block mesh
 * @param {string} blockType - The type of grindstone block
 * @param {Object} options - Options for grindstone creation (facing direction, etc.)
 * @returns {Promise<THREE.Group>} - Promise that resolves to the grindstone mesh
 */
export async function createGrindstoneBlock(blockType, options = {}) {
    try {
        console.log(`🛠️ Creating grindstone:`, { blockType, options });
        
        // Get the facing direction (defaults to north)
        const facing = options.facing || 'north';
        
        // Load textures
        const roundTexture = await loadTexture('textures/blocks/grindstone_round.tga');
        const sideTexture = await loadTexture('textures/blocks/grindstone_side.tga');
        const pivotTexture = await loadTexture('textures/blocks/grindstone_pivot.tga');
        
        // Create materials
        const roundMaterial = new THREE.MeshStandardMaterial({
            map: roundTexture,
            roughness: 1.0,
            metalness: 0.0
        });
        
        const sideMaterial = new THREE.MeshStandardMaterial({
            map: sideTexture,
            roughness: 1.0,
            metalness: 0.0
        });
        
        const pivotMaterial = new THREE.MeshStandardMaterial({
            map: pivotTexture,
            roughness: 1.0,
            metalness: 0.0
        });
        
        // Create a group to hold all parts
        const group = new THREE.Group();
        group.name = blockType;
        
        // Create the top frame (full width stone block)
        const frameGeometry = new THREE.BoxGeometry(0.5, 0.3125, 1); // Swapped width and depth
        const frame = new THREE.Mesh(frameGeometry, sideMaterial);
        frame.position.y = 0.34375;
        
        // Create the main grinding wheel (smaller box)
        const wheelGeometry = new THREE.BoxGeometry(0.25, 0.375, 0.5); // Swapped width and depth
        const wheel = new THREE.Mesh(wheelGeometry, [sideMaterial, sideMaterial, roundMaterial, roundMaterial, sideMaterial, sideMaterial]);
        wheel.position.y = -0.3125;
        
        // Create the support legs (thinner and longer)
        const legGeometry = new THREE.BoxGeometry(0.125, 1, 0.125);
        const leftLeg = new THREE.Mesh(legGeometry, sideMaterial);
        const rightLeg = new THREE.Mesh(legGeometry, sideMaterial);
        
        // Position the legs (adjusted for rotated geometry)
        leftLeg.position.set(0, 0, -0.3125);
        rightLeg.position.set(0, 0, 0.3125);
        
        // Add all parts to the group
        group.add(frame);
        group.add(wheel);
        group.add(leftLeg);
        group.add(rightLeg);
        
        // Rotate based on facing direction
        switch (facing) {
            case 'north':
                group.rotation.y = Math.PI;
                break;
            case 'south':
                group.rotation.y = 0;
                break;
            case 'west':
                group.rotation.y = Math.PI * 1.5;
                break;
            case 'east':
                group.rotation.y = Math.PI * 0.5;
                break;
        }
        
        // Enable shadows for all parts
        group.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        return group;
    } catch (error) {
        console.error(`Error creating grindstone ${blockType}:`, error);
        return createFallbackMesh(blockType);
    }
}

/**
 * Create a fallback mesh for when grindstone creation fails
 * @param {string} blockType - The type of block
 * @returns {THREE.Mesh} - A simple fallback mesh
 */
function createFallbackMesh(blockType) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFF00FF,
        roughness: 1.0,
        metalness: 0.0
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `fallback_${blockType}`;
    
    return mesh;
}

/**
 * Check if a block type is a grindstone
 * @param {string} blockType - The type of block
 * @returns {boolean} - Whether the block is a grindstone
 */
export function isGrindstoneBlock(blockType) {
    return blockType === 'grindstone';
}

/**
 * Clear the grindstone geometry cache
 */
export function clearGrindstoneGeometryCache() {
    grindstoneGeometryCache.clear();
} 