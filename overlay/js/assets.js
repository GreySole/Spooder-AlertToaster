function onOSCOpen() {
  let defaultImage = document.createElement('img');
  defaultImage.src = getAssetPath(pluginSettings.defaultAlertIcon);
  loadedAssets['img']['default'] = defaultImage;

  let alerts = {
    command: {
      icon: pluginSettings.command_icon ?? pluginSettings.defaultAlertIcon,
      sound: pluginSettings.command_sound ?? null,
      boxColor: pluginSettings.command_customBoxColor
        ? pluginSettings.command_boxColor
        : pluginSettings.defaultBoxColor,
      borderColor: pluginSettings.command_customBoxColor
        ? pluginSettings.command_borderColor
        : pluginSettings.defaultBorderColor,
    },
    warning: {
      icon: pluginSettings.warning_icon ?? pluginSettings.defaultAlertIcon,
      sound: pluginSettings.warning_sound ?? null,
      boxColor: pluginSettings.warning_customBoxColor
        ? pluginSettings.warning_boxColor
        : pluginSettings.defaultBoxColor,
      borderColor: pluginSettings.warning_customBoxColor
        ? pluginSettings.warning_borderColor
        : pluginSettings.defaultBorderColor,
    },
    urgent: {
      icon: pluginSettings.urgent_icon ?? pluginSettings.defaultAlertIcon,
      sound: pluginSettings.urgent_sound ?? null,
      boxColor: pluginSettings.urgent_customBoxColor
        ? pluginSettings.urgent_boxColor
        : pluginSettings.defaultBoxColor,
      borderColor: pluginSettings.urgent_customBoxColor
        ? pluginSettings.urgent_borderColor
        : pluginSettings.defaultBorderColor,
      text: pluginSettings.urgent_text ?? 'Uh oh! I think Spooder crashed!',
    },
  };

  window.statusAlerts = alerts;
  console.log('ALERTS', alerts);
  for (let a in alerts) {
    if (alerts[a].sound != null && alerts[a].sound != '') {
      PIXI.sound.add(a + '-sound', getAssetPath(alerts[a].sound));
      app.loader.add(a + '-sound', getAssetPath(alerts[a].sound));
      console.log('SOUND LOADING', a + '-sound');
    }
    if (alerts[a].icon.endsWith('gif')) {
      app.loader.add(a, getAssetPath(alerts[a].icon));
    } else {
      let newImage = document.createElement('img');
      newImage.src = getAssetPath(alerts[a].icon);
      newImage.onerror = (e) => {
        newImage.src = getAssetPath(pluginSettings.defaultAlertIcon);
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
        newImage.src = getAssetPath(pluginSettings.defaultAlertIcon);
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
