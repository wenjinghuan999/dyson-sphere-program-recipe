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
  readonly Items: number[] = [];
  readonly ItemCounts: number[] = [];
  readonly Results: number[] = [];
  readonly ResultCounts: number[] = [];
  readonly GridIndex: number = 0;
  readonly IconPath: string = 'Icons/placeholder';
  readonly Description: string = '';

  static readonly Empty = new Recipe()

  static amountOfInResults (recipe: Recipe, itemId: number): number {
    const resultIdx = recipe.Results.findIndex((value) => {
      return value === itemId
    })
    if (resultIdx >= 0) {
      return this.amountOfByResultIdx(recipe, resultIdx)
    }
    return 0
  }

  static amountOfInInputs (recipe: Recipe, itemId: number): number {
    const inputIdx = recipe.Results.findIndex((value) => {
      return value === itemId
    })
    if (inputIdx >= 0) {
      return this.amountOfByInputIdx(recipe, inputIdx)
    }
    return 0
  }

  static netAmountOfInResults (recipe: Recipe, itemId: number): number {
    const resultIdx = recipe.Results.findIndex((value) => {
      return value === itemId
    })
    if (resultIdx >= 0) {
      return this.netAmountOfByResultIdx(recipe, resultIdx)
    }
    return 0
  }

  static netAmountOfInInputs (recipe: Recipe, itemId: number): number {
    const inputIdx = recipe.Results.findIndex((value) => {
      return value === itemId
    })
    if (inputIdx >= 0) {
      return this.netAmountOfByInputIdx(recipe, inputIdx)
    }
    return 0
  }

  static amountOfByResultIdx (recipe: Recipe, resultIdx: number): number {
    return recipe.ResultCounts[resultIdx] * 60 / recipe.TimeSpend
  }

  static amountOfByInputIdx (recipe: Recipe, inputIdx: number): number {
    return recipe.ItemCounts[inputIdx] * 60 / recipe.TimeSpend
  }

  static netAmountOfByResultIdx (recipe: Recipe, resultIdx: number): number {
    const inputIdx = recipe.Items.indexOf(recipe.Results[resultIdx])
    let amount = recipe.ResultCounts[resultIdx]
    if (inputIdx >= 0) {
      amount -= recipe.ItemCounts[inputIdx]
    }
    if (amount <= 0) {
      return 0
    }
    return amount * 60 / recipe.TimeSpend
  }

  static netAmountOfByInputIdx (recipe: Recipe, inputIdx: number): number {
    const resultIdx = recipe.Results.indexOf(recipe.Items[inputIdx])
    let amount = recipe.ItemCounts[inputIdx]
    if (resultIdx >= 0) {
      amount -= recipe.ResultCounts[resultIdx]
    }
    if (amount <= 0) {
      return 0
    }
    return amount * 60 / recipe.TimeSpend
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

  static SimplifyProducts (products: Product[]): Product[] {
    const newProducts: Product[] = []
    products.forEach((product) => {
      if (product.isValid && product.amount !== 0) {
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

  static Neg (products: Product[]): Product[] {
    return products.map(product => new Product(product.item, -product.amount))
  }
}

export {
  Item, Recipe, Product
}
