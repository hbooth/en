<template>
  <div class="device-info">
    <dl class="status">
      <dt class="name">Connected:</dt>
      <dd class="name"><input v-model="deviceName" :readonly="allowNameChange ? false : 'readonly'" /></dd>
      <dd class="name"><button v-bind:style="{ visibility: allowNameChange ? 'visible' : 'hidden' }" v-on:click="onSetName">Set Name</button></dd>
      <dt><font-awesome-icon :icon="batteryIcon" size="lg" />:</dt>
      <dd>{{batteryLevel}}%</dd>
      <dt>Mem:</dt>
      <dd>{{ memoryUsed * 32 }} bytes {{ memoryPercent | formatFloat(2) }}%</dd>
      <dt><a href="#" class="round-button disconnect" v-on:click="onDisconnect">
          <font-awesome-layers style="font-size: 1.5em;">
            <font-awesome-icon :icon="['fas', 'ban']"/>
            <font-awesome-icon :icon="['fab', 'bluetooth-b']" transform="shrink-6"/>
          </font-awesome-layers>
      </a></dt>
    </dl>
    <p v-if="message" class="error">{{message}}</p>
    <div class="time">
      <font-awesome-layers style="font-size: 4em;">
        <font-awesome-icon :icon="['far', 'square']" />
        <font-awesome-icon :icon="['far', 'clock']" transform="shrink-6" />
      </font-awesome-layers>
      <dl>
        <dt>Uptime:</dt>
        <dd>{{ upTime | formatUptime }}</dd>
        <dt>Device:</dt>
        <dd>{{ deviceTime | formatMoment }}</dd>
        <dt>Local:</dt>
        <dd>{{ localTime | formatMoment }}</dd>
      </dl>
      <button class="synch" v-if="allowSynch" v-on:click="onSynch">Synch Clock</button>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  props: {
    allowSynch: {
      type: Boolean,
      default: false
    },
    device: {
      type: Object
    },
    connected: {
      type: Boolean
    },
    allowNameChange: {
      type: Boolean,
      default: false
    }
  },
  data() {
    var deviceName = "N/A";
    if (this.connected && this.device) {
      deviceName = this.device.getDeviceName();
    }
    return {
      batteryLevel: undefined,
      memoryUsed: undefined,
      localTime: dayjs(),
      upTime: undefined,
      deviceTime: undefined,
      totalMemory: 32768,
      deviceName,
      message: undefined
    }
  },
  created() {
    if (this.device) {
      this.device.getCountStatus()
        .then(value => {
          this.memoryUsed = value.blocks;
          return value.status;
        })
        .then(status => {
          if ((status & 0x4) == 4) {
            return this.device.synchClock();
          }
        })
        .then(() => this.device.getUptime())
        .then(value => this.upTime = value)
        .then(() => this.device.getSynchTime())
        .then(value => this.deviceTime = dayjs(value + this.upTime))
        .then(() => this.device.getBatteryLevel())
        .then(value => this.batteryLevel = value)
    }
  },
  methods: {
    onDisconnect: function() {
      if (this.device) {
        this.device.disconnect();
      }
    },
    onSynch: function() {
      this.message = undefined;
      this.device.synchClock()
        .catch(error => this.message = error.message);
    },
    onSetName: function() {
      this.device.setName('NIST' + ("0000" + this.deviceName).slice(-4) )
        .then(() => {
          alert("Please turn off or reboot device for the name change to take effect.");
          this.device.disconnect()
        })
        .catch(error => this.message = error.message);
    }
  },
  computed: {
    batteryIcon: function() {
      if (this.batteryLevel == undefined) {
        return ['fas', 'ban']
      } else if (this.batteryLevel > 87.5) {
        return ['fas', 'battery-full']
      } else if (this.batteryLevel > 62.5){
        return ['fas', 'battery-three-quarters']
      } else if (this.batteryLevel > 37.5) {
        return ['fas', 'battery-half']
      } else if (this.batteryLevel > 15) {
        return ['fas', 'battery-quarter']
      } else {
        return ['fas', 'battery-empty']
      }
    },
    memoryPercent: function() {
      if (this.memoryUsed === undefined) {
        return undefined;
      }
      return (this.memoryUsed / this.totalMemory) * 100
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
dl {
  margin: 0;
}

dl dt {
  display:inline-block;
  margin-inline-start: 0.5em;
  margin-inline-end: 0;
}

dl dd {
  display:inline-block;
  margin-inline-start: 0;
  margin-inline-end: 0.5em;
}

dl.status {
  width: 20em;
}

dl.status dt.name {
  width: 6em;
}

dl.status dd.name input {
  width: 5em;
}

dl.status dd.name:not(:first-child) {
  width: 6em;
}

div.time dl {
  position: relative;
  display:inline-block;
  width: 20em;
  vertical-align: 0.75em;
  margin-top: 0;
  margin-bottom: 0;
}

div.time dl dt {
  width: 5em;
  vertical-align: middle;
  text-align: right;
  margin-inline-start: 0;
  margin-inline-end: 0.5em;
}

div.time dl dd {
  width: 14em;
  text-align: left;
  margin-inline-end: 0;
}

div.time button {
  vertical-align: 2em;
  text-align: center;
  cursor: pointer;
  outline: none;
  color: #fff;
  background-color: #4CAF50;
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px #999;
}

div.time button:hover {
  background-color: #3e8e41
}

div.time button:active {
  background-color: #3e8e41;
  box-shadow: 0 2px #666;
  transform: translateY(2px);
}

a.disconnect {
  margin-left: 2px;
  vertical-align: middle;
}

p.error {
  color: #FF0000;
  font-weight: bold;
}

</style>
