<template>
<div id="dynamic-component-demo">
      <button
        v-for="tab in tabs"
        v-bind:key="tab"
        v-bind:class="['tab-button', { active: currentTab === tab }]"
        v-on:click="currentTab = tab"
      >
        {{ tab }}
      </button>

      <keep-alive>
        <component v-bind:is="currentTabComponent" class="tab"></component>
      </keep-alive>
    </div>
</template>

<script>
      import tabTracking from "../../components/ETTracking";
      import tabManagement from "../../components/ETManagement";
      import tabCalibration from "../../components/ETCalibration";

      export default {
        name: "NISTET",
        components: {tabTracking, tabManagement, tabCalibration},
        data: function() {
          return {
          currentTab: "Tracking",
          tabs: ["Tracking", "Calibration", "Management"]
          };
        },
        computed: {
          currentTabComponent: function() {
            return "tab-" + this.currentTab.toLowerCase();
          }
        },
        created() {
        }
        
      };
</script>

<style>
body {
  font-family: sans-serif;
	font-size: 1.2rem;
}

button {
		border: none;
		padding: 0.25rem 1rem;
		margin: 0 0.25rem;
		border-radius: 10px;
		text-decoration: none;
		background: #800080;
		color: #ffffff;
}

.tab-button {
  padding: 6px 10px;
  border-radius: 10px 10px 0 0;
  border: 1px solid #ccc;
  cursor: pointer;
  background: #f0f0f0;
  margin-bottom: -1px;
  margin-right: -1px;
}
.tab-button:hover {
  background: #e0e0e0;
}
.tab-button.active {
  background: #e0e0e0;
  color: #000000;
}
.tab {
  border: 1px solid #ccc;
  padding: 10px;
}

.round-button {
    display: inline-block;
    border-radius: 50%;
    color: #000000;
    box-shadow: 0 0 4px gray;
}

.round-button:hover {
    background: #777555;
    box-shadow: 0 0 4px gray;
}

.round-button:active {
  transform: translateY(2px);
  box-shadow: 0 0 2px gray;
}

</style>
