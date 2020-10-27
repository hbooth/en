<template>
  <div class="device-info">
    <dl class="status">
      <dt class="name">Connected:</dt>
      <dd class="name"><input v-model="name" :readonly="allowNameChange ? false : 'readonly'" /></dd>
      <dd class="name"><button v-bind:style="{ visibility: allowNameChange ? 'visible' : 'hidden' }" v-on:click="$emit('set-name', name)">Set Name</button></dd>
      <dt><font-awesome-icon :icon="batteryIcon" size="lg" />:</dt>
      <dd>{{info.batteryLevel}}%</dd>
      <dt>Mem:</dt>
      <dd>{{ info.memoryUsed * 32 }} bytes {{ memoryPercent | formatFloat(2) }}%</dd>
      <dt><a href="#" class="round-button disconnect" v-on:click="$emit('disconnect')">
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
        <dd>{{ info.upTime | formatUptime }}</dd>
        <dt>Device:</dt>
        <dd>{{ info.deviceTime | formatMoment }}</dd>
        <dt>Local:</dt>
        <dd>{{ info.localTime | formatMoment }}</dd>
      </dl>
      <button class="synch" v-if="allowSynch" v-on:click="$emit('synch-clock')">Synch Clock</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    allowSynch: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      required: true
    },
    message: {
      type: String,
      default: undefined
    },
    allowNameChange: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      name: this.info.deviceName
    }
  },
  computed: {
    batteryIcon: function() {
      if (this.info.batteryLevel == undefined) {
        return ['fas', 'ban']
      } else if (this.info.batteryLevel > 87.5) {
        return ['fas', 'battery-full']
      } else if (this.info.batteryLevel > 62.5){
        return ['fas', 'battery-three-quarters']
      } else if (this.info.batteryLevel > 37.5) {
        return ['fas', 'battery-half']
      } else if (this.info.batteryLevel > 15) {
        return ['fas', 'battery-quarter']
      } else {
        return ['fas', 'battery-empty']
      }
    },
    memoryPercent: function() {
      if (this.info.memoryUsed === undefined) {
        return undefined;
      }
      return (this.info.memoryUsed / this.info.totalMemory) * 100
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
  width: 25em;
}

dl.status dt.name {
  width: 7em;
}

dl.status dd.name input {
  width: 6em;
}

dl.status dd.name:not(:first-child) {
  width: 8em;
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
