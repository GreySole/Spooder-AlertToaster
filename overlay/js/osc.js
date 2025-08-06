/*
    OSC message handling and communication functions
*/

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
          if (ttsObj.ttsIcon != null) {
            getImg(ttsObj.ttsIcon);
          }

          addToQueue({
            icon: ttsObj.ttsIcon,
            text: ttsObj.text,
            sound: ttsObj.sound,
            tts: {
              voice: ttsObj.voice,
              icon: ttsObj.ttsIcon,
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
