/**
 * Material Factory
 * Creates and configures materials for different block types
 */

import * as THREE from 'three';

/**
 * Create a uniform material for blocks with the same texture on all sides
 * @param {THREE.Texture} texture - The texture to use
 * @param {Object} properties - Additional properties for the material
 * @returns {THREE.Material} - The created material
 */
export function createUniformMaterial(texture, properties = {}) {
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: properties.transparent || false,
        alphaTest: properties.alphaCutoff || 0.0,
        opacity: properties.opacity || 1.0,
        color: properties.color || 0xffffff,
        roughness: 1.0,
        metalness: 0.0
    });
    
    return material;
}

/**
 * Create a material for leaf blocks
 * @param {THREE.Texture} texture - The leaf texture
 * @param {Object} properties - Additional properties for the material
 * @returns {THREE.Material} - The created material
 */
export function createLeafMaterial(texture, properties = {}) {
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: properties.alphaCutoff || 0.5,
        color: new THREE.Color(properties.tintColor || 0x2E8B57),
        side: THREE.DoubleSide,
        roughness: 1.0,
        metalness: 0.0
    });
    
    return material;
}

/**
 * Create materials for directional blocks (like logs)
 * @param {THREE.Texture} sideTexture - The texture for the sides
 * @param {THREE.Texture} endTexture - The texture for the ends
 * @param {Object} properties - Additional properties for the material
 * @returns {Array<THREE.Material>} - Array of materials for each face
 */
export function createDirectionalMaterial(sideTexture, endTexture, properties = {}) {
    const sideMaterial = new THREE.MeshStandardMaterial({
        map: sideTexture,
        transparent: properties.transparent || false,
        alphaTest: properties.alphaCutoff || 0.0,
        roughness: 1.0,
        metalness: 0.0
    });
    
    const endMaterial = new THREE.MeshStandardMaterial({
        map: endTexture,
        transparent: properties.transparent || false,
        alphaTest: properties.alphaCutoff || 0.0,
        roughness: 1.0,
        metalness: 0.0
    });
    
    // Order: right, left, top, bottom, front, back
    return [
        sideMaterial, // right
        sideMaterial, // left
        endMaterial,  // top
        endMaterial,  // bottom
        sideMaterial, // front
        sideMaterial  // back
    ];
}

/**
 * Create materials for blocks with different textures for top, bottom, and sides
 * @param {THREE.Texture} topTexture - The texture for the top face
 * @param {THREE.Texture} bottomTexture - The texture for the bottom face
 * @param {THREE.Texture} sideTexture - The texture for the side faces
 * @param {Object} properties - Additional properties for the material
 * @param {string} blockType - The type of block
 * @returns {Array<THREE.Material>} - Array of materials for each face
 */
export function createMultiFaceMaterial(topTexture, bottomTexture, sideTexture, properties = {}, blockType = '') {
    const topMaterial = new THREE.MeshStandardMaterial({
        map: topTexture,
        transparent: properties.transparent || false,
        alphaTest: properties.alphaCutoff || 0.0,
        roughness: 1.0,
        metalness: 0.0
    });
    
    const bottomMaterial = new THREE.MeshStandardMaterial({
        map: bottomTexture,
        transparent: properties.transparent || false,
        alphaTest: properties.alphaCutoff || 0.0,
        roughness: 1.0,
        metalness: 0.0
    });
    
    const sideMaterial = new THREE.MeshStandardMaterial({
        map: sideTexture,
        transparent: properties.transparent || false,
        alphaTest: properties.alphaCutoff || 0.0,
        roughness: 1.0,
        metalness: 0.0
    });
    
    // Apply tint color if specified (for grass blocks and similar)
    if (properties.tintColor) {
        if (blockType === 'grass_block') {
            // For grass blocks, apply tint to top and sides
            topMaterial.color.setHex(properties.tintColor);
            sideMaterial.color.setHex(properties.tintColor);
        } else {
            // For other blocks, just tint the top
            topMaterial.color.setHex(properties.tintColor);
        }
    }
    
    // Order: right, left, top, bottom, front, back
    return [
        sideMaterial,  // right
        sideMaterial,  // left
        topMaterial,   // top
        bottomMaterial,// bottom
        sideMaterial,  // front
        sideMaterial   // back
    ];
}

/**
 * Create a fallback material for missing textures
 * @returns {THREE.Material} - The fallback material
 */
export function createFallbackMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0xFF00FF, // Magenta for visibility
        wireframe: true,
        roughness: 1.0,
        metalness: 0.0
    });
} 