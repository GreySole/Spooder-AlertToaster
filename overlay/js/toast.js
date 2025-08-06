async function playSound(sound, endFunct) {
  if (PIXI.sound.exists(sound, false) != null) {
    if (sound.startsWith('http')) {
      PIXI.sound.add(sound, sound);
    } else {
      PIXI.sound.add(sound, getAssetPath(sound));
    }
  }
  const soundInstance = await PIXI.sound.play(sound);
  if (endFunct) {
    soundInstance.on('end', endFunct);
  }
  return soundInstance;
}

async function createToast({ icon, text, sound, boxColor, borderColor, tts }) {
  let newAlertBox = new PIXI.Container();
  let alertBoxFill = new PIXI.Graphics();

  // Add persistent flag to identify this toast type
  newAlertBox.isPersistent = !!tts;

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

  let soundDuration = 0;

  console.log('TTS', tts);

  alertBoxFill.beginFill(boxColor, boxOpacity);
  alertBoxFill.drawRoundedRect(0, 0, 500, 120, 15);
  newAlertBox.addChild(alertBoxFill);

  const alertIcon = await getSprite(icon);
  alertIcon.width = 120;
  alertIcon.height = 120;
  const alertBoxMask = new PIXI.Graphics();
  alertBoxMask.beginFill(0x000000, 1.0);
  alertBoxMask.drawRoundedRect(0, 0, 500, 120, 15);
  newAlertBox.addChild(alertBoxMask);

  alertIcon.mask = alertBoxMask;
  newAlertBox.addChild(alertIcon);
  const alertBoxStroke = new PIXI.Graphics();

  alertBoxStroke.lineStyle(5.0, borderColor, borderOpacity, 0.5);
  alertBoxStroke.drawRoundedRect(2, 2, 500, 120, 15);

  const alertText = new PIXI.Text(text, {
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

  if (tts) {
    icon = tts.icon;
    await playSound(sound, async () => {
      const ttsSound = await PIXI.sound.Sound.from({
        url: tts.blob,
        autoPlay: true,
        loaded: (e) => {
          console.log('TTS Loaded', e);
          if (alertText.height > 120) {
            alertText.y = 0;
            setTimeout(() => {
              scrollAlertText(alertText, ttsSound.duration * 1000);
            }, 2000);
          }
        },
        complete: function () {
          newAlertBox.timeout();
        },
      });

      persistentQ.pop();
    });
  } else {
    if (sound) {
      playSound(sound);
    }
    if (alertText.height > 120) {
      alertText.y = 0;
      setTimeout(() => {
        scrollAlertText(alertText, soundDuration);
      }, 2000);
    }
    setTimeout(newAlertBox.timeout, 5000);
  }

  console.log('Alert text height', alertText.height);
  newAlertBox.addChild(alertText);

  newAlertBox.addChild(alertBoxStroke);

  let toastChildren = toastContainer.children;
  let numPersistent = 0;
  if (toastChildren.length > 0) {
    // Separate persistent and regular toasts using the isPersistent flag
    let persistentToasts = [];
    let regularToasts = [];

    for (let i = 0; i < toastChildren.length; i++) {
      let toast = toastChildren[i];
      if (toast.isPersistent) {
        persistentToasts.push(toast);
      } else {
        regularToasts.push(toast);
      }
    }

    // Position persistent toasts at the top
    for (let i = 0; i < persistentToasts.length; i++) {
      let persistentToast = persistentToasts[i];
      createjs.Tween.get(persistentToast, null).to({ y: i * 120 }, 500, createjs.Ease.getPowOut(4));
    }

    // Position regular toasts after persistent ones
    for (let i = 0; i < regularToasts.length; i++) {
      let regularToast = regularToasts[i];
      let yIndex = persistentToasts.length + i; // +1 because we're adding a new toast
      createjs.Tween.get(regularToast, null).to(
        { y: yIndex * 120 },
        500,
        createjs.Ease.getPowOut(4),
      );
    }
    numPersistent = persistentToasts.length;
    toastContainer.children = [...persistentToasts, ...regularToasts];
  }

  if (toastChildren.length >= 6) {
    let outChild = toastChildren[toastChildren.length - 6 + numPersistent];
    clearTimeout(outChild.timeout);
    outChild.closeBox();
  }

  toastContainer.addChild(newAlertBox);

  newAlertBox.x = -505;

  // Position new toast based on whether it's persistent or not
  if (newAlertBox.isPersistent) {
    // Persistent toasts go at the end of the persistent section
    newAlertBox.y = 120 * persistentQ.length;
  } else {
    // Regular toasts go after all persistent toasts
    let persistentCount = toastContainer.children.filter((child) => child.isPersistent).length;
    newAlertBox.y =
      120 * (persistentCount + (toastContainer.children.length - persistentCount) - 1);
  }

  createjs.Tween.get(newAlertBox, null).to({ x: 0 }, 500, createjs.Ease.getPowOut(4));

  if (tts) {
    persistentQ.push({ icon, text, sound, boxColor, borderColor, tts });
  }
}

function scrollAlertText(alertText, duration = 3000) {
  createjs.Tween.get(alertText).to({ y: -(alertText.height / 2) - 30 }, duration, null);
}
