const path = require("path");
const fs = require("fs");
class AlertToaster {
	
	constructor() {
		if(twitch.eventsubs != null){
			let settingsFormFile = fs.existsSync(__dirname+"/settings-form.json") ? fs.readFileSync(__dirname+"/settings-form.json") : null;
			if(settingsFormFile != null){
				try{
					let settingsForm = JSON.parse(settingsFormFile);
					let newSelections = {
						"command": "Command",
						"warning":"Warning",
						"urgent": "Connection Lost",
						"tts": "TTS",
						"tts-david": "TTS - David(EN Male)",
						"tts-hedda": "TTS - Hedda(DE)",
						"tts-hazel": "TTS - Hazel(GB)",
						"tts-zira": "TTS - Zira(EN Female)",
						"tts-helena": "TTS - Helena(ES)",
						"tts-hortense": "TTS - Hortense(FR)",
						"tts-lucia": "TTS - Lucia(IT)",
						"tts-haruka": "TTS - Haruka(JP)",
					};
					Object.assign(newSelections, twitch.eventsubs);
					settingsForm.form.alerts.form.keyname.options.selections = newSelections;
					fs.writeFileSync(__dirname+"/settings-form.json", JSON.stringify(settingsForm));
				}catch(e){
					console.log("AlertToaster:", "Unable to apply server Eventsubs to SettingsForm");
				}
				
			}
		}
		this.onChat = this.onChat.bind(this);
		this.onOSC = this.onOSC.bind(this);
	}

	//This flag will call onOSC for any receiving message
	//instead of only addresses with the plugin name at the beginning
	//For an alert box, it's needed to hear the connect messages from other plugins
	isAlertBox = true;

	isConnected = false;

	connectAlerts = {};

	ttsVoices = ["david", "helena", "hedda", "zira", "hazel", "haruka", "hortense", "lucia"];
	
	/*List all your commands here to be accessible through the help command*/
	commandList = {
		
	};
	
	/*
		Put your command code here. Here's a quick reference:
		Chat text: message.message
		Sender's name: message.username
		Sender's emotes: message.tags.emotes
		
		There are a couple global functions to send OSC with:
		sendToTCP(address, content)
		sendToUDP(destination, address, content)
	*/
	onChat(message){
		
	}

	onOSC(message){

		if(!this.isConnected && message.address.endsWith("/connect")){
			let pluginInfo = JSON.parse(message.args[0]);
			if(pluginInfo == 1){
				pluginInfo = {
					name:message.address.split("/")[1]
				}
			}
			if((pluginInfo.external == true && this.settings.displayexternalconnects == true) || pluginInfo.external == false){
				let pluginName = activePlugins[pluginInfo.name]?.name!=null?activePlugins[pluginInfo.name].name:pluginInfo.name;
				let externalTxt = pluginInfo.external == true?" externally":"";
				sendToTCP("/alerttoaster/alert", JSON.stringify({"icon":"http://"+sconfig.network.host+":"+sconfig.network.host_port+"/icons/"+pluginInfo.name+".png", "text":pluginName+": OSC Connected"+externalTxt}));
			}
		}
		
		if(message.address != "/alerttoaster/connect" && message.address.endsWith("/connect")){
			let pluginInfo = JSON.parse(message.args[0]);
			if(pluginInfo == 1){
				pluginInfo = {
					name:message.address.split("/")[1]
				}
			}
			let pluginName = activePlugins[pluginInfo.name]?.name!=null?activePlugins[pluginInfo.name].name:pluginInfo.name;
			if((pluginInfo.external == true && this.settings.displayexternalconnects == true) || pluginInfo.external == false){
				let externalTxt = pluginInfo.external == true?" externally":"";
				this.connectAlerts[pluginInfo.name] = {address:"/spooder/alert",data:JSON.stringify({"icon":"http://"+sconfig.network.host+":"+sconfig.network.host_port+"/icons/"+pluginInfo.name+".png", "text":pluginName+": OSC Connected"+externalTxt})};
			}
			return;
		}

		if(message.address == "/alerttoaster/connect"){
			this.isConnected = true;
			sendToTCP("/alerttoaster/plugins", JSON.stringify(this.connectAlerts));
		}

		if(message.address.startsWith("/spooder/alert")){
			sendToTCP("/alerttoaster/alert", message.args[0]);
		}
	}

	async onEvent(eventName, eventData){
		
		if(eventName=="eventstart"){
			sendToTCP("/events/start/"+eventName, eventData.displayName+" has activated "+eventData.eventInfo.name+"!");
		}else if(eventName.startsWith("tts")){
			
			let voice = "david";
			let fullMessage = eventData.user_input;
			if(eventName.includes("-")){
				voice = eventName.split("-")[1];
			}else{
				let firstWord = fullMessage.substring(0, fullMessage.indexOf(" ")).toLowerCase();
				if(this.ttsVoices.includes(firstWord)){
					voice = firstWord;
					fullMessage = fullMessage.substring(firstWord.length+1);
				}
			}
			
			if(this.settings.alerts[eventName]?.icon == null || this.settings.alerts[eventName]?.icon == ""){
				let profilePicture = await this.getProfilePicture(eventData.username);
				console.log("GOT PFP", profilePicture);
				sendToTCP("/alerttoaster/tts", JSON.stringify({icon:"tts", text:fullMessage, voice:voice, profilepic:profilePicture}));
			}else{
				console.log(this.settings.alerts[eventName].icon);
				sendToTCP("/alerttoaster/tts", JSON.stringify({icon:this.settings.alerts[eventName].icon, text:fullMessage, voice:voice}));
			}
			
		}else if(eventName == "alert"){
			sendToTCP("/alerttoaster/alert", eventData);
		}else if(eventName == "eventsub"){
			sendToTCP("/eventsub/"+eventData.eventsubType, eventData);
		}
	}

	getProfilePicture(user){
		return twitch.callAppAPI("https://api.twitch.tv/helix/users?login="+user).then(data=>data.data[0].profile_image_url);
	}
}

module.exports = AlertToaster;