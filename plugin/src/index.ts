import { StreamMessage, OSCMessage, KeyedObject } from './Types';
import PluginBase from './PluginBase';

/*
Typescript Sample Plugin
Use onLoad as your starting point. 
*/

export default class AlertToaster extends PluginBase {
  isAlertBox = true;

  isConnected = false;

  connectAlerts = {} as KeyedObject;

  ttsVoices = ['david', 'helena', 'hedda', 'zira', 'hazel', 'haruka', 'hortense', 'lucia'];

  onLoad() {}
  onChat(message: StreamMessage) {}
  onCommunityChat(type: string, message: any) {}
  onOSC(message: OSCMessage) {
    const activePlugins = this.activePlugins;

    if (!this.isConnected && message.address.endsWith('/connect')) {
      let pluginInfo = typeof message.args[0] === 'string' ? JSON.parse(message.args[0]) : {};
      if (pluginInfo == 1) {
        pluginInfo = {
          name: message.address.split('/')[1],
        };
      }
      if (
        (pluginInfo.external == true && this.settings?.displayexternalconnects == true) ||
        pluginInfo.external == false
      ) {
        let pluginName =
          activePlugins[pluginInfo.name]?.name != null
            ? activePlugins[pluginInfo.name].name
            : pluginInfo.name;
        let externalTxt = pluginInfo.external == true ? ' externally' : '';
        this.osc.sendToTCP(
          '/alerttoaster/alert',
          JSON.stringify({
            icon:
              'http://' +
              this.spooderConfig.host +
              ':' +
              this.spooderConfig.hostPort +
              '/icons/' +
              pluginInfo.name +
              '.png',
            text: pluginName + ': OSC Connected' + externalTxt,
          }),
        );
      }
    }

    if (message.address != '/alerttoaster/connect' && message.address.endsWith('/connect')) {
      let pluginInfo = typeof message.args[0] === 'string' ? JSON.parse(message.args[0]) : {};
      if (pluginInfo == 1) {
        pluginInfo = {
          name: message.address.split('/')[1],
        };
      }
      let pluginName =
        activePlugins[pluginInfo.name]?.name != null
          ? activePlugins[pluginInfo.name].name
          : pluginInfo.name;
      if (
        (pluginInfo.external == true && this.settings?.displayexternalconnects == true) ||
        pluginInfo.external == false
      ) {
        let externalTxt = pluginInfo.external == true ? ' externally' : '';
        this.connectAlerts[pluginInfo.name] = {
          address: '/spooder/alert',
          data: JSON.stringify({
            icon:
              'http://' +
              this.spooderConfig.host +
              ':' +
              this.spooderConfig.hostPort +
              '/icons/' +
              pluginInfo.name +
              '.png',
            text: pluginName + ': OSC Connected' + externalTxt,
          }),
        };
      }
      return;
    }

    if (message.address == '/alerttoaster/connect') {
      this.isConnected = true;
      this.osc.sendToTCP('/alerttoaster/plugins', JSON.stringify(this.connectAlerts));
    }

    if (message.address.startsWith('/spooder/alert')) {
      this.osc.sendToTCP('/alerttoaster/alert', message.args[0]);
    }
  }

  async onEvent(eventName: string, eventData: StreamMessage) {
    if (eventName == 'eventstart') {
      this.osc.sendToTCP(
        '/events/start/' + eventName,
        eventData.username + ' has activated ' + eventName + '!',
      );
    } else if (eventName == 'play_tts') {
      const ttsData = eventData.pluginEventData;
      if (!ttsData) {
        console.error('No TTS data provided');
        return;
      }
      console.log('AlertToaster TTS Data', ttsData);
      let fullMessage = eventData.message;
      let firstWord = fullMessage.substring(0, fullMessage.indexOf(' ')).toLowerCase();
      let voice = 'david';
      let sound = '';

      if (ttsData.voice === 'tts') {
        if (this.ttsVoices.includes(firstWord)) {
          voice = firstWord.trim();
          fullMessage = fullMessage.substring(firstWord.length + 1);
        }
      } else {
        voice = ttsData.voice || 'david';
      }

      if (ttsData.sound_type === 'single') {
        sound = ttsData.sound || '';
      } else {
        const soundKey = Object.keys(ttsData).find((key) => key.includes(voice));
        if (soundKey) {
          sound = ttsData[soundKey] || '';
        }
      }

      let profilePicture = '';
      if (ttsData.icon_type === 'profile_pic') {
        profilePicture = await this.getProfilePicture(eventData.username);
      } else {
        profilePicture = ttsData.icon || '';
      }
      this.osc.sendToTCP(
        '/alerttoaster/tts',
        JSON.stringify({
          icon: 'tts',
          text: fullMessage,
          voice: voice,
          sound: sound,
          ttsIcon: profilePicture,
        }),
      );
    } else if (eventName == 'show_alert') {
      let alertText = eventData.pluginEventData?.alerttext ?? '';

      this.osc.sendToTCP('/alerttoaster/alert', {
        icon: eventData.pluginEventData?.icon,
        text: alertText,
        sound: eventData.pluginEventData?.sound,
        boxColor: eventData.pluginEventData?.boxColor,
        borderColor: eventData.pluginEventData?.borderColor,
      });
    }
  }

  getProfilePicture(user: string) {
    if (!this.modules.stream.twitch) {
      return;
    }
    return this.modules.stream.twitch.getUserInfo(user).then((data: KeyedObject) => {
      return data['profile_image_url'];
    });
  }
}
