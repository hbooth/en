<template>
<div>
    <p v-if="message" :style="textStyle" v-on:transitionend="onTransitioned">{{ message }}</p>
    <progress ref="progress" :style="progressStyle" :value="value" :max="max"></progress>
</div>
</template>

<script>
export default {
    data() {
        return {
            message: undefined,
            max: undefined,
            value: undefined,
            progressStyle: {
                display: 'none',
                width: this.width
            },
            textStyle: {
                opacity: 0,
                width: this.width,
                display: 'none',
            }
        };
    },
    props: {
        width: {
            type: String,
            default: '20em'
        },
        errorColor: {
            type: String,
            default: '#FF0000'
        }
    },
    watch: {
        value: function(val) {
            if (val == undefined) {
                this.progressStyle.display = 'none';
            } else {
                this.progressStyle.display = undefined;
            }
        }
    },
    methods: {
        onTransitioned: function() {
            if (this.textStyle.opacity == 0) {
                this.textStyle.display = 'none';
            }
        },
        clear: function() {
            this.message = undefined;
            this.textStyle.display = 'none';
        },
        updateMessage: function(message) {
            if (message) {
                this.message = message;
                this.textStyle.display = undefined;
            }
        },
        taskBegin: function(steps, message) {
            this.textStyle['color'] = undefined;
            this.max = steps;
            this.value = 0;
            this.textStyle.opacity = 1;
            this.updateMessage(message);
        },
        taskNextStep: function(message, increment) {
            if (increment) {
                this.value += increment;
            } else {
                this.value += 1;
            }
            this.updateMessage(message);
        },
        taskExtend: function(steps) {
            this.max += steps;
        },
        taskEnd: function(message) {
            this.value = this.max;
            this.updateMessage(message);
            this.textStyle.opacity = 0;
        },
        taskCancel: function(message) {
            this.textStyle['color'] = this.errorColor;
            this.updateMessage(message);
            this.textStyle.opacity = 0;
        },
        taskError: function(message) {
            this.textStyle['color'] = this.errorColor;
            this.updateMessage(message);
        },
        taskReset: function(message) {
            this.updateMessage(message);
            this.value = undefined;
            this.max = undefined;
            this.$refs.progress.removeAttribute('value');
        }
    }
}
</script>

<style scoped>
p {
    transition: opacity 1s ease 0.5s;
}
</style>