<template >
<div class="calibration-tab">
<device-info :device="controller" :connected="connected" v-if="connected"></device-info>
<!-- p id="mode" v-if="connected" v-bind:style="{color: modeColor}">Mode: {{ modeText }}</p -->
<button id="init" v-if="connected" :on="onInit">init</button>

<fieldset id="calibration-scenario" v-if="connected">
    <legend>Calibration Scenario</legend>
    <select name="orientation" id="orientation" v-model="orientation">
        <option value="baseline">Baseline</option>
        <option value="a">A Configuration</option>
        <option value="b">B Configuration</option>
        <option value="c">C Configuration</option>
        <option value="d">D Configuration</option>
        <option value="e">E Configuration</option>
        <option value="f">F Configuration</option>
        <option value="g">G Configuration</option>
    </select>
    <figure id="orientation-figure">
        <img v-bind:src="orientationImage" v-bind:alt="orientationImageAltText"/>
    </figure>

    <input type="range" min="0.5" max="4" v-model="distance" step="0.5" class="slider">
    <p>Distance: {{ distance }} meter(s)</p>
</fieldset>

<fieldset id="recording-fields" v-if="connected" class="control">
    <a href="#" class="round-button" v-on:click="onRecordingButton">
        <font-awesome-layers style="font-size: 2em;">
            <font-awesome-icon :icon="['far', 'circle']" />
            <font-awesome-icon :icon="recordingIcon" v-bind:style="{color: recordingColor}" transform="shrink-8" />
        </font-awesome-layers>
    </a>
    <p v-bind:class="{recording: recording}" >{{ recordingText }}</p>
</fieldset>

<button id="connect" v-on:click="onConnect" v-if="!connected">Connect</button>
</div>
</template>

<script>
import DeviceInfo from './DeviceInfo'
import { Controller, MODES}  from '../modules/dongle-control'

export default {
    components: { DeviceInfo},
    data() {
        return {
            controller: Controller(),
            connected: false,
            distance: 1,
            orientation: 'baseline',
            recording: false,
//            mode: undefined
        };
    },
    computed: {
        orientationImage: function() {
          return './assets/' + this.orientation + '-fig.png';
        },
        orientationImageAltText: function() {
            return this.orientation.charAt(0).toUpperCase() + this.orientation.slice(1) + " Figure";
        },
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
        },
        modeText: function() {
            if (this.mode === MODES.CALIBRATION) {
                return "Calibration";
            } else if (this.mode === MODES.ENCOUNTER) {
                return "Encounter"
            } else {
                return "???"
            }
        },
        modeColor: function() {
            if (this.mode === MODES.CALIBRATION) {
                return "inherit";
            } else {
                return "red";
            }
        },
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
//                .then(() => this.controller.getMode())
//                .then(mode => this.mode = mode)
                .then(() => {this.connected = true});
        },
        onDisconnected: function() {
            this.connected = false;
        },
        onRecordingButton: function() {
            if (!this.recording) {
                this.controller.setScanParameters(320 * 12, 230)
                    .then(() => this.controller.writeCalibration(Math.round(this.distance * 100), this.orientation))
                    .then(() => this.controller.startRecording())
                    .then(() => {
                        this.recording = true;
                    });
            } else {
                this.controller.stopRecording().then(() => {
                    this.recording = false;
                });
            }
        },
        onInit: function() {
            this.controller.synchClock()
                .then(() => this.controller.eraseData())
                .then(() => this.controller.setMode(MODES.CALIBRATION))
                .then(() => this.controller.getMode())
        }
    }
}
</script>

<style scoped>
#mode {
    display: inline;
}

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

fieldset {
    margin-top: 0.5em;
    border: none;
    line-height: 0.75em;
}

fieldset legend {
    font-size: larger;
    font-weight: bold;
}

#orientation-figure {
    margin: 0;
    width: 200px;
    height: 100px;
    background-color: white;
}

#orientation-figure img {
    object-fit: contain;
    width: 100%;
}

#orientation {
    width: 200px;
    margin-bottom: 0.5em;
}

#calibration-scenario {
    border: groove;
    width: fit-content;
}

</style>