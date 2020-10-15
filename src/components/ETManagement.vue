<template>
<div class="management-tab">
<device-info :device="controller" :connected="connected" v-if="connected" allowSynch></device-info>
<simple-grid :data="gridData" :columns="gridColumns" :caption="'Properties'" v-if="connected"></simple-grid>
<div class="memory" v-if="connected">
    <h3>Memory:</h3>
    <a href="#" v-on:click="onLoad">Load</a>
    <textarea rows="10" cols="60" readonly="1" wrap="1" v-model="hexMemory"></textarea>
    <button id="download" v-on:click="onDownload">Download</button>
    <button id="erase" v-on:click="onErase">Erase</button>
</div>
<button id="connect" v-on:click="onConnect" v-else>Connect</button>
</div>
</template>

<script>
import DeviceInfo from './DeviceInfo'
import SimpleGrid from './SimpleGrid'
import { Controller }  from '../modules/dongle-control'

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
    components: { DeviceInfo, SimpleGrid },
    data() {
        return {
            controller: Controller(),
            connected: false,
            gridColumns: ["name", "value"],
            gridData: [
                { name: "attribute1", value: 'Value1' },
                { name: "attribute2", value: 'Value2' },
                { name: "attribute3", value: 'Value3' },
                { name: "attribute4", value: 'Value4' }
            ],
            memory: undefined
        };
    },
    created() {
        this.controller.on('connected', () => {
            this.connected = true
            this.memory = undefined
        })
        this.controller.on('disconnected', () => {
            this.connected = false
            this.memory = undefined
        })
    },
    beforeDestroy() {
        this.controller.off('disconnected')
        this.controller.off('connected')
    },
    methods: {
        onLoad: function() {
            this.controller.fetchData()
                .then(data => {
                    this.memory = data;
                });
        },
        onErase: function() {
            this.controller.eraseData().then(() => this.memory = undefined)
        },
        onDownload: function() {
            if (!this.memory) {
                this.controller.fetchData()
                    .then(data => {
                        download(data, this.generateFilename());
                    })
            }
            if (this.memory) {
                download(this.memory, this.generateFilename());
            }
        },
        onConnect: function() {
            this.controller.connect()
                .catch(error => {
                console.log('error name' + error.name);
                console.log(error);
            })
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