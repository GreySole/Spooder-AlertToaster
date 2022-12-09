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
				let pluginName = activePlugins[pluginInfo.name]?._name!=null?activePlugins[pluginInfo.name]._name:pluginInfo.name;
				let externalTxt = pluginInfo.external == true?" externally":"";
				sendToTCP("/alerttoaster/alert", JSON.stringify({"icon":"http://"+sconfig.network.host+":"+sconfig.network.host_port+"/overlay/"+pluginInfo.name+"/icon.png", "text":pluginName+": OSC Connected"+externalTxt}));
			}
		}
		
		if(message.address != "/alerttoaster/connect" && message.address.endsWith("/connect")){
			let pluginInfo = JSON.parse(message.args[0]);
			if(pluginInfo == 1){
				pluginInfo = {
					name:message.address.split("/")[1]
				}
			}
			console.log(pluginInfo);
			let pluginName = activePlugins[pluginInfo.name]?._name!=null?activePlugins[pluginInfo.name]._name:pluginInfo.name;
			if((pluginInfo.external == true && this.settings.displayexternalconnects == true) || pluginInfo.external == false){
				let externalTxt = pluginInfo.external == true?" externally":"";
				this.connectAlerts[pluginInfo.name] = {address:"/spooder/alert",data:JSON.stringify({"icon":"http://"+sconfig.network.host+":"+sconfig.network.host_port+"/overlay/"+pluginInfo.name+"/icon.png", "text":pluginName+": OSC Connected"+externalTxt})};
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

	onEvent(eventName, eventData){
		
		if(eventName=="eventstart"){
			sendToTCP("/events/start/"+eventName, eventData.username+" has activated "+eventData.eventInfo.name+"!");
		}
	}
}

module.exports = AlertToaster;