import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

class CharacterAssetLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  async loadModel(key = 'male') {
    let gltf = this.cache.get(key);

    if (!gltf) {
      const url = `/models/${key}.glb`;
      try {
        gltf = await this.loader.loadAsync(url);
        this.cache.set(key, gltf);
      } catch (err) {
        console.warn(`Could not load GLB for ${key}:`, err);
        return null;
      }
    }

    return this.instantiateGLTF(gltf, key);
  }

  instantiateGLTF(gltf, key) {
    const clonedScene = skeletonClone(gltf.scene);

    // male.glb and female.glb are in centimeters (178cm) -> scale to meters
    const isCentimeterModel = key === 'male' || key === 'female';
    if (isCentimeterModel) {
      clonedScene.scale.setScalar(0.0102);
    } else {
      clonedScene.scale.set(1.0, 1.0, 1.0);
    }

    clonedScene.traverse(node => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = false;
        node.frustumCulled = false;

        if (node.material) {
          node.material = node.material.clone();
          node.material.map = null; // Remove baked texture map so custom hex colors show cleanly
          // ONLY enable vertexColors if the geometry actually contains color attributes!
          node.material.vertexColors = !!(node.geometry && node.geometry.attributes && node.geometry.attributes.color);
          node.material.roughness = 0.65;
          node.material.metalness = 0.1;
        }
      }
    });

    return {
      scene: clonedScene,
      animations: gltf.animations || []
    };
  }
}

export const characterAssets = new CharacterAssetLoader();
