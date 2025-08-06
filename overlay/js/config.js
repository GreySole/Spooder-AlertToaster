/*
    Configuration and initialization for the alert toaster overlay
    Contains PIXI app setup and global variables
*/

// PIXI Application setup
var app = new PIXI.Application({
  backgroundAlpha: 0,
  antialias: true,
  resolution: 1,
  resizeTo: window,
});

var originalWH = [1920, 1080];

// Global variables
var loadedGifs = {};
var loadedAssets = {
  gif: {},
  img: {},
};

var toastContainer = new PIXI.Container();
var alertInterval = null;
var alertQ = [];
var persistentQ = [];
var connectAlerts = {};

// Resize functionality
function resize() {
  let newWH = [window.innerWidth, window.innerHeight];
  let newScale = 1;

  if (newWH[0] > newWH[1]) {
    newScale = newWH[0] / originalWH[0];
  } else {
    newScale = newWH[1] / originalWH[1];
  }

  app.stage.scale.x = newScale;
  app.stage.scale.y = newScale;
  app.renderer.resize(window.innerWidth, window.innerHeight);
}

// Initialize PIXI
PIXI.Loader.registerPlugin(PIXI.gif.AnimatedGIFLoader);
app.stage.addChild(toastContainer);
createjs.Ticker.setFPS(60);

const pixelRatio = window.devicePixelRatio || 1;
