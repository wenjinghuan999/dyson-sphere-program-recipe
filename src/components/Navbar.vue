<template>
  <b-navbar class="fixed-top" toggleable="lg" type="dark" variant="dark">
    <b-container>
        <b-navbar-brand href="#">
          <img src="../assets/Icons/DSPGAME.png">
          <span> {{ title }} </span>
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template slot="button-content"><b-icon-globe /> {{ localeName }} </template>
            <b-dropdown-item v-for="locale in localeOptions" :key="locale" v-on:click="onSelectLocale(locale)">
              {{ getLocaleName(locale) }}
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        </b-collapse>
      </b-container>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DataLoader } from '../common/dataloader'
import Mixins from '@/common/mixin'

@Component({
  mixins: [Mixins]
})
export default class Navbar extends Vue {
  @Prop() private readonly title!: string;

  private static readonly LocaleNames: Record<string, string> = {
    ZHCN: '中文', ENUS: 'English', FRFR: 'Français'
  };

  onSelectLocale (locale: string) {
    DataLoader.getInstance().locale = locale
  }

  get localeName (): string {
    return this.getLocaleName(this.currentLocale)
  }

  get currentLocale (): string {
    return DataLoader.getInstance().locale
  }

  getLocaleName (locale: string): string {
    return Navbar.LocaleNames[locale]
  }
}
</script>

<style scoped>
.navbar {
    background-color: #1D1D1D !important;
}
</style>
