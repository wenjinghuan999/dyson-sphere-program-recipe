import itemsJson from '@/assets/prototypes/items.json'
import veinsJson from '@/assets/prototypes/veins.json'
import recipesJson from '@/assets/prototypes/recipes.json'
import stringsJson from '@/assets/prototypes/strings.json'
import uiStringsJson from '@/assets/ui-strings.json'
import recipeTypesJson from '@/assets/recipetypes.json'
import { Item, Vein, Recipe, MiningRecipe } from '@/common/product'

class DataLoader {
  private static instance: DataLoader;

  private constructor () {
    this.AllItems = itemsJson
    this.AllVeins = veinsJson
    this.AllRecipes = recipesJson
    this.ItemMap = DataLoader.buildItemMap(this.AllItems)
    this.ItemNameMap = DataLoader.buildItemNameMap(this.AllItems)
    this.VeinMap = DataLoader.buildVeinMap(this.AllVeins)
    this.VeinItemMap = DataLoader.buildVeinItemMap(this.AllVeins)
    this.RecipeMap = DataLoader.buildRecipeMap(this.AllRecipes)
    this.RecipeItemMap = DataLoader.buildRecipeItemMap(this.AllRecipes)
    this.StringMaps = DataLoader.buildStringMap()
    this.RecipeTypesMap = DataLoader.buildRecipeTypesMap(this.ItemMap)
    this.MiningMap = DataLoader.buildMiningMap(this.ItemMap, this.ItemNameMap, this.VeinItemMap, this.RecipeTypesMap)

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
    itemMap[0] = Item.Empty
    return itemMap
  }

  private static buildItemNameMap (items: Item[]): Record<string, Item> {
    const itemNameMap: Record<string, Item> = {}
    items.forEach((item) => {
      itemNameMap[item.Name] = item
    })
    itemNameMap[''] = Item.Empty
    itemNameMap.None = Item.Empty
    return itemNameMap
  }

  private static buildVeinMap (veins: Vein[]): Record<number, Vein> {
    const veinMap: Record<number, Vein> = {}
    veins.forEach((vein) => {
      veinMap[vein.ID] = vein
    })
    veinMap[0] = Vein.Empty
    return veinMap
  }

  private static buildVeinItemMap (veins: Vein[]): Record<string, Vein> {
    const veinItemMap: Record<string, Vein> = {}
    veins.forEach((vein) => {
      veinItemMap[vein.MiningItem] = vein
    })
    veinItemMap[0] = Vein.Empty
    return veinItemMap
  }

  private static buildRecipeMap (recipes: Recipe[]): Record<number, Recipe> {
    const recipeMap: Record<number, Recipe> = {}
    recipes.forEach((recipe) => {
      recipeMap[recipe.ID] = recipe
    })
    recipeMap[0] = Recipe.Empty
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

  private static buildRecipeTypesMap (itemMap: Record<number, Item>): Record<number, Item[]> {
    const recipeTypesMap: Record<number, Item[]> = {}
    recipeTypesJson.forEach((recipeType) => {
      const items = recipeType.Items.map(itemId => itemMap[itemId])
      recipeTypesMap[recipeType.ID] = items
    })
    return recipeTypesMap
  }

  private static buildMiningMap (
    itemMap: Record<number, Item>,
    itemNameMap: Record<string, Item>,
    veinItemMap: Record<number, Vein>,
    recipeTypesMap: Record<number, Item[]>
  ): Record<number, MiningRecipe[]> {
    // TODO make this configurable
    const miningMap: Record<number, MiningRecipe[]> = {}
    itemsJson.forEach((it) => {
      const item = itemMap[it.ID]
      const recipes: MiningRecipe[] = []
      if (item.MiningFrom) {
        const miningBuildings = recipeTypesMap[0]
        let building = miningBuildings[0]
        let rate = MiningRecipe.MineMiningRate
        if (item.IsFluid) {
          if (item.ID === 1007) {
            building = miningBuildings[2]
            rate = MiningRecipe.OilMiningRate
          } else {
            building = miningBuildings[1]
            rate = MiningRecipe.OceanMiningRate
          }
        } else if (item.MiningFrom === '\u6c14\u6001\u5de8\u661f\u8f68\u9053') {
          building = miningBuildings[3]
          rate = MiningRecipe.GasMiningRate
        } else if (item.MiningFrom === '\u6811\u6728' || item.MiningFrom === '\u690d\u7269') {
          return
        }
        const vein = veinItemMap[item.ID]
        if (vein) {
          rate /= vein.MiningTime
        } else {
          rate /= 60
        }
        recipes.push(new MiningRecipe(item, building, rate))
      }
      if (item.ProduceFrom) {
        const building = itemNameMap[item.ProduceFrom]
        const defaultProductionRates: Record<number, number> = {
          1121: 0,
          1208: 1,
          2207: 1
        }
        const rate = defaultProductionRates[item.ID]
        if (rate) {
          recipes.push(new MiningRecipe(item, building, rate))
        }
      }
      if (recipes.length) {
        miningMap[it.ID] = recipes
      }
    })
    return miningMap
  }

  readonly AllItems: Item[];
  readonly AllVeins: Vein[];
  readonly AllRecipes: Recipe[];
  readonly ItemMap: Record<number, Item>;
  readonly ItemNameMap: Record<string, Item>;
  readonly VeinMap: Record<number, Vein>;
  readonly VeinItemMap: Record<number, Vein>;
  readonly RecipeMap: Record<number, Recipe>;
  readonly RecipeItemMap: Record<number, Recipe[]>;
  readonly StringMaps: Record<string, Record<string, string>>;
  readonly RecipeTypesMap: Record<number, Item[]>;
  readonly MiningMap: Record<number, MiningRecipe[]>;

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
