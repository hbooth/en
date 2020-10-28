import dayjs from 'dayjs'

export function DeviceWrapper(device) {
  var batteryLevel = undefined;
  var memoryUsed = undefined;
  var status = undefined;
  var localTime = undefined;
  var upTime = undefined;
  var deviceTime = undefined;
  const totalMemory = 32768;

  return device.getCountStatus()
  .then(value => {
    memoryUsed = value.blocks;
    if (value.noSynch()) {
      console.log("synchronizing")
      return device.synchClock()
        .then(() => device.getCountStatus())
        .then(value => status = value);
    }
    return status = value;
  })
  .then(() => device.getUptime())
  .then(value => upTime = value)
  .then(() => device.getSynchTime())
  .then(value => {
    localTime = dayjs();
    deviceTime = dayjs(value + upTime);
  })
  .then(() => device.getBatteryLevel())
  .then(value => batteryLevel = value)
  .then(() => {
    return {
        batteryLevel,
        memoryUsed,
        status,
        localTime,
        upTime,
        deviceTime,
        totalMemory,
        deviceName: device.getDeviceName()
      };
  });
}
