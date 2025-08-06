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
    return new PIXI.Sprite.from(url);
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
    return new PIXI.Sprite.from(getAssetPath(url));
  }
}
