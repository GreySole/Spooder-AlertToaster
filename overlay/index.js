/*
    osc-bundle.js contains all the mechanisms needed to run an overlay.
    It connects to your Spooder and reconnects automatically.

    Global vars:
    oscIP
    oscPort
    pluginSettings
*/

//Plugin settings to add
//Box corner roundness

var app = new PIXI.Application({
  backgroundAlpha: 0,
  antialias: true,
  resolution: 1,
  resizeTo: window,
});

var originalWH = [1920, 1080];

function resize() {
  let newWH = [window.innerWidth, window.innerHeight];
  let newScale = 1;

  if (newWH[0] > newWH[1]) {
    newScale = newWH[0] / originalWH[0];
  } else {
    newScale = newWH[1] / originalWH[1];
  }

  app.stage.scale.x = newScale;
  app.stage.scale.y = newScale;
  app.renderer.resize(window.innerWidth, window.innerHeight);
}

window.onresize = (e) => {
  resize();
};
resize();

PIXI.Loader.registerPlugin(PIXI.gif.AnimatedGIFLoader);

var loadedGifs = {};
var loadedAssets = {
  gif: {},
  img: {},
};

function onOSCOpen() {
  let defaultImage = document.createElement('img');
  defaultImage.src = getAssetPath(pluginSettings.defaultAlertIcon);
  loadedAssets['img']['default'] = defaultImage;

  let alerts = pluginSettings.alerts;
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

document.body.appendChild(app.view);

var toastContainer = new PIXI.Container();
app.stage.addChild(toastContainer);

createjs.Ticker.setFPS(60);

const pixelRatio = window.devicePixelRatio || 1;

var alertInterval = null;
var alertQ = [];
var persistentQ = [];
var connectAlerts = {};

window.addEventListener('lost_connection', () => {
  if (pluginSettings.alerts['urgent'] != null) {
    let responseFunct = eval(
      '() => { let event = {}; ' +
        pluginSettings.alerts['urgent'].alerttext.replace(/\n/g, '') +
        '}',
    );
    let alertText = responseFunct();
    addToQueue('urgent', alertText);
  } else {
    addToQueue('default', ' Connection to Spooder lost!');
  }

  connectAlerts = {};
  app.loader.destroy();
});

function runQueue() {
  console.log('RUNNING Q', alertQ);

  if (alertInterval != null) {
    return;
  }
  alertInterval = setInterval(() => {
    if (alertQ.length > 0) {
      let newAlert = alertQ.shift();
      console.log('NEW ALERT', newAlert);
      try {
        createToast(newAlert);
      } catch (e) {
        console.log(e);
      }
      console.log('ALERT DELETED');
    } else {
      clearInterval(alertInterval);
      alertInterval = null;
    }
  }, 300);
}

async function addToQueue({ icon, text, sound, boxColor, borderColor, tts }) {
  //return;
  console.log('ADDING TO QUEUE', icon);
  if (app.loader.resources[icon] == null) {
    await getImg(icon);
  }
  if (tts != null) {
    if (tts.voice == null) {
      tts.voice = 'david';
    }
    let blob = await fetch(
      encodeURI(
        'https://talkify.net/api/speech/v2?texttype=text&text=' +
          text +
          '&fallbackLanguage=-1&voice=' +
          tts.voice +
          '&rate=0.5&key=' +
          pluginSettings.talkifykey +
          '&whisper=false&soft=false&wordbreakms=0&volume=0&pitch=0&format=mp3',
      ),
    )
      .then((response) => response.blob())
      .then((myBlob) => (ttsBlob = URL.createObjectURL(myBlob)))
      .catch((error) => {
        addToQueue({
          icon: 'urgent',
          text: 'Error generating TTS: ' + error.message,
          sound: 'PanicSound1',
        });
      });
    tts.blob = blob;
  }

  alertQ.push({ icon, text, sound, boxColor, borderColor, tts });

  runQueue();
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

async function createToast({ icon, text, sound, boxColor, borderColor, tts }) {
  let newAlertBox = new PIXI.Container();
  let alertBoxFill = new PIXI.Graphics();

  newAlertBox.closeBox = () => {
    createjs.Tween.get(newAlertBox, null)
      .to({ x: -505 }, 500, createjs.Ease.getPowOut(4))
      .call(() => {
        toastContainer.removeChild(newAlertBox);
      });
  };
  newAlertBox.timeout = () => {
    if (newAlertBox.scrollInterval != null) {
      clearInterval(newAlertBox.scrollInterval);
    }
    console.log('BOX TIMEOUT');
    newAlertBox.closeBox();
  };

  boxColor = boxColor
    ? boxColor.replace('#', '0x')
    : pluginSettings.defaultBoxColor.replace('#', '0x');
  borderColor = borderColor
    ? borderColor.replace('#', '0x')
    : pluginSettings.defaultBorderColor.replace('#', '0x');

  let boxOpacity = parseFloat(pluginSettings.boxOpacity) / 100;
  let borderOpacity = parseFloat(pluginSettings.borderOpacity) / 100;

  let settingskey = icon;

  if (pluginSettings.alerts[settingskey] != null) {
    boxColor = pluginSettings.alerts[settingskey].boxColor.replace('#', '0x');
    borderColor = pluginSettings.alerts[settingskey].borderColor.replace('#', '0x');
    if (
      pluginSettings.alerts[settingskey].sound != null &&
      pluginSettings.alerts[settingskey].sound != ''
    ) {
      if (tts != null) {
        console.log('PLAY SOUND', settingskey + '-sound', PIXI.sound);
        let ttsSound = PIXI.sound.play(settingskey + '-sound');

        ttsSound.on('end', () => {
          PIXI.sound.Sound.from({
            url: tts.blob,
            autoPlay: true,
            complete: function () {
              newAlertBox.timeout();
            },
          });
          persistentQ.pop();
        });
      } else {
        PIXI.sound.play(settingskey + '-sound');
      }
    }
  } else {
    if (sound != null && sound != '') {
      if (sound.startsWith('http')) {
        PIXI.sound.add(sound, sound);
      } else {
        PIXI.sound.add(sound, getAssetPath(sound));
      }
      PIXI.sound.play(sound);
    }
  }

  if (tts != null && tts.profilepic != null) {
    icon = tts.profilepic;
  } else {
    setTimeout(newAlertBox.timeout, 5000);
  }

  alertBoxFill.beginFill(boxColor, boxOpacity);
  alertBoxFill.drawRoundedRect(0, 0, 500, 120, 15);
  newAlertBox.addChild(alertBoxFill);

  let alertIcon = await getSprite(icon);
  console.log('ALERT ICON', alertIcon);
  let alertBoxMask = new PIXI.Graphics();
  alertBoxMask.beginFill(0x000000, 1.0);
  alertBoxMask.drawRoundedRect(0, 0, 500, 120, 15);
  newAlertBox.addChild(alertBoxMask);

  alertIcon.mask = alertBoxMask;
  newAlertBox.addChild(alertIcon);
  let alertBoxStroke = new PIXI.Graphics();

  alertBoxStroke.lineStyle(5.0, borderColor, borderOpacity, 0.5);
  alertBoxStroke.drawRoundedRect(2, 2, 500, 120, 15);

  let alertText = new PIXI.Text(text, {
    fontFamily: 'Helvetica',
    fontSize: 24,
    fill: pluginSettings.textColor,
    align: 'left',
    stroke: pluginSettings.textStrokeColor,
    strokeThickness: 4,
    lineJoin: 'round',
    fontWeight: 'bold',
    wordWrap: true,
    wordWrapWidth: 350,
  });
  alertText.x = 150;
  alertText.y = 60 - alertText.height / 2;
  alertText.mask = alertBoxMask;
  if (alertText.height > 120) {
    alertText.y = 0;
    setTimeout(() => {
      scrollAlertText(alertText);
    }, 2000);

    alertText.scrollInterval = setInterval(() => {
      scrollAlertText(alertText);
    }, 8000);
  }
  console.log('Alert text height', alertText.height);
  newAlertBox.addChild(alertText);

  newAlertBox.addChild(alertBoxStroke);

  let toastChildren = toastContainer.children;
  if (toastChildren.length > 0) {
    for (let c in toastContainer.children) {
      let thisAlert = toastContainer.children[c];
      let yIndex = toastContainer.children.length + persistentQ.length - c;
      createjs.Tween.get(thisAlert, null).to({ y: yIndex * 120 }, 500, createjs.Ease.getPowOut(4));
    }
  }
  if (toastChildren.length >= 6) {
    let outChild = toastChildren[toastChildren.length - 6];
    clearTimeout(outChild.timeout);
    outChild.closeBox();
  }

  toastContainer.addChild(newAlertBox);

  newAlertBox.x = -505;
  newAlertBox.y = 120 * persistentQ.length;
  createjs.Tween.get(newAlertBox, null).to({ x: 0 }, 500, createjs.Ease.getPowOut(4));

  if (tts != null) {
    persistentQ.push({ icon, text, sound, boxColor, borderColor, tts });
  }
}

function scrollAlertText(alertText) {
  createjs.Tween.get(alertText)
    .to({ y: -(alertText.height / 2) - 30 }, 2000, null)
    .wait(2000)
    .to({ y: 0 }, 2000, null)
    .wait(2000);
}

//The overlay can't run without this function as it's bridged with the OSC modules in the bundle.
function getOSCMessage(message) {
  //return;
  if (!message.address.startsWith('/obs')) {
    console.log('I HEARD SOMETHING', message);
  }

  var address = message.address.split('/');
  switch (address[1]) {
    case 'alerttoaster':
      switch (address[2]) {
        case 'plugins':
          let alertOBJ = JSON.parse(message.args[0]);
          console.log('PLUGINS GET', alertOBJ);
          for (let a in alertOBJ) {
            if (connectAlerts[a] == null) {
              connectAlerts[a] = JSON.parse(alertOBJ[a].data);

              addToQueue({ icon: connectAlerts[a].icon, text: connectAlerts[a].text });
            }
          }
          break;
        case 'alert':
          let toastObj = JSON.parse(message.args[0]);
          if (connectAlerts[toastObj.name] == null) {
            connectAlerts[toastObj.name] = { icon: toastObj.icon, text: toastObj.text };
          }
          addToQueue({
            icon: toastObj.icon,
            text: toastObj.text,
            boxColor: toastObj.boxColor,
            borderColor: toastObj.borderColor,
            sound: toastObj.sound,
            tts: toastObj.tts,
          });
          break;
        case 'tts':
          let ttsObj = JSON.parse(message.args[0]);
          if (ttsObj.profilepic != null) {
            getImg(ttsObj.profilepic);
          }

          let toastName = ttsObj.icon;

          if (ttsObj.voice != null) {
            toastName = 'tts-' + ttsObj.voice;
          }
          addToQueue({
            icon: toastName,
            text: ttsObj.text,
            tts: {
              voice: ttsObj.voice,
              profilepic: ttsObj.profilepic,
            },
          });
          break;
      }
      break;
    case 'spooder':
      switch (address[2]) {
        case 'alert':
          let toastObj = JSON.parse(message.args[0]);
          if (connectAlerts[toastObj.name] == null) {
            connectAlerts[toastObj.name] = { icon: toastObj.icon, text: toastObj.text };
          }
          addToQueue({
            icon: toastObj.icon,
            text: toastObj.text,
            sound: toastObj.icon == 'urgent' ? 'PanicSound1' : null,
          });
          break;
      }
      break;
  }
}
