<template >
<div class="tracking-tab">
<device-info v-on:disconnect="controller.disconnect()" :info="deviceInfo" :message="message" v-if="connected"></device-info>
<div class="control" v-if="connected">
    <a href="#" class="round-button" v-on:click="onRecordingButton">
        <font-awesome-layers style="font-size: 2em;">
            <font-awesome-icon :icon="['far', 'circle']" />
            <font-awesome-icon :icon="recordingIcon" v-bind:style="{color: recordingColor}" transform="shrink-8" />
        </font-awesome-layers>
    </a>
    <p v-bind:class="{recording: recording}" >{{ recordingText }}</p>
    <div class="checkbox" v-if="recording">
        <input type="checkbox" id="near" v-model="near"/>
        <label for="near">Near Someone</label>
    </div>
</div>
<button id="connect" v-on:click="onConnect" v-else>Connect</button>
</div>
</template>

<script>
import DeviceInfo from './DeviceInfo'
import { Controller }  from '../modules/dongle-control'
import { DeviceWrapper } from '../modules/device-wrapper'

export default {
    components: { DeviceInfo },
    data() {
        return {
            controller: Controller(),
            deviceInfo: undefined,
            message: undefined,
            recording: false,
            near: false,
            connected: false,
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
        onRecordingButton: function() {
            if (!this.recording) {
                this.message = undefined;
                this.controller.setScanParameters(320 * 12, 230)
                    .then(() => this.controller.startRecording())
                    .then(() => {
                        this.recording = true;
                        this.near = false;
                    })
                    .catch(error => {
                        console.log(error);
                        this.message = error.message;
                    });
            } else {
                this.controller.stopRecording().then(() => {
                    this.recording = false;
                })
                .catch(error => {
                        console.log(error);
                        this.message = error.message;
                });
            }
        },
        onConnect: function() {
            this.controller.connect()
        },
        onConnected: function() {
            this.controller.getVersion()
                .then(version => console.log(version))
                .then(() => new DeviceWrapper(this.controller))
                .then(info => this.deviceInfo = info)
                .then(() => {this.connected = true})
                .catch(error => {
                    console.log(error);
                    this.message = error.message;
                });
        },
        onDisconnected: function() {
            this.connected = false;
        },
    },
    computed: {
        recordingText: function() {
            if (this.recording) {
                return "Recording Active"
            } else {
                return "Not Recording"
            }
        },
        recordingIcon: function() {
            if (this.recording) {
                return ['fas', 'square']
            } else {
                return ['fas', 'circle']
            }
        },
        recordingColor: function() {
            if (this.recording) {
                return "black"
            } else{
                return "red"
            }
        }
    },
    watch: {
        near: function(newNear) {
            if (newNear === true) {
                this.controller.setMark();
            } else if (newNear === false) {
                this.controller.setUnmark();
            }
            
        }
    }
}
</script>

<style scoped>
.control {
    margin-top: 1em;
    margin-left: 1em;
}

.control p {
    margin: 0 0 0 0.5em;
    display: inline-block;
    vertical-align: 0.4em;
}

.recording {
    color: red;
    font-weight: bold;
    animation: blinker 1.5s cubic-bezier(.5, 0, 1, 1) infinite alternate;
}

@keyframes blinker {  
  from { opacity: 1; }
  to { opacity: 0; }
}

.control .checkbox {
    margin-top: 1em;
    margin-left: 1em;
}
</style>