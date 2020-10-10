import { SERVICE_UUID, CHARACTERISTICS, COMMANDS } from './config'
import sanitize from 'sanitize-filename'
import EventEmitter from 'events'

//const COMMAND_TIMEOUT = 5000
const noop = () => {}

function toBtValue(val) {
  if (typeof val === 'number') {
    let buf = new ArrayBuffer(4)
    let view = new DataView(buf)
    view.setUint32(0, val, true)
    return new Uint8Array(buf)
  }

  if (typeof val === 'string') {
    return Uint8Array.of(val.charCodeAt(0))
  }

  throw new Error('Cannot encode value for bluetooth write')
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function view2string(view) {
  let length = view.byteLength;
  const chars = new Uint8Array(length);
  for (var i = 0; i < length; i++) {
    chars[i] = view.getUint8(i);
  }
  return String.fromCharCode.apply(null, chars);
}

export class OutOfOrderException extends Error {
  constructor() {
    super('Received block out of order')
  }
}

export class InterruptException extends Error {
  constructor() {
    super('Interrupted')
  }
}

// can register to listen for 'status', 'connect', 'disconnect' events,
export function Controller() {
  var bluetooth = undefined;
  var connection = undefined;
  const pubsub = new EventEmitter();

  if (!/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    bluetooth = navigator.bluetooth;
  }

  function assertConnection() {
    if (!connection) {
      throw new Error('No connection established')
    }
  }

  async function connect() {
    if (bluetooth == undefined) {
      return Promise.reject(new Error('bluetooth not available'));
    }

    // disconnect first (if necessary)
    await disconnect();

    pubsub.emit('status', 'Requesting any Bluetooth Device...');
    let options = {
      "filters": [{
        "namePrefix": "NIST",
        "services": [SERVICE_UUID]
      },
      {
        "services": [0xfd6f]
      }]
    };

    connection = await bluetooth.requestDevice(options);
    connection.addEventListener('gattserverdisconnected', () => {
      pubsub.emit('disconnected');
    });
    await connection.gatt.connect();
    pubsub.emit('connected', connection)
  }

  async function disconnect() {
    if (!connection) { return; }
    try {
      await connection.gatt.disconnect();
    } finally {
      connection = undefined;
    }
  }

  function getCountStatus() {
    assertConnection();
    return connection.gatt.getPrimaryService(SERVICE_UUID)
      .then(service => service.getCharacteristic(CHARACTERISTICS.count))
      .then(characteristic => characteristic.readValue())
      .then(value => {
        return { blocks: value.getUint16(0, true), status: value.getUint8(3)}
      });
  }

  function getBatteryLevel() {
    assertConnection();
    return connection.gatt.getPrimaryService(SERVICE_UUID)
      .then(service => service.getCharacteristic("battery_level"))
      .then(characteristic => characteristic.readValue())
      .then(value => value.getUint8(0));
  }

  async function getLastAddress() {
    assertConnection();
    return await readData(COMMANDS.getLastAddress, (value, resolve) => {
      resolve(value.getUint32(0, true));
    });
  }

  async function getVersion() {
    assertConnection();
    return await readData(COMMANDS.getVersion, (value, resolve) => {
      resolve(view2string(value));
    });
  }

  function writeData(data) {
    return connection.gatt.getPrimaryService(SERVICE_UUID)
      .then(service => service.getCharacteristic(CHARACTERISTICS.data))
      .then(characteristic => characteristic.writeValue(data));
  }
/*
  function readData() {
    return connection.gatt.getPrimaryService(SERVICE_UUID)
      .then(service => service.getCharacteristic(CHARACTERISTICS.data))
      .then(characteristic => characteristic.readValue());
  }
*/
  function startDataNotifications(listener) {
    return connection.gatt.getPrimaryService(SERVICE_UUID)
      .then(service => service.getCharacteristic(CHARACTERISTICS.data))
      .then(characteristic => characteristic.startNotifications())
      .then(characteristic => characteristic.addEventListener('characteristicvaluechanged', listener));
  }

  function stopDataNotifications(listener) {
    return connection.gatt.getPrimaryService(SERVICE_UUID)
      .then(service => service.getCharacteristic(CHARACTERISTICS.data))
      .then(characteristic => characteristic.stopNotifications())
      .then(characteristic => characteristic.removeEventListener('characteristicvaluechanged', listener));
  }

  async function readData(command, onData) {
    assertConnection();

    let notifyCallback;
    function notify(res) {
      notifyCallback(res);
    }

    let promise = new Promise((resolve, reject) => {
      notifyCallback = handle;
      function handle(event) {
        onData(event.target.value, resolve, reject);
      }
    });

    // wait for everything to happen
    await startDataNotifications(notify);
    try {
      await writeCommand(command.value);
      let result = await promise;
      // return the result
      return result;
    } finally {
      await stopDataNotifications(notify);
    }
  }

	function writeCommand(command) {
		return connection.gatt.getPrimaryService(SERVICE_UUID)
			.then(service => service.getCharacteristic(CHARACTERISTICS.rw))
			.then(characteristic => characteristic.writeValue(toBtValue(command)));
	}

  async function setName(name) {
    if (name.length > 8){
      throw new Error('Name must be less than 8 characters');
    }
    assertConnection();
    await writeData(str2ab(name))
      .then(() => writeCommand(COMMANDS.setName.value));
  }

  function setScanParameters(interval, window) {
		let buffer = new ArrayBuffer(4);
		let view = new DataView(buffer);
		view.setUint16(0, interval, true);
		view.setUint16(2, window, true);
		return writeData(buffer)
			.then(() => writeCommand(COMMANDS.setScanParameters.value));
  }

   async function synchClock() {
    let epoch_time = (new Date()).getTime();
    let uptime = await getUptime();
    let buffer = new ArrayBuffer(12);
		let view = new DataView(buffer);
    view.setUint32(0, parseInt(epoch_time / 1000), true);
    view.setUint32(4, uptime[0], true);
    view.setUint32(8, uptime[1], true);
    await writeData(buffer);
    return await writeCommand(COMMANDS.setSynchTime.value);
  }

  async function getUptime() {
    return await readData(COMMANDS.getUptime, (value, resolve) => {
        // value is time since reboot - in ms
        var little = value.getUint32(0, true);
        var big = value.getUint32(4, true);
        resolve(little + (big << 17));
    });
  }

  async function getSynchTime() {
    return await readData(COMMANDS.getSynchTime, (value, resolve) => {
      var epochTime = value.getUint32(0, true);
      var refl = value.getUint32(4, true);
      var refb = value.getUint32(8, true);
      resolve(epochTime * 1000 - refl - (refb << 17));
  });
  }

  async function fetchData(all = true, opts = { interrupt: false, onProgress: undefined}) {
    const blocksTotal = (await getCountStatus()).blocks;
    const blockSize = 32;
    const expectedLength = blocksTotal * blockSize;

    let buffer = new ArrayBuffer(expectedLength);
    let result = new Uint8Array(buffer);
  
    let notifyCallback = noop;
    function notify(res) {
      notifyCallback(res);
      notifyCallback = noop;
    }

    assertConnection();

    let index_buffer = new ArrayBuffer(4);
    let index_view = new DataView(index_buffer)
    let index = 0;
    let bytesReceived = 0;

    function nextBlock() {
      return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
          if (opts.interrupt){
            clearInterval(interval)
            notifyCallback = noop;
            reject(new InterruptException())
          }
        }, 1000)
        notifyCallback = (event) => {
          let data = event.target.value;
          // first bit is the block number
          let blockNumber = data.getUint32(0, true);
          // the rest is the block
          let block = new Uint8Array(data.buffer, 4);

          if (block.byteLength === 0) {
            // drop value
            index++;
            return resolve(false);
          }

          if (blockNumber !== index) {
            return reject(new OutOfOrderException());
          }

          result.set(block, bytesReceived);
          notifyCallback = noop;
          bytesReceived += block.byteLength;
          index++;
          resolve(true);
        };
        index_view.setUint32(0, index, true);
        connection.gatt.getPrimaryService(SERVICE_UUID)
          .then(service => service.getCharacteristic(CHARACTERISTICS.data_req))
          .then(characteristic => characteristic.writeValue(index_view))
          .catch(err => reject(err));
      });
    }
    await startDataNotifications(notify);
    try {
      if (all) {
        await writeCommand('Z');
      } else {
        await writeCommand('G');
      }
      await writeCommand(COMMANDS.startDataDownload.value);
      while (bytesReceived < expectedLength) {
        if (opts.interrupt){
          throw new InterruptException()
        }
        await nextBlock();
        if (opts.onProgress) {
          opts.onProgress(bytesReceived, expectedLength);
        }
      }
    } finally {
      try {
        await stopDataNotifications(notify);
      } finally {
        await writeCommand(COMMANDS.stopDataDownload.value);
      }
    }
    return result;
  }

  return {
    connect,
    disconnect,
    getCountStatus,
    setName,
    fetchData,
    eraseData: () => writeCommand(COMMANDS.eraseFlash.value),
    getUptime,
    getSynchTime,
    getVersion,
    synchClock,
    getBatteryLevel,
    getLastAddress,
    startRecording: () => writeCommand(COMMANDS.startWritingToFlash.value),
    stopRecording: () => writeCommand(COMMANDS.stopWritingToFlash.value),
    setMark: () => writeCommand(COMMANDS.recordPrimaryEncounterEvent.value),
    setUnmark: () => writeCommand(COMMANDS.recordSecondaryEncounterEvent.value),
    setScanParameters,
    getDeviceName: () => sanitize(connection.name),
    isConnected: () => !!connection,
    on: pubsub.on.bind(pubsub),
    off: pubsub.off.bind(pubsub),
    once: pubsub.once.bind(pubsub)
  };
}
