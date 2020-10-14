<template >
<div class="notification-tab">
<device-info :device="controller" :connected="connected" v-if="connected"></device-info>
<simple-grid :data="gridData" :columns="gridColumns" :caption="'Recent Encounters'" v-if="connected && gridData.length > 0"></simple-grid>
<p v-if="connected && gridData.length == 0">{{ empty_message }}</p>
<div v-if="connected">
    <button id="upload" v-on:click="onUpload">Upload</button>
    <button id="encounter" v-on:click="onEncounters">Encounters</button>
</div>
<p v-if="connected && upload_message">{{ upload_message }}</p>
<button id="connect" v-on:click="onConnect" v-if="!connected">Connect</button>
</div>
</template>

<script>
import DeviceInfo from './DeviceInfo'
import SimpleGrid from './SimpleGrid'
import { Controller }  from '../modules/dongle-control'
import { bytesToData } from '../modules/bytes-to-csv'
import { postEncounters, getEncounters } from '../modules/encounter-server'

function compare(local, exposures) {
    let result = [];
    if (exposures.length > 0) {
        let map = {};
        let match = {};
        for (var e of exposures) {
            map[e.encounterId] = e;
        }
        for (var l of local) {
            // use encounter id
            if (map[l.encounterId]) {
                // found a match -- check to see if we have it already
                if (!match[l.encounterId] || !match[l.encounterId][l.timestamp]) {
                    if (match[l.encounterId] == undefined) {
                        match[l.encounterId] = {};
                    }
                    match[l.encounterId][l.timestamp] = 1;
                    result.push(l);
                    continue;
                }
            }
        }
    }
    return result;
}

export default {
    components: { DeviceInfo, SimpleGrid },
    data() {
        return {
            controller: Controller(),
            connected: false,
            gridColumns: ["encounterId", "timestamp", "mac"],
            gridData: [],
            empty_message: "Not Checked",
            upload_message: undefined
        };
    },
    created() {
        this.controller.on('connected', this.onConnected);
        this.controller.on('disconnected', this.onDisconnected)
    },
    beforeDestroy() {
        this.controller.off('disconnected', this.onDisconnected)
        this.controller.off('connected', this.onConnected)
    },
    methods: {
        onUpload: function() {
            this.upload_message = "Retrieving Device Data";
            this.controller.getLastAddress()
                .then(address => {
                    console.log('lastAddress: ' + address)
                    // retrieve the data from the device
                    return this.controller.fetchData(false, true);
                }).then(data => {
                    // now transform into encounter records
                    return bytesToData(data);
                })
                .then(rows => {
                    this.upload_message = "Processing Data";
                    rows = rows.filter(v => {
                        return v.encounterId !== '0000000000000000000000000000000000000000000000000000000000000000';
                    });
                    // send the data to the server
                    return postEncounters('localhost', '8000', rows, 'POSITIVE',
                        { name: this.controller.getDeviceName() });
                })
                .then((result) => {
                    this.upload_message = "Data Upload Complete - Added " + result;
                })
                .catch(error => {
                    this.upload_message = "Error during Upload";
                    console.log(error)
                });
        },
        onEncounters: function() {
            let storage = {};
            this.gridData = [];
            this.empty_message = "Retrieving Device Data";
            // first retrieve the data from the device
            this.controller.fetchData()
                .then(data => {
                    // retrieve the data from the device
                    return bytesToData(data);
                })
                .then(local => {
                    this.empty_message = "Retrieving Server Data";
                    storage.local = local;
                    // then retrieve the data from the server
                    return getEncounters('localhost', '8000');
                })
                .then(data => {
                    this.empty_message = "Comparing";
                    // then compare
                    this.gridData = compare(storage.local, data);
                    this.empty_message = "No Encounters Found";
                }).catch(error => {
                    console.log(error);
                    this.empty_message = "Error While Looking for Encounters";
                });
        },
        onConnect: function() {
            this.controller.connect()
            .catch(error => {
                if (error.name !== 'NotFoundError') {
                    console.log(error);
                }
            })
        },
        onConnected: function() {
            this.controller.getVersion()
                .then(version => console.log(version))
                .then(() => {this.connected = true});
        },
        onDisconnected: function() {
            this.connected = false;
        }
    }
}

</script>

<style scoped>
button {
    margin-right: 0.25em;
}
</style>