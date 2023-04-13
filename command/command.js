const path = require("path");
class AlertToaster {
	
	constructor() {
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
			let firstWord = fullMessage.substring(0, fullMessage.indexOf(" ")).toLowerCase();
			if(this.ttsVoices.includes(firstWord)){
				voice = firstWord;
				fullMessage = fullMessage.substring(firstWord.length+1);
			}
			let profilePicture = await this.getProfilePicture(eventData.username);
			sendToTCP("/alerttoaster/tts", JSON.stringify({icon:"tts", text:fullMessage, voice:voice, profilepic:profilePicture}));
		}else if(eventName == "alert"){
			sendToTCP("/alerttoaster/alert", eventData);
		}
	}

	getProfilePicture(user){

		return new Promise(async (res, rej)=>{
			fetch("https://api.twitch.tv/helix/users?login="+user, {
				method: 'GET',
				headers:{
					"Client-Id": oauth["client-id"],
					"Authorization": " Bearer "+appToken,
					"Content-Type": "application/json"
				}
			})
			.then(response => response.json())
			.then(data => {
				
				if(data.data[0] != null){
					res(data.data[0]["profile_image_url"]);
				}
			});
			
		})
	}
}

module.exports = AlertToaster;