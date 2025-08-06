require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 352:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class PluginBase {
}
exports["default"] = PluginBase;


/***/ }),

/***/ 588:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const PluginBase_1 = __importDefault(__nccwpck_require__(352));
/*
Typescript Sample Plugin
Use onLoad as your starting point.
*/
class AlertToaster extends PluginBase_1.default {
    constructor() {
        super(...arguments);
        this.isAlertBox = true;
        this.isConnected = false;
        this.connectAlerts = {};
        this.ttsVoices = ['david', 'helena', 'hedda', 'zira', 'hazel', 'haruka', 'hortense', 'lucia'];
    }
    onLoad() {
        console.log('I FARTED AND IT SMELLED GOOD', this.spooderConfig);
    }
    onChat(message) { }
    onCommunityChat(type, message) { }
    onOSC(message) {
        const activePlugins = this.activePlugins;
        const sendToTCP = this.osc.sendToTCP;
        if (!this.isConnected && message.address.endsWith('/connect')) {
            let pluginInfo = typeof message.args[0] === 'string' ? JSON.parse(message.args[0]) : {};
            if (pluginInfo == 1) {
                pluginInfo = {
                    name: message.address.split('/')[1],
                };
            }
            if ((pluginInfo.external == true && this.settings?.displayexternalconnects == true) ||
                pluginInfo.external == false) {
                let pluginName = activePlugins[pluginInfo.name]?.name != null
                    ? activePlugins[pluginInfo.name].name
                    : pluginInfo.name;
                let externalTxt = pluginInfo.external == true ? ' externally' : '';
                this.osc.sendToTCP('/alerttoaster/alert', JSON.stringify({
                    icon: 'http://' +
                        this.spooderConfig.host +
                        ':' +
                        this.spooderConfig.hostPort +
                        '/icons/' +
                        pluginInfo.name +
                        '.png',
                    text: pluginName + ': OSC Connected' + externalTxt,
                }));
            }
        }
        if (message.address != '/alerttoaster/connect' && message.address.endsWith('/connect')) {
            let pluginInfo = typeof message.args[0] === 'string' ? JSON.parse(message.args[0]) : {};
            if (pluginInfo == 1) {
                pluginInfo = {
                    name: message.address.split('/')[1],
                };
            }
            let pluginName = activePlugins[pluginInfo.name]?.name != null
                ? activePlugins[pluginInfo.name].name
                : pluginInfo.name;
            if ((pluginInfo.external == true && this.settings?.displayexternalconnects == true) ||
                pluginInfo.external == false) {
                let externalTxt = pluginInfo.external == true ? ' externally' : '';
                this.connectAlerts[pluginInfo.name] = {
                    address: '/spooder/alert',
                    data: JSON.stringify({
                        icon: 'http://' +
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
    async onEvent(eventName, eventData) {
        const sendToTCP = this.osc.sendToTCP;
        if (eventName == 'eventstart') {
            this.osc.sendToTCP('/events/start/' + eventName, eventData.username + ' has activated ' + eventData.eventInfo.name + '!');
        }
        else if (eventName.startsWith('tts')) {
            let voice = 'david';
            let fullMessage = eventData.user_input;
            let firstWord = fullMessage.substring(0, fullMessage.indexOf(' ')).toLowerCase();
            if (this.ttsVoices.includes(firstWord)) {
                voice = firstWord;
                fullMessage = fullMessage.substring(firstWord.length + 1);
            }
            let profilePicture = await this.getProfilePicture(eventData.username);
            this.osc.sendToTCP('/alerttoaster/tts', JSON.stringify({
                icon: 'tts',
                text: fullMessage,
                voice: voice,
                profilepic: profilePicture,
            }));
        }
        else if (eventName == 'alert') {
            this.osc.sendToTCP('/alerttoaster/alert', eventData);
        }
    }
    getProfilePicture(user) {
        if (!this.modules.stream.twitch) {
            return;
        }
        return this.modules.stream.twitch.getUserInfo(user).then((data) => {
            return data['profile_image_url'];
        });
    }
}
exports["default"] = AlertToaster;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(588);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map