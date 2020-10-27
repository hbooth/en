<template>
<div class="management-tab">
<device-info v-if="connected"
    v-on:disconnect="controller.disconnect()"
    :info="info"
    :message="message"
    v-on:synch-clock="onSynch"
    v-on:set-name="onSetName"
    allowSynch
    allowNameChange></device-info>
<simple-grid :data="gridData" :columns="gridColumns" :caption="'Device Information'" v-if="connected && gridData.length > 0"></simple-grid>
<div v-if="connected">
    <button v-on:click="onMode">Toggle Mode</button>
    <button v-on:click="onEncounterId">Toggle Encounter Id</button>
</div>
<progress-status v-if="connected" ref="progress"></progress-status>
<button id="cancel" v-if="connected && fetch" v-on:click="onCancel">Cancel</button>
<div class="memory" v-if="connected">
    <h3>Memory:</h3>
    <a href="#" v-on:click="onLoad" :disabled="fetch">Load</a>
    <textarea rows="10" cols="60" readonly="1" wrap="1" v-model="hexMemory"></textarea>
    <button id="download" :disabled="fetch" v-on:click="onDownload">Download</button>
    <button id="erase" :disabled="fetch" v-on:click="onErase">Erase</button>
</div>
<button id="connect" v-on:click="onConnect" v-else>Connect</button>
</div>
</template>

<script>
import DeviceInfo from './DeviceInfo'
import ProgressStatus from './ProgressStatus'
import { Controller, InterruptException, MODES}  from '../modules/dongle-control'
import { DeviceWrapper } from '../modules/device-wrapper'
import SimpleGrid from './SimpleGrid'

function toHexString (byteArray) {
  const length = byteArray.length * 2;
  const chars = new Uint8Array(length + Math.ceil(length / 4));
  const alpha = 'a'.charCodeAt(0) - 10;
  const digit = '0'.charCodeAt(0);
  const space = ' '.charCodeAt(0);

  let p = 0;
  for (let i = 0; i < byteArray.length; i++) {
      let nibble = byteArray[i] >>> 4;
      chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
      nibble = byteArray[i] & 0xF;
      chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit;    
      if (i % 2) {
          chars[p++] = space;
      }
  }
  return new TextDecoder("utf-8").decode(chars);
}

function download(filecontent, filename) {
    // https://stackoverflow.com/questions/11071473/how-can-javascript-save-to-a-local-file/11071549
    var bb = new Blob([filecontent], {
        type: 'application/octet-stream'
    });
    var a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(bb);
    a.click();
}

