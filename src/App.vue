<template>
  <div id="app">
    <Navbar :title="tr('Dyson Sphere Program Recipe')" />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Navbar from '@/components/Navbar.vue'
import { tr } from '@/common/dataloader'

@Component({
  components: {
    Navbar
  }
})
export default class App extends Vue {
  private readonly tr = tr;
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
