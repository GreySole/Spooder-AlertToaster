class AlertToaster {
	
	constructor() {
		this.onChat = this.onChat.bind(this);
		this.onOSC = this.onOSC.bind(this);
	}

	//This flag will call onOSC for any receiving message
	//instead of only addresses with the plugin name at the beginning
	//For an alert box, it's needed to hear the connect messages from other plugins
	isAlertBox = true;

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
		
		if(message.address != "/alerttoaster/connect" && message.address.endsWith("/connect")){
			let pluginName = message.address.split("/")[1];
            this.connectAlerts[pluginName] = {address:"/spooder/alert",data:JSON.stringify({"icon":"http://"+sconfig.network.host+":"+sconfig.network.host_port+"/overlay/"+pluginName+"/icon.png", "text":pluginName+": OSC Connected"})};
			return;
		}

		if(message.address == "/alerttoaster/connect"){
			sendToTCP("/alerttoaster/plugins", JSON.stringify(this.connectAlerts));
		}

		if(message.address.startsWith("/spooder/alert")){
			sendToTCP("/alerttoaster/alert", message.args[0]);
		}
	}
}

module.exports = AlertToaster;