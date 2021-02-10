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
}

export {
  Item, Recipe, Product
}
