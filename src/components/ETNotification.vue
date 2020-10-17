<template >
<div class="notification-tab">
<device-info :device="controller" :connected="connected" v-if="connected"></device-info>
<div v-if="connected">
    <progress-status ref="progress"></progress-status>
    <button v-if="state !== 'default'" v-on:click="onCancel">Cancel</button>
    <button v-if="state === 'default'" v-on:click="onUpload">Upload</button>
    <button v-if="state === 'default'" v-on:click="onExposures">Check Exposures</button>
</div>
<simple-grid :data="gridData" :columns="gridColumns" :caption="'Exposures'" v-if="connected && gridData.length > 0"></simple-grid>
<button id="connect" v-on:click="onConnect" v-if="!connected">Connect</button>
</div>
</template>

<script>
import DeviceInfo from './DeviceInfo'
import SimpleGrid from './SimpleGrid'
import ProgressStatus from './ProgressStatus'
import { Controller, InterruptException }  from '../modules/dongle-control'
import { bytesToData } from '../modules/bytes-to-csv'
import { postEncounters, getEncounters } from '../modules/encounter-server'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

function compare(local, exposures) {
    let groups = [];
    if (exposures.length > 0) {
        let map = {};
        let match = {};
        for (var e of exposures) {
            map[e.encounterId] = e;
        }
        var matches = [];
        // now look for matches
        for (var l of local) {
            // use encounter id
            if (map[l.encounterId]) {
                // found a match -- check to see if we have it already
                if (!match[l.encounterId] || !match[l.encounterId][l.timestamp]) {
                    if (match[l.encounterId] == undefined) {
                        match[l.encounterId] = {};
                    }
                    match[l.encounterId][l.timestamp] = 1;
                    matches.push(l);
                    continue;
                }
            }
        }
        // now group
        var lastGroup = undefined;
        for (var m of matches) {
            var time = dayjs(m.timestamp);
            var newGroup = !lastGroup;
            if (!newGroup) {
                var cutoff = lastGroup.start.add(5 + lastGroup.duration, 'minutes');
                newGroup = time.isAfter(cutoff);
            }
            if (newGroup) {
                lastGroup = { start: time, duration: 1, count: 1};
                groups.push(lastGroup);
            } else {
                // add to the current group
                lastGroup.duration = time.diff(lastGroup.start, 'minute');
                lastGroup.count += 1;
            }
        }
    }
    return groups;
}

export default {
    components: { DeviceInfo, SimpleGrid, ProgressStatus},
    data() {
        return {
            controller: Controller(),
            connected: false,
            gridColumns: [ {title:"Start Time", name: 'start', filter: 'formatMoment'},
                {title: "Duration (minutes)", name: 'duration'},
                {title: "Count", name: 'count'}],
            gridData: [],
            state: 'default',
            callbackOptions: { expected: undefined, last: 0, interrupt: false, onProgress: this.onProgress},
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
        onProgress: function(received, expected) {
            if (!this.callbackOptions.expected) {
                this.callbackOptions.expected = expected
                this.$refs.progress.taskExtend(expected);
            }
            this.$refs.progress.taskNextStep(undefined, received - this.callbackOptions.last);
            this.callbackOptions.last = received;
        },
        onUpload: async function() {
            var progress = this.$refs.progress;
            this.state = 'upload';

            // set-up the callback
            this.callbackOptions.expected = undefined;
            this.callbackOptions.last = 0;
            this.callbackOptions.interrupt = false;

            progress.taskBegin(4, "Retrieving Device Data");
            this.controller.getLastAddress()
                .then(address => {
                    // check the last address and print it out
                    console.log('lastAddress: ' + address);
                    progress.taskNextStep();
                })
                .then(() => {
                    // retrieve the data from the device
                    return this.controller.fetchData(false, false, this.callbackOptions);
                })
                .then(data => {
                    progress.taskNextStep("Processing Data...");
                    // now transform into encounter records
                    return bytesToData(data);
                })
                .then(rows => {
                    rows = rows.filter(v => {
                        return v.encounterId !== '0000000000000000000000000000000000000000000000000000000000000000';
                    });
                    progress.taskNextStep("Uploading...");
                    // send the data to the server
                    return postEncounters(
                        process.env.VUE_APP_DATA_SERVER_HOST,
                        process.env.VUE_APP_DATA_SERVER_PORT,
                        rows,
                        'POSITIVE',
                        { name: this.controller.getDeviceName() });
                })
                .then(result => {
                    progress.taskEnd("Data Upload Complete - Added " + result);
                })
                .catch(error => {
                    if (error instanceof InterruptException) {
                        progress.taskCancel("Upload Cancelled");
                    } else {
                        progress.taskError("Error during Upload");
                        console.log(error);
                    }
                })
                .then(() => {
                    progress.taskReset();
                    this.state = 'default';
                });
        },
        onCancel: function() {
            this.callbackOptions.interrupt = true;
        },
        onExposures: function() {
            var progress = this.$refs.progress;
            this.state = 'exposures';
            // set-up the callback
            this.callbackOptions.expected = undefined;
            this.callbackOptions.last = 0;

            let storage = {};
            this.gridData = [];
            progress.taskBegin(4, "Retrieving Device Data");
            // first retrieve the data from the device
            this.controller.fetchData(true, false, this.callbackOptions)
                .then(data => {
                    progress.taskNextStep("Device Data Retrieved");
                    // retrieve the data from the device
                    return bytesToData(data);
                })
                .then(local => {
                    progress.taskNextStep("Retrieving Server Data");
                    storage.local = local;
                    // then retrieve the data from the server
                    return getEncounters(process.env.VUE_APP_DATA_SERVER_HOST,
                        process.env.VUE_APP_DATA_SERVER_PORT);
                })
                .then(data => {
                    progress.taskNextStep("Comparing");
                    // then compare
                    this.gridData = compare(storage.local, data);
                    progress.taskEnd(this.gridData.length > 0 ? "Complete" : "No Encounters Found");
                })
                .catch(error => {
                    if (error instanceof InterruptException) {
                        progress.taskCancel("Check Cancelled");
                    } else {
                        progress.taskError("Error While Looking for Encounters");
                        console.log(error);
                    }
                })
                .then(() => {
                    progress.taskReset();
                    this.state = 'default';
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
                .then(() => {this.connected = true})
                .catch(error => {
                    console.log("version error")
                    console.log(error);
                });
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