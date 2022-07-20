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
    backgroundAlpha:0,
    antialias:true,
    resolution:1,
	resizeTo:window
});

var originalWH = [1920, 1080];

function resize(){
	let newWH = [window.innerWidth, window.innerHeight];
	let newScale = 1;

	if(newWH[0] > newWH[1]){
		newScale = newWH[0]/originalWH[0];
	}else{
		newScale = newWH[1]/originalWH[1];
	}

	app.stage.scale.x = newScale;
	app.stage.scale.y = newScale;
	app.renderer.resize(window.innerWidth, window.innerHeight);
}

window.onresize = (e) => {
	resize();
}
resize();

PIXI.Loader.registerPlugin(PIXI.gif.AnimatedGIFLoader);

var loadedGifs = {};
var loadedAssets = {
	"gif":{},
	"img":{}
};

function onOSCOpen(){

	let defaultImage = document.createElement("img");
    defaultImage.src = "./assets/"+pluginSettings.defaultAlertIcon;
	loadedAssets["img"]["default"] = defaultImage;
    
	let alerts = pluginSettings.alerts;
	for(let a in alerts){
		if(alerts[a].sound != null && alerts[a].sound != ""){
			PIXI.sound.add(a+"-sound", "./assets/"+alerts[a].sound);
			app.loader.add(a+"-sound", "./assets/"+alerts[a].sound);
		}
		if(alerts[a].icon.endsWith("gif")){
			app.loader.add(a, "./assets/"+alerts[a].icon);
		}else{
			let newImage = document.createElement("img");
            newImage.src = "./assets/"+alerts[a].icon;
            newImage.onerror = (e) => {
                newImage.src = "./assets/"+pluginSettings.defaultAlertIcon;
            }
            newImage.onload = () => {
                newImage.width = 120;
                newImage.height = 120;
				if(loadedAssets["img"] == null){
					loadedAssets["img"] = {};
				}
				loadedAssets["img"][a] = newImage;
            }
		}
		
	}
	app.loader.load((loader, resources)=>{
		if(loadedAssets["gif"] == null){
			loadedAssets["gif"] = {};
		}
		
		for(let r in resources){
			if(resources[r].extension == "gif"){
				loadedAssets["gif"][r] = PIXI.gif.AnimatedGIF.fromBuffer(resources[r].data);
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
var connectAlerts = {};

window.addEventListener("lost_connection", ()=>{
	if(pluginSettings.alerts["urgent"] != null){
		let responseFunct = eval("() => { let event = {}; "+pluginSettings.alerts["urgent"].alerttext.replace(/\n/g, "")+"}");
		let alertText = responseFunct();
		addToQueue("urgent", alertText);
	}else{
		addToQueue("default", " Connection to Spooder lost!");
	}
	
	connectAlerts = {};
	app.loader.destroy();
});

function runQueue(){
	console.log("RUNNING Q", alertQ);
    
	if(alertInterval != null){return;}
	alertInterval = setInterval(()=>{
		if(alertQ.length>0){
			let newAlert = alertQ.shift();
			console.log("NEW ALERT",newAlert);
			try{
				createToast(newAlert[0], newAlert[1]);
			}catch(e){
				console.log(e);
			}
            console.log("ALERT DELETED");
		}else{
			clearInterval(alertInterval);
			alertInterval = null;
		}
	}, 300);
}

async function addToQueue(icon, text){
	//return;
	console.log("ADDING TO QUEUE", icon);
	if(app.loader.resources[icon] == null){
		await getImg(icon);
	}
	alertQ.push([icon, text]);
	runQueue();
}

function getImg(url){
	if(!url.startsWith("http")){return;}
	return new Promise((res, rej) => {
        if(url.endsWith(".gif")){
            if(loadedGifs[url] == null){
				app.loader.add(url, url);
                
                app.loader.load((loader, resources) => {
					if(loadedAssets["gif"] == null){
						loadedAssets["gif"] = {};
					}

                    loadedAssets["gif"][url] = PIXI.gif.AnimatedGIF.fromBuffer(resources[url].data);
                    res();
                });
            }
            
        }else{
			let newImage = document.createElement("img");
            newImage.src = url;
            newImage.onerror = (e) => {
                newImage.src = "./assets/"+pluginSettings.defaultAlertIcon;
            }
            newImage.onload = () => {
                newImage.width = 120;
                newImage.height = 120;
				if(loadedAssets["img"] == null){
					loadedAssets["img"] = {};
				}
				loadedAssets["img"][url] = newImage;
                res();
                
            }
            
        }
    });
}

function getSprite(url){
	console.log("GETTING SPRITE", url)
	if(url==""){return;}
	if(loadedAssets["gif"][url] != null){
		return loadedAssets["gif"][url].clone();
	}else{
		
		return new PIXI.Sprite.from(loadedAssets["img"][url]);
	}
}

function createToast(icon,text){
	
	let newAlertBox = new PIXI.Container();
    let alertBoxFill = new PIXI.Graphics();

	let boxColor = pluginSettings.defaultBoxColor.replace("#","0x");
	let borderColor = pluginSettings.defaultBorderColor.replace("#","0x");
	let boxOpacity = parseFloat(pluginSettings.boxOpacity)/100;
	let borderOpacity = parseFloat(pluginSettings.borderOpacity)/100;

	if(pluginSettings.alerts[icon] != null){
		boxColor = pluginSettings.alerts[icon].boxColor.replace("#","0x");
		borderColor = pluginSettings.alerts[icon].borderColor.replace("#","0x");
		if(pluginSettings.alerts[icon].sound != null && pluginSettings.alerts[icon].sound != ''){
			PIXI.sound.play(icon+"-sound");
		}
	}

    alertBoxFill.beginFill(boxColor, boxOpacity);
    alertBoxFill.drawRoundedRect(0,0, 500, 120, 15);
    newAlertBox.addChild(alertBoxFill);
    
    let alertIcon = getSprite(icon);
    let alertBoxMask = new PIXI.Graphics();
    alertBoxMask.beginFill(0x000000, 1.0);
    alertBoxMask.drawRoundedRect(0,0, 500, 120, 15);
    newAlertBox.addChild(alertBoxMask);
    
    alertIcon.mask = alertBoxMask;
    newAlertBox.addChild(alertIcon);
    let alertBoxStroke = new PIXI.Graphics();

    alertBoxStroke.lineStyle(5.0, borderColor, borderOpacity, 0.5);
    alertBoxStroke.drawRoundedRect(2,2, 500, 120, 15);
    newAlertBox.addChild(alertBoxStroke);

    let alertText = new PIXI.Text(text, {
        fontFamily:"Helvetica",
        fontSize:24,
        fill:pluginSettings.textColor,
        align:'left',
        stroke:pluginSettings.textStrokeColor,
        strokeThickness:4,
        lineJoin: "round",
        fontWeight:'bold',
        wordWrap:true,
        wordWrapWidth: 350
    });
    alertText.x = 150;
    alertText.y = 60-alertText.height/2;
    newAlertBox.addChild(alertText);


	let toastChildren = toastContainer.children;
	if(toastChildren.length>0){
        
		for(let c in toastContainer.children){
			let thisAlert = toastContainer.children[c];
            let yIndex = toastContainer.children.length-c;
			createjs.Tween.get(thisAlert, null)
		.to({y:(yIndex*120)},500,createjs.Ease.getPowOut(4));
		}
	}
	if(toastChildren.length>=5){
        let outChild = toastChildren[toastChildren.length-5];
        clearTimeout(outChild.timeout);
        outChild.closeBox();
	}
    newAlertBox.closeBox = () => {
        
        createjs.Tween.get(newAlertBox, null)
        .to({x:-505},500,createjs.Ease.getPowOut(4))
        .call(() => {
            toastContainer.removeChild(newAlertBox);
        })
    }
    newAlertBox.timeout = ()=>{newAlertBox.closeBox()}
    setTimeout(newAlertBox.timeout, 5000);
	toastContainer.addChild(newAlertBox);

    newAlertBox.x = -505;
    createjs.Tween.get(newAlertBox, null)
    .to({x:0},500,createjs.Ease.getPowOut(4));
	
}

//The overlay can't run without this function as it's bridged with the OSC modules in the bundle.
function getOSCMessage(message){
    //return;
    console.log("I HEARD SOMETHING",message);
	
	var address = message.address.split("/");
	console.log(address);
	switch(address[1]){
		case 'events':
			switch(address[2]){
				case 'start':
					addToQueue("command", message.args[0]);
				break;
				case 'time':
				break;
			}
		break;
		case 'eventsub':
			if(pluginSettings.alerts[address[2]] != null){
				let responseFunct = eval("() => { let event = "+message.args[0]+"; "+pluginSettings.alerts[address[2]].alerttext.replace(/\n/g, "")+"}");
				let alertText = responseFunct();
				addToQueue(address[2], alertText);
			}
		break;
		case 'alerttoaster':
			switch(address[2]){
				
				case 'plugins':
					
					let alertOBJ = JSON.parse(message.args[0]);
					console.log("PLUGINS GET", alertOBJ);
					for(let a in alertOBJ){
						if(connectAlerts[a] == null){
							connectAlerts[a] = JSON.parse(alertOBJ[a].data);
							
							addToQueue(connectAlerts[a].icon, connectAlerts[a].text);
						}
					}
				break;
				case 'alert':
					let toastObj = JSON.parse(message.args[0]);
					if(connectAlerts[toastObj.name] == null){
						connectAlerts[toastObj.name] = {icon:toastObj.icon, text:toastObj.text};
					}
					addToQueue(toastObj.icon, toastObj.text, 
					toastObj.icon=="urgent"?"PanicSound1":null);
				break;
			}
		break;
	}
}