import { Product, Recipe } from '@/common/product'
import { DataLoader } from '@/common/dataloader'

class PlannerEdge {
  product: Product;
  from: PlannerNode | null;
  to: PlannerNode | null;

  constructor (product: Product) {
    this.product = new Product(product.item, product.amount)
    this.from = null
    this.to = null
  }
}

class PlannerNode {
  targets: Product[];
  recipe: Recipe | null;
  amount: number;
  products: Product[] = [];
  requires: Product[] = [];

  inputs: PlannerEdge[] = [];
  outputs: PlannerEdge[] = [];
  provides: Product[] = [];
  sideProducts: Product[] = [];

  constructor (recipe: Recipe | null, amount = -1, targets: Product[] = []) {
    this.recipe = recipe
    if (amount >= 0) {
      this.amount = amount
      this.targets = PlannerNode.GetProducts(this)
    } else {
      this.targets = targets
      this.amount = PlannerNode.GetAmount(this)
    }

    this.products = PlannerNode.GetProducts(this)
    this.requires = PlannerNode.GetRequires(this)
    this.provides = PlannerNode.GetProvides(this)
    this.sideProducts = PlannerNode.GetSideProducts(this)
  }

  get optionalRecipes () {
    return PlannerNode.GetOptionalRecipes(this.targets)
  }

  addOutput (edge: PlannerEdge) {
    const oldEdge = this.outputs.find((e) => {
      return e.from === this && e.to === edge.to && e.product.item.ID === edge.product.item.ID
    })
    if (oldEdge) {
      oldEdge.product.amount += edge.product.amount
    } else {
      this.outputs.push(edge)
      edge.from = this
    }
    this.sideProducts = PlannerNode.GetSideProducts(this)
  }

  addInput (edge: PlannerEdge) {
    const oldEdge = this.inputs.find((e) => {
      return e.from === edge.from && e.to === this && e.product.item.ID === edge.product.item.ID
    })
    if (oldEdge) {
      oldEdge.product.amount += edge.product.amount
    } else {
      this.inputs.push(edge)
      edge.to = this
    }
    this.provides = PlannerNode.GetProvides(this)
  }

  removeUnusedOutputs () {
    this.outputs = this.outputs.filter(output => output.to)
    this.sideProducts = PlannerNode.GetSideProducts(this)
  }

  removeUnusedInputs () {
    this.inputs = this.inputs.filter(input => input.from)
    this.provides = PlannerNode.GetProvides(this)
  }

  static GetAmount (node: PlannerNode): number {
    let amount = 0
    const recipe = node.recipe
    if (recipe) {
      node.targets.forEach((product) => {
        const amountInRecipe = Recipe.netAmountOfInResults(recipe, product.item.ID)
        if (amountInRecipe > 0) {
          amount = Math.max(amount, product.amount / amountInRecipe)
        }
      })
    }
    return amount
  }

  static GetProducts (node: PlannerNode): Product[] {
    const products: Product[] = []
    const recipe = node.recipe
    if (recipe && node.amount > 0) {
      for (let i = 0; i < recipe.Results.length; ++i) {
        const amountInRecipe = Recipe.netAmountOfByResultIdx(recipe, i)
        if (amountInRecipe > 0) {
          products.push(new Product(
            DataLoader.getInstance().ItemMap[recipe.Results[i]],
            node.amount * amountInRecipe
          ))
        }
      }
    }
    return products
  }

  static GetRequires (node: PlannerNode): Product[] {
    const requires: Product[] = []
    const recipe = node.recipe
    if (recipe && node.amount > 0) {
      for (let i = 0; i < recipe.Items.length; ++i) {
        const amountInRecipe = Recipe.netAmountOfByInputIdx(recipe, i)
        if (amountInRecipe > 0) {
          requires.push(new Product(
            DataLoader.getInstance().ItemMap[recipe.Items[i]],
            node.amount * amountInRecipe
          ))
        }
      }
    }
    return requires
  }

  static GetProvides (node: PlannerNode): Product[] {
    const provides: Product[] = []
    node.requires.forEach((product) => {
      provides.push(new Product(product.item, product.amount))
    })
    node.inputs.forEach((input) => {
      provides.push(new Product(input.product.item, -input.product.amount))
    })
    return Product.SimplifyProducts(provides)
  }

