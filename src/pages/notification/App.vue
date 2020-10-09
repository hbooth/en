<template>
<tabNotification></tabNotification>
</template>

<script>
  import tabNotification from '../../components/ETNotification'
  export default {
    name: "NISTET",
    components: {tabNotification},
    data: function() {
      return {
      };
    },
    computed: {
    },
    created() {
    }
  };
</script>

<style>
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
