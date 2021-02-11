import itemsJson from '@/assets/prototypes/items.json'
import recipesJson from '@/assets/prototypes/recipes.json'
import stringsJson from '@/assets/prototypes/strings.json'
import uiStringsJson from '@/assets/ui-strings.json'
import { Item, Recipe } from '@/common/product'

class DataLoader {
  private static instance: DataLoader;

  private constructor () {
    this.AllItems = itemsJson
    this.AllRecipes = recipesJson
    this.ItemMap = DataLoader.buildItemMap(this.AllItems)
    this.RecipeMap = DataLoader.buildRecipeMap(this.AllRecipes)
    this.StringMaps = DataLoader.buildStringMap()

    console.log(this)
  }

  public static getInstance (): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader()
    }
    return DataLoader.instance
  }

  private static buildStringMap (): Record<string, Record<string, string>> {
    const map: Record<string, Record<string, string>> = {
      ZHCN: {}, ENUS: {}, FRFR: {}
    }
    stringsJson.forEach((entry) => {
      map.ZHCN[entry.Name] = entry.ZHCN
      map.ENUS[entry.Name] = entry.ENUS
      map.FRFR[entry.Name] = entry.FRFR
    })
    uiStringsJson.forEach((entry) => {
      map.ZHCN[entry.Name] = entry.ZHCN
      map.ENUS[entry.Name] = entry.ENUS
      map.FRFR[entry.Name] = entry.FRFR
    })
    return map
  }

  private static buildItemMap (items: Array<Item>): Record<number, Item> {
    const itemMap: Record<number, Item> = {}
    items.forEach((item) => {
      itemMap[item.ID] = item
    })
    return itemMap
  }

  private static buildRecipeMap (recipes: Array<Recipe>): Record<number, Array<Recipe>> {
    const recipeMap: Record<number, Array<Recipe>> = {}
    recipes.forEach((recipe) => {
      recipe.Results.forEach((itemId) => {
        if (recipeMap[itemId] === undefined) {
          recipeMap[itemId] = [recipe]
        } else {
          recipeMap[itemId].push(recipe)
        }
      })
    })
    return recipeMap
  }

  readonly AllItems: Array<Item>;
  readonly AllRecipes: Array<Recipe>;
  readonly ItemMap: Record<number, Item>;
  readonly RecipeMap: Record<number, Array<Recipe>>;
  readonly StringMaps: Record<string, Record<string, string>>;

  private currentLocale = 'ZHCN'

  get locale () {
    return this.currentLocale
  }

  set locale (value: string) {
    this.currentLocale = value
  }

  get stringMap (): Record<string, string> {
    return this.StringMaps[this.locale]
  }
}

function tr (s: string): string {
  const dataLoader = DataLoader.getInstance()
  const t = dataLoader.stringMap[s]
  if (t === undefined) {
    return s
  } else {
    return t
  }
}

export {
  DataLoader, tr
}