  static GetSideProducts (node: PlannerNode): Product[] {
    const sideProducts: Product[] = []
    node.products.forEach((product) => {
      sideProducts.push(new Product(product.item, product.amount))
    })
    node.outputs.forEach((output) => {
      sideProducts.push(new Product(output.product.item, -output.product.amount))
    })
    return Product.SimplifyProducts(sideProducts)
  }

  static GetOptionalRecipes (targets: Product[]): Recipe[] {
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
  targets: Product[];
  nodes: PlannerNode[];
  outputs: PlannerEdge[];

  sideProducts: Product[] = [];
  provides: Product[] = [];

  constructor (targets: Product[]) {
    this.targets = targets
    this.nodes = []
    this.outputs = []

    const remaining: PlannerEdge[] = []
    targets.forEach((product) => {
      remaining.push(new PlannerEdge(product))
    })
    const nodeMap: Map<number, PlannerNode> = new Map()

    while (remaining.length > 0) {
      remaining.sort((edge1, edge2) => {
        if (edge1.product.amount < 0) {
          return -edge1.product.amount
        } else if (edge2.product.amount < 0) {
          return edge2.product.amount
        }
        return PlannerNode.GetOptionalRecipes([edge1.product]).length -
          PlannerNode.GetOptionalRecipes([edge2.product]).length
      })

      const edge = remaining.shift()
      if (!edge) { break } // redundant

      const recipes = PlannerNode.GetOptionalRecipes([edge.product])
      if (recipes.length === 0) {
        // No recipe, must provide
        continue
      }

      const recipe = recipes[0]

      const oldNode = nodeMap.get(recipe.ID)
      if (oldNode) {
        Planner.AddOutputs(oldNode, [edge])
      } else {
        // New node
        const node = new PlannerNode(recipe, -1, [new Product(edge.product.item, edge.product.amount)])
        node.addOutput(edge)
        this.nodes.push(node)
        nodeMap.set(recipe.ID, node)
        node.requires.forEach((product) => {
          const newEdge = new PlannerEdge(product)
          node.addInput(newEdge)
          remaining.push(newEdge)
        })
      }
    }

    this.nodes.forEach(node => node.removeUnusedInputs())

    Planner.UpdateProvidesAndSideProducts(this)
  }

  static UpdateProvidesAndSideProducts (planner: Planner) {
    planner.nodes.forEach((node) => {
      node.provides.forEach((product) => {
        planner.provides.push(product)
      })
      node.sideProducts.forEach((product) => {
        planner.sideProducts.push(product)
      })
    })
    planner.provides = Product.SimplifyProducts(planner.provides)
    planner.sideProducts = Product.SimplifyProducts(planner.sideProducts)
  }

  static AddOutputs (node: PlannerNode, edges: PlannerEdge[]) {
    // Add new edges to existing node's output, assuming recipe not changed
    let dirtyEdges: [PlannerEdge, number][] = [] // [edge, amount to add]
    edges.forEach((edge) => {
      dirtyEdges.push([edge, edge.product.amount])
      edge.product.amount = 0
      node.addOutput(edge)
    })
    while (dirtyEdges.length) {
      // Select edges from the same node
      const firstEdge = dirtyEdges[0][0]
      const node = firstEdge.from
      const nodeEdges = dirtyEdges.filter(([e]) => e.from === node)
      dirtyEdges = dirtyEdges.filter(([e]) => e.from !== node)
      if (!node) {
        nodeEdges.forEach(([e, a]) => {
          e.product.amount += a
        })
        continue
      }

      // Calculate new targets
      let addTargets: Product[] = []
      nodeEdges.forEach(([e, a]) => {
        addTargets.push(new Product(e.product.item, a))
        e.product.amount += a
      })
      addTargets = Product.SimplifyProducts(addTargets)

      node.targets = Product.SimplifyProducts(node.targets.concat(addTargets))
      node.amount = PlannerNode.GetAmount(node)
      node.products = PlannerNode.GetProducts(node)
      node.sideProducts = PlannerNode.GetSideProducts(node)

      let addRequires = Product.Neg(node.requires)
      node.requires = PlannerNode.GetRequires(node)
      addRequires = Product.SimplifyProducts(addRequires.concat(node.requires))

      node.inputs.forEach((input) => {
        const addRequire = addRequires.find(product => product.item.ID === input.product.item.ID)
        if (addRequire) {
          dirtyEdges.push([input, addRequire.amount])
        }
      })

      node.provides = PlannerNode.GetProvides(node)
    }
  }
}

export {
  Planner
}
