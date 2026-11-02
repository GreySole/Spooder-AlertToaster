/*
    Sprite creation and management
*/

function getSprite(url) {
  console.log('GETTING SPRITE', url);
  if (url == '') {
    return;
  }
  if (loadedAssets['gif'][url] != null) {
    return loadedAssets['gif'][url].clone();
  } else if (loadedAssets['img'][url] != null) {
    return new PIXI.Sprite.from(loadedAssets['img'][url]);
  } else if (loadedAssets[url] != null) {
    return new PIXI.Sprite.from(loadedAssets[url]);
  } else if (url.startsWith('http')) {
    return spriteFromUrl(url);
  } else {
    if (url.endsWith('.gif')) {
      return new Promise((resolve, reject) => {
        fetch(getAssetPath(url))
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            const animatedGIF = PIXI.gif.AnimatedGIF.fromBuffer(buffer);
            loadedAssets['gif'][url] = animatedGIF; // Cache the GIF
            resolve(animatedGIF.clone()); // Return a cloned animated GIF
          })
          .catch((error) => {
            console.error('Failed to load GIF:', error);
            reject(error);
          });
      });
    }
    return spriteFromUrl(getAssetPath(url));
  }
}

// PIXI.Sprite.from() returns a sprite immediately while its texture loads in the
// background, so callers awaiting getSprite() would get a sprite with no image yet.
// Wait for the underlying texture to finish loading before resolving.
function spriteFromUrl(url) {
  const sprite = PIXI.Sprite.from(url);
  const baseTexture = sprite.texture.baseTexture;
  if (baseTexture.valid) {
    return sprite;
  }
  return new Promise((resolve, reject) => {
    baseTexture.once('loaded', () => resolve(sprite));
    baseTexture.once('error', (error) => reject(error));
  });
}
