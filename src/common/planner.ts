import { Product, Recipe } from '@/common/product'
import { DataLoader } from '@/common/dataloader'

class PlannerNode {
  readonly targets: Array<Product>;
  recipe: Recipe | null;
  amount;
  products: Array<Product> = [];
  requires: Array<Product> = [];
  inputs: Array<Product> = [];
  children: Array<PlannerNode> = [];
  dirty = false;

  constructor (recipe: Recipe | null, amount = -1, targets: Array<Product> = []) {
    this.recipe = recipe
    if (amount >= 0) {
      this.amount = amount
      this.targets = PlannerNode.GetProducts(this)
    } else {
      this.targets = targets
      this.amount = PlannerNode.GetAmount(this)
    }

    PlannerNode.UpdateNode(this)
  }

  get optionalRecipes () {
    return PlannerNode.GetOptionalRecipes(this.targets)
  }

  addChild (child: PlannerNode) {
    this.children.push(child)
    PlannerNode.UpdateNode(this)
  }

  static UpdateNode (node: PlannerNode) {
    if (node.recipe === null) {
      return
    }
    node.products = PlannerNode.GetProducts(node)
    node.requires = PlannerNode.GetRequires(node)
    node.inputs = PlannerNode.GetInputs(node)
  }

  static GetAmount (node: PlannerNode): number {
    let amount = 0
    const recipe = node.recipe
    if (recipe) {
      node.targets.forEach((product) => {
        amount = Math.max(amount, product.amount / Recipe.amountOf(recipe, product.item.ID))
      })
    }
    return amount
  }

  static GetProducts (node: PlannerNode): Array<Product> {
    const products: Array<Product> = []
    const recipe = node.recipe
    if (recipe && node.amount > 0) {
      for (let i = 0; i < recipe.Results.length; ++i) {
        products.push(new Product(
          DataLoader.getInstance().ItemMap[recipe.Results[i]],
          node.amount * Recipe.amountOfByResultIdx(recipe, i)
        ))
      }
    }
    return products
  }

  static GetRequires (node: PlannerNode): Array<Product> {
    const requires: Array<Product> = []
    const recipe = node.recipe
    if (recipe && node.amount > 0) {
      for (let i = 0; i < recipe.Items.length; ++i) {
        requires.push(new Product(
          DataLoader.getInstance().ItemMap[recipe.Items[i]],
          node.amount * Recipe.amountOfByInputIdx(recipe, i)
        ))
      }
    }
    return requires
  }

  static GetInputs (node: PlannerNode): Array<Product> {
    const inputs: Array<Product> = []
    node.requires.forEach((product) => {
      inputs.push(new Product(product.item, product.amount))
    })
    node.children.forEach((child) => {
      child.products.forEach((product) => {
        inputs.push(new Product(product.item, -product.amount))
      })
    })
    return Product.SimplifyProducts(inputs)
  }

  static GetOptionalRecipes (targets: Array<Product>): Array<Recipe> {
    if (targets.length === 0) {
      return []
    }
    let recipes = DataLoader.getInstance().RecipeMap[targets[0].item.ID]
    for (let i = 1; i < targets.length && recipes && recipes.length > 0; ++i) {
      recipes = recipes.filter((recipe) => {
        return recipe.Results.indexOf(targets[i].item.ID) >= 0
      })
    }
    if (!recipes) {
      return []
    } else {
      return recipes
    }
  }
}

class Planner {
  targets: Array<Product>;
  nodes: Array<PlannerNode>;
  root: PlannerNode;

  products: Array<Product> = [];
  inputs: Array<Product> = [];

  constructor (targets: Array<Product>) {
    this.targets = targets
    this.root = new PlannerNode(null, -1, targets)
    this.nodes = []

    let remaining = Product.SimplifyProducts(targets)
    let inputs: Array<Product> = []

    while (remaining.length > 0) {
      remaining.sort((product1, product2) => {
        if (product1.amount < 0) {
          return -product1.amount
        } else if (product2.amount < 0) {
          return product2.amount
        }
        return PlannerNode.GetOptionalRecipes([product1]).length - PlannerNode.GetOptionalRecipes([product2]).length
      })

      if (remaining.every(product => product.amount < 0)) {
        break
      }

      const product = remaining.shift()
      if (product) {
        const recipes = PlannerNode.GetOptionalRecipes([product])
        if (recipes.length === 0) {
          inputs.push(product)
          inputs = Product.SimplifyProducts(inputs)
        } else {
          const node = new PlannerNode(recipes[0], -1, [product])
          this.nodes.push(node)
          node.products.forEach((product) => {
            remaining.push(new Product(product.item, -product.amount))
          })
          node.requires.forEach((product) => {
            remaining.push(new Product(product.item, product.amount))
          })
          remaining = Product.SimplifyProducts(remaining)
        }
      }
    }

    Planner.UpdateProductsAndInputs(this)
  }

  static UpdateProductsAndInputs (planner: Planner) {
    planner.products = []
    planner.inputs = []
    const stack: Array<PlannerNode> = []
    stack.push(planner.root)
    while (stack.length > 0) {
      const node = stack.pop()
      if (node) {
        planner.products = planner.products.concat(node.products)
        planner.inputs = planner.inputs.concat(node.inputs)
        node.children.forEach((child) => {
          stack.push(child)
        })
      }
    }
    planner.products = Product.SimplifyProducts(planner.products)
    planner.inputs = Product.SimplifyProducts(planner.inputs)
  }
}

export {
  Planner
}
