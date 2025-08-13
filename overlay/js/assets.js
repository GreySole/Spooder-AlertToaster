const { getAsset } = require('node:sea');

function onOSCOpen() {
  let defaultImage = document.createElement('img');
  defaultImage.src =
    pluginSettings.defaultAlertIcon != ''
      ? getAssetPath(pluginSettings.defaultAlertIcon)
      : './assets/img/DefaultAlertIcon.png';
  loadedAssets['img']['default'] = defaultImage;

  let alerts = {
    command: {
      icon: pluginSettings.command?.icon
        ? pluginSettings.command.icon
        : '_/assets/img/CommandAlertIcon.png',
      sound: pluginSettings.command?.sound ?? null,
      boxColor: pluginSettings.command?.customBoxColor
        ? pluginSettings.command?.boxColor
        : pluginSettings.defaultBoxColor,
      borderColor: pluginSettings.command?.customBoxColor
        ? pluginSettings.command?.borderColor
        : pluginSettings.defaultBorderColor,
    },
    warning: {
      icon: pluginSettings.warning?.icon
        ? pluginSettings.warning.icon
        : '_/assets/img/PanicAlertIcon.png',
      sound: pluginSettings.warning?.sound ?? null,
      boxColor: pluginSettings.warning?.customBoxColor
        ? pluginSettings.warning?.boxColor
        : pluginSettings.defaultBoxColor,
      borderColor: pluginSettings.warning?.customBoxColor
        ? pluginSettings.warning?.borderColor
        : pluginSettings.defaultBorderColor,
    },
    urgent: {
      icon: pluginSettings.urgent?.icon
        ? pluginSettings.urgent.icon
        : '_/assets/img/UrgentAlertIcon.png',
      sound: pluginSettings.urgent?.sound ?? null,
      boxColor: pluginSettings.urgent?.customBoxColor
        ? pluginSettings.urgent?.boxColor
        : pluginSettings.defaultBoxColor,
      borderColor: pluginSettings.urgent?.customBoxColor
        ? pluginSettings.urgent?.borderColor
        : pluginSettings.defaultBorderColor,
      text: pluginSettings.urgent?.text ?? 'Uh oh! I think Spooder crashed!',
    },
  };

  window.statusAlerts = alerts;
  console.log('ALERTS', alerts);
  for (let a in alerts) {
    if (alerts[a].sound != null && alerts[a].sound != '') {
      PIXI.sound.add(a + '-sound', findAssetPath(alerts[a].sound));
      app.loader.add(a + '-sound', findAssetPath(alerts[a].sound));
      console.log('SOUND LOADING', a + '-sound');
    }
    if (alerts[a].icon.endsWith('gif')) {
      app.loader.add(a, findAssetPath(alerts[a].icon));
    } else {
      let newImage = document.createElement('img');
      console.log('IMAGE LOADING', alerts[a].icon);
      newImage.src = findAssetPath(alerts[a].icon);
      newImage.onerror = (e) => {
        newImage.src = './assets/img/DefaultAlertIcon.png';
      };
      newImage.onload = () => {
        newImage.width = 120;
        newImage.height = 120;
        if (loadedAssets['img'] == null) {
          loadedAssets['img'] = {};
        }
        loadedAssets['img'][a] = newImage;
        console.log('IMAGE LOADED', a + '');
      };
    }
  }
  app.loader.load((loader, resources) => {
    if (loadedAssets['gif'] == null) {
      loadedAssets['gif'] = {};
    }

    for (let r in resources) {
      if (resources[r].extension == 'gif') {
        loadedAssets['gif'][r] = PIXI.gif.AnimatedGIF.fromBuffer(resources[r].data);
      }
    }
  });
}

function getImg(url) {
  if (!url.startsWith('http')) {
    return;
  }
  return new Promise((res, rej) => {
    if (url.endsWith('.gif')) {
      if (loadedGifs[url] == null) {
        app.loader.add(url, url);

        app.loader.load((loader, resources) => {
          if (loadedAssets['gif'] == null) {
            loadedAssets['gif'] = {};
          }

          loadedAssets['gif'][url] = PIXI.gif.AnimatedGIF.fromBuffer(resources[url].data);
          res();
        });
      }
    } else {
      let newImage = document.createElement('img');
      newImage.src = url;
      newImage.crossOrigin = 'anonymous';
      newImage.onerror = (e) => {
        newImage.src = pluginSettings.defaultAlertIcon
          ? getAssetPath(pluginSettings.defaultAlertIcon)
          : '../assets/img/DefaultAlertIcon.png';
      };
      newImage.onload = () => {
        newImage.width = 120;
        newImage.height = 120;
        if (loadedAssets['img'] == null) {
          loadedAssets['img'] = {};
        }
        loadedAssets['img'][url] = newImage;
        res();
      };
    }
  });
}

function findAssetPath(url) {
  if (url.startsWith('_')) {
    return url.replace('_', '.');
  } else {
    return getAssetPath(url);
  }
}
