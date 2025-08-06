/*
    Alert queue management
*/

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

function addStatusAlert(alertName, text) {
  const alerts = window.statusAlerts || {};
  if (alertName === 'command') {
    addToQueue({
      icon: alerts.command.icon,
      text: text,
      sound: alerts.command.sound,
      boxColor: alerts.command.boxColor,
      borderColor: alerts.command.borderColor,
    });
  } else if (alertName === 'warning') {
    addToQueue({
      icon: alerts.warning.icon,
      text: text,
      sound: alerts.warning.sound,
      boxColor: alerts.warning.boxColor,
      borderColor: alerts.warning.borderColor,
    });
  } else if (alertName === 'urgent') {
    addToQueue({
      icon: alerts.urgent.icon,
      text: alerts.urgent.text,
      sound: alerts.urgent.sound,
      boxColor: alerts.urgent.boxColor,
      borderColor: alerts.urgent.borderColor,
    });
  }
}

async function addToQueue({ icon, text, sound, boxColor, borderColor, tts }) {
  //return;
  console.log('ADDING TO QUEUE', icon);
  if (app.loader.resources[icon] == null) {
    await getImg(icon);
  }
  if (tts) {
    if (!tts.voice) {
      tts.voice = 'david';
    }
    const blob = await fetch(
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
      .then((myBlob) => (ttsBlob = URL.createObjectURL(myBlob)));
    tts.blob = blob;
  }

  alertQ.push({ icon, text, sound, boxColor, borderColor, tts });

  runQueue();
}
