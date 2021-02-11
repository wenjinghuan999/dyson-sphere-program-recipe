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

  static amountOf (recipe: Recipe, itemId: number): number {
    const resultIdx = recipe.Results.findIndex((value) => {
      return value === itemId
    })
    if (resultIdx >= 0) {
      return recipe.ResultCounts[resultIdx] * 60 / recipe.TimeSpend
    }
    const inputIdx = recipe.Results.findIndex((value) => {
      return value === itemId
    })
    if (inputIdx >= 0) {
      return recipe.ResultCounts[inputIdx] * 60 / recipe.TimeSpend
    }
    return 0
  }

  static amountOfByResultIdx (recipe: Recipe, resultIdx: number): number {
    return recipe.ResultCounts[resultIdx] * 60 / recipe.TimeSpend
  }

  static amountOfByInputIdx (recipe: Recipe, inputIdx: number): number {
    return recipe.ItemCounts[inputIdx] * 60 / recipe.TimeSpend
  }
}

class Product {
  item: Item;
  amount = 0;

  constructor (
    item: Item = Item.Empty,
    amount = 0
  ) {
    this.item = item
    this.amount = amount
  }

  static readonly Empty = new Product()

  get isValid (): boolean {
    return this.item !== Item.Empty
  }

  get icon (): string {
    return this.isValid ? this.item.IconPath : 'Icons/placeholder'
  }

  get name (): string {
    return this.isValid ? this.item.Name : ''
  }

  static SimplifyProducts (products: Array<Product>): Array<Product> {
    const newProducts: Array<Product> = []
    products.forEach((product) => {
      if (product.isValid && product.amount > 0) {
        const idx = newProducts.findIndex((p) => {
          return p.item.ID === product.item.ID
        })
        if (idx >= 0) {
          newProducts[idx].amount += product.amount
        } else {
          newProducts.push(new Product(product.item, product.amount))
        }
      }
    })
    return newProducts.filter((product) => {
      return product.amount !== 0
    })
  }
}

export {
  Item, Recipe, Product
}
