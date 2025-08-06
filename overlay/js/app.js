/*
    Main application file - handles initialization and event listeners
    This file should be loaded after all other modules
*/

// Initialize the application
document.body.appendChild(app.view);

// Set up window resize handler
window.onresize = (e) => {
  resize();
};
resize();

// Handle lost connection event
window.addEventListener('lost_connection', () => {
  addStatusAlert('urgent');
  connectAlerts = {};
});

// Initialize when ready
// Note: onOSCOpen should be called when the OSC connection is established
// This is typically handled by the osc-bundle.js file
setTimeout(() => {
  addToQueue({ icon: 'default', text: 'Overlay is ready!' });
}, 1000);

function testToast() {
  addToQueue({ icon: 'default', text: 'Test toast!' });
}