export default {
    components: { DeviceInfo, SimpleGrid,  ProgressStatus},
    data() {
        return {
            controller: Controller(),
            connected: false,
            info: undefined,
            message: undefined,
            memory: undefined,
            fetch: false,
            gridColumns: [ {title:"Name", name: 'name'}, {title: "Value", name: 'value'}],
            gridData: [],
            status: undefined,
            callbackOptions: { expected: undefined, last: 0, interrupt: false, onProgress: this.onProgress}
        };
    },
    created() {
        this.controller.on('connected', this.onConnected);
        this.controller.on('disconnected', this.onDisconnected);
    },
    beforeDestroy() {
        this.controller.off('disconnected', this.onDisconnected)
        this.controller.off('connected', this.onConnected)
    },
    methods: {
        onConnected: function() {
            this.onRefresh()
                .then(() => {
                    this.connected = true
                    this.memory = undefined
                })
                .catch(error => {
                    console.log("version error")
                    console.log(error);
                });
        },
        onRefresh: function() {
            this.gridData = [];
            return this.controller.getVersion()
                .then(version => this.gridData.push({name: "Firmware Version", value: version}))
                .then(() => new DeviceWrapper(this.controller))
                .then(info => {
                    this.info = info
                    if (info) {
                        this.gridData.push({name: "Mode", value: info.status.rawMode() ? "Calibration" : "Exposure"})
                        this.gridData.push({name: "Save To Flash", value: info.status.saveToFlash()})
                        this.gridData.push({name: "Mark", value: info.status.mark()})
                        this.gridData.push({name: "Synchronized", value: !info.status.noSynch()})
                        this.gridData.push({name: "Full Encounter Id", value: !info.status.nameInEncounterId()})
                    }
                })
        },
        onDisconnected: function() {
            this.connected = false
            this.memory = undefined
            this.info = undefined
            this.gridData = []
            this.fetch = false
            if (this.$refs.progress) {
                this.$refs.progress.clear()
            }
        },
        onMode: function () {
            if (this.info.status.rawMode()) {
                this.controller.setMode(MODES.ENCOUNTER)
            } else {
                this.controller.setMode(MODES.CALIBRATION)
            }
            this.onRefresh()
        },
        onEncounterId: function () {
            if (this.info.status.nameInEncounterId()) {
                console.log('setting full');
                this.controller.setFullEncounterId()
            } else {
                console.log('using name');
                this.controller.setNameInEncounterId()
            }
            this.onRefresh()
        },
        fetchData: function() {
            // set-up the callback
            this.callbackOptions.expected = undefined;
            this.callbackOptions.last = 0;
            this.fetch = true;

            this.$refs.progress.taskBegin(1, "Fetching Data...");
            return this.controller.fetchData(true, false, this.callbackOptions)
                .then(data => {
                    this.$refs.progress.taskEnd("Completed");
                    return data;
                })
                .catch(error => {
                    if (error instanceof InterruptException) {
                        this.$refs.progress.taskCancel("Upload Cancelled");
                    } else {
                        this.$refs.progress.taskError("Error during Upload");
                        console.log(error);
                    }
                    return undefined;
                })
                .then((result) => {
                    this.fetch = false;
                    this.$refs.progress.taskReset();
                    return result;
                });
        },
        onLoad: function() {
            if (!this.fetch) {
                this.fetchData().then(data => {
                    this.memory = data
                });
            }
        },
        onErase: function() {
            if (!this.fetch) {
                this.controller.eraseData().then(() => this.memory = undefined)
            }
        },
        onDownload: function() {
            if (this.fetch) return;
            if (!this.memory) {
                this.fetchData()
                    .then(data => {
                        if (data) {
                            download(data, this.generateFilename());
                        }
                    })
            }
            if (this.memory) {
                download(this.memory, this.generateFilename());
            }
        },
        onConnect: function() {
            this.controller.connect()
            .catch(error => {
                if (error.name !== 'NotFoundError') {
                    console.log(error);
                }
            })
        },
        onSynch: function() {
            this.message = undefined;
            this.controller.synchClock()
                .catch(error => this.message = error.message);
        },
        onSetName: function(name) {
            this.controller.setName('NIST' + ("0000" + name).slice(-4) )
                .then(() => {
                    alert("Please turn off or reboot device for the name change to take effect.");
                    this.controller.disconnect()
                })
                .catch(error => this.message = error.message);
        },
        onProgress: function(received, expected) {
            if (!this.callbackOptions.expected) {
                this.callbackOptions.expected = expected
                this.$refs.progress.taskExtend(expected);
            }
            this.$refs.progress.taskNextStep(undefined, received - this.callbackOptions.last);
            this.callbackOptions.last = received;
        },
        onCancel: function() {
            this.callbackOptions.interrupt = true;
        },
        generateFilename: function () {
            var d = new Date();
            var n = d.toISOString();
            n = n.split('.');
            n = n[0];
            n = n.replace(/-/g, '');
            n = n.replace('T', '_');
            n = n.replace(/:/g, '');
            n = n + '_GMT'
            return 'raw_' + this.controller.getDeviceName() + '_' + n + '.bin'
        }
    },
    computed: {
        hexMemory: function() {
            if (this.memory) {
                return toHexString(this.memory);
            }
            return "";
        }
    },
    watch: {
    }
}
</script>

<style scoped>

.memory {
    max-width: 30em;
    clear: both;
}

.memory textarea {
    min-width:10em;
    width: 100%;
}

.memory h3 {
    margin: 1em auto 0;
}

.memory a {
    margin: -1em auto 0;
    display: block;
    float: right;
}

.memory #save {
    display: block;
    margin: 0.5em 0 0;
}

.memory #clear {
    display: block;
    margin: -1.5em 0 0;
    float: right;
}

</style>