import NativeEventEmitter from "events";
// Initialization
const eventEmitter = new NativeEventEmitter();
eventEmitter.setMaxListeners(50);
// Export the module
export default eventEmitter;
