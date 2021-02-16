<template>
  <div class="building-and-recipe">
    <b-input-group>
      <div class="input-group-prepend">
        <div class="input-group-text">
          <b-img
            v-bind:src="require('../assets/' + building.IconPath + '.png')"
            style="width: 32px !important; height: 32px !important"
          />
        </div>
      </div>
      <div class="input-group-append">
        <div class="input-group-text">
          <b-img
            v-bind:src="require('../assets/' + icon + '.png')"
            style="width: 32px !important; height: 32px !important"
          />
        </div>
      </div>
    </b-input-group>
  </div>
</template>

<script lang="ts">
import { Item, Recipe } from '@/common/product'
import { DataLoader } from '@/common/dataloader'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Mixins from '@/common/mixin'

@Component({
  mixins: [Mixins]
})
export default class BuildingAndRecipe extends Vue {
  @Prop() private readonly recipe!: Recipe;

  get icon (): string {
    if (this.recipe && this.recipe.IconPath) {
      return this.recipe.IconPath
    } else if (this.recipe && this.recipe.Results.length > 0) {
      return DataLoader.getInstance().ItemMap[this.recipe.Results[0]].IconPath
    } else {
      return 'Icons/placeholder'
    }
  }

  get building (): Item {
    const items = DataLoader.getInstance().RecipeTypesMap[this.recipe.Type]
    if (this.recipe.Type === 4) {
      return items[1]
    } else {
      return items[0]
    }
  }
}
</script>
