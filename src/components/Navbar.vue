<template>
  <b-container fluid class="fixed-top m-0 p-0" >
    <b-navbar toggleable="lg" type="dark" variant="dark">
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
            <template slot="button-content"><b-icon-globe /></template>
            <b-dropdown-item v-for="locale in localeOptions" :key="locale" v-on:click="onSelectLocale(locale)">
              {{ getLocaleName(locale) }}
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        </b-collapse>
      </b-container>
    </b-navbar>
    <b-alert show variant="danger" dismissible>
      {{ tr('This site is under construction. Results may be invalid!') }}
    </b-alert>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DataLoader, tr } from '../common/dataloader'
import Mixins from '@/common/mixin'

@Component({
  mixins: [Mixins]
})
export default class Navbar extends Vue {
  @Prop() private readonly title!: string;
  private currentLocale: string;
  private tr = tr;

  constructor () {
    super()
    this.currentLocale = Vue.$cookies.get('locale')
    this.currentLocale = this.currentLocale ? this.currentLocale : 'ZHCN'
    DataLoader.getInstance().locale = this.currentLocale
  }

  private static readonly LocaleNames: Record<string, string> = {
    ZHCN: '中文', ENUS: 'English', FRFR: 'Français'
  };

  onSelectLocale (locale: string) {
    DataLoader.getInstance().locale = locale
    Vue.$cookies.set('locale', locale)
  }

  get localeName (): string {
    return this.getLocaleName(this.currentLocale)
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
