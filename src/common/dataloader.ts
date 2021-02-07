import itemsJson from '../assets/prototypes/items.json'
import recipesJson from '../assets/prototypes/recipes.json'

class Item {
  readonly Name: string = 'None';
  readonly ID: number = 0;
  readonly MiningFrom: string = '';
  readonly IconPath: string = 'Icons/placeholder';
  readonly GridIndex: number = 0;
  readonly Description: string = '';

  static readonly Empty = new Item()
}

class Recipe {
  readonly Name: string = 'None';
  readonly ID: number = 0;
  readonly SID: number = 0;
  readonly TimeSpend: number = 0;
  readonly Items: Array<number> = [];
  readonly ItemCounts: Array<number> = [];
  readonly Results: Array<number> = [];
  readonly ResultCounts: Array<number> = [];
  readonly GridIndex: number = 0;
  readonly IconPath: string = 'Icons/placeholder';
  readonly Description: string = '';

  static readonly Empty = new Recipe()
}

class DataLoader {
  private static instance: DataLoader;

  private constructor () {
    this.AllItems = itemsJson
    this.AllRecipes = recipesJson

    console.log(this)
  }

  public static getInstance (): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader()
    }
    return DataLoader.instance
  }

  readonly AllItems: Array<Item>;
  readonly AllRecipes: Array<Recipe>;
}

export {
  Item, Recipe, DataLoader
}
