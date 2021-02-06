import itemsJson from '../assets/items.json'

class Item {
  readonly id: number;
  readonly name: string;
  readonly icon: string;

  static readonly Empty = new Item()

  constructor (
    id = -1,
    name = '',
    icon = 'Placeholder.png'
  ) {
    this.id = id
    this.name = name
    this.icon = icon
  }
}

class CraftableItem extends Item {
  readonly recipes: Array<Recipe>;

  static readonly Empty = new CraftableItem()

  constructor (
    id = -1,
    name = '',
    icon = 'Placeholder.png',
    recipes: Array<Recipe> = []
  ) {
    super(id, name, icon)
    this.recipes = recipes
  }
}

class Building extends CraftableItem {
  readonly craftRecipes: Array<Recipe>;

  static readonly Empty = new Building()

  constructor (
    id = -1,
    name = '',
    icon = 'Placeholder.png',
    recipes: Array<Recipe> = [],
    craftRecipes: Array<Recipe> = []
  ) {
    super(id, name, icon, recipes)
    this.craftRecipes = craftRecipes
  }
}

class Recipe {
  readonly src: Array<Item>;
  readonly dst: Array<Item>;
  readonly factory: Building;
  readonly speed: number;

  static readonly Empty = new Recipe()

  constructor (
    src: Array<Item> = [],
    dst: Array<Item> = [],
    factory: Building = Building.Empty,
    speed = 0
  ) {
    this.src = src
    this.dst = dst
    this.factory = factory
    this.speed = speed
  }
}

class Product extends Item {
  readonly recipes: Array<Recipe>;

  static readonly Empty = new Product()

  constructor (
    id = -1,
    name = '',
    icon = 'Placeholder.png',
    recipes: Array<Recipe> = []
  ) {
    super(id, name, icon)
    this.recipes = recipes
  }
}

class RecipeTable {
  private static instance: RecipeTable;

  private constructor () {
    this.AllItems = itemsJson
    this.AllCraftableItems = []
    this.AllBuildings = []
    this.AllRecipes = []
    this.AllProducts = []

    console.log(this)
  }

  public static getInstance (): RecipeTable {
    if (!RecipeTable.instance) {
      RecipeTable.instance = new RecipeTable()
    }
    return RecipeTable.instance
  }

  readonly AllItems: Array<Item>;
  readonly AllCraftableItems: Array<CraftableItem>;
  readonly AllBuildings: Array<Building>;
  readonly AllRecipes: Array<Recipe>;
  readonly AllProducts: Array<Product>;
}

export {
  Item, CraftableItem, Building, Recipe, Product, RecipeTable
}
