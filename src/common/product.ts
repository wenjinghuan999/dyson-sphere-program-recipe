import { Item, tr } from './dataloader'

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
    return this.isValid ? tr(this.item.Name) : ''
  }
}

export {
  Product
}
