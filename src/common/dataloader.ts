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
    this.RecipeItemMap = DataLoader.buildRecipeItemMap(this.AllRecipes)
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

  private static buildItemMap (items: Item[]): Record<number, Item> {
    const itemMap: Record<number, Item> = {}
    items.forEach((item) => {
      itemMap[item.ID] = item
    })
    return itemMap
  }

  private static buildRecipeMap (recipes: Recipe[]): Record<number, Recipe> {
    const recipeMap: Record<number, Recipe> = {}
    recipes.forEach((recipe) => {
      recipeMap[recipe.ID] = recipe
    })
    return recipeMap
  }

  private static buildRecipeItemMap (recipes: Recipe[]): Record<number, Recipe[]> {
    const recipeItemMap: Record<number, Recipe[]> = {}
    recipes.forEach((recipe) => {
      recipe.Results.forEach((itemId) => {
        if (recipeItemMap[itemId] === undefined) {
          recipeItemMap[itemId] = [recipe]
        } else {
          recipeItemMap[itemId].push(recipe)
        }
      })
    })
    return recipeItemMap
  }

  readonly AllItems: Item[];
  readonly AllRecipes: Recipe[];
  readonly ItemMap: Record<number, Item>;
  readonly RecipeMap: Record<number, Recipe>;
  readonly RecipeItemMap: Record<number, Recipe[]>;
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
