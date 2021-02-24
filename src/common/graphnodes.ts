import { LiteGraph, LGraphNode } from 'litegraph.js'
import { Recipe } from '@/common/product'
import { DataLoader, tr } from '@/common/dataloader'

class NodeSlot {
  item: number;
  isInput: boolean;
  index: number;
  img: HTMLImageElement | null;

  constructor (item: number, isInput: boolean, index: number) {
    this.item = item
    this.isInput = isInput
    this.index = index
    this.img = null
  }
}

class RecipeNode extends LGraphNode {
  slots: NodeSlot[] = [];
  numInputs = 0;
  recipe: Recipe;

  constructor (recipe: Recipe) {
    super()
    this.recipe = recipe

    recipe.Items.forEach((itemId, index) => {
      const item = DataLoader.getInstance().ItemMap[itemId]
      this.addInput('', 'number')
      const slotId = this.slots.length
      this.slots.push(new NodeSlot(item.ID, true, index))
      import(`@/assets/${item.IconPath}.png`).then((module) => {
        this.loadImages(slotId, module.default)
      })
    })
    this.numInputs = this.slots.length
    recipe.Results.forEach((itemId, index) => {
      const item = DataLoader.getInstance().ItemMap[itemId]
      this.addOutput('', 'number')
      const slotId = this.slots.length
      this.slots.push(new NodeSlot(item.ID, false, index))
      import(`@/assets/${item.IconPath}.png`).then((module) => {
        this.loadImages(slotId, module.default)
      })
    })

    this.title = tr(recipe.Name)
  }

  onDrawForeground (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (!this.flags.collapsed) {
      this.slots.forEach((slot) => {
        if (slot.img) {
          if (slot.isInput) {
            ctx.drawImage(slot.img, 23, LiteGraph.NODE_SLOT_HEIGHT * slot.index + 6, 32, 32)
          } else {
            ctx.drawImage(slot.img, this.size[0] - 54, LiteGraph.NODE_SLOT_HEIGHT * slot.index + 6, 32, 32)
          }
        }
      })
    }
  }

  loadImages (slotId: number, url: string) {
    if (!url || slotId < 0 || slotId >= this.slots.length) {
      return
    }
    const img = document.createElement('img')
    img.src = url
    this.boxcolor = '#F95'
    img.onload = () => {
      this.boxcolor = '#9F9'
      this.setDirtyCanvas(true, false)
    }
    img.onerror = function () {
      console.log('error loading the image: ' + url)
    }
    this.slots[slotId].img = img
  }

  findInputSlotById (item: number): number {
    for (let i = 0; i < this.numInputs; ++i) {
      if (item === this.slots[i].item) {
        return i
      }
    }
    return -1
  }

  findOutputSlotById (item: number): number {
    for (let i = this.numInputs; i < this.slots.length; ++i) {
      if (item === this.slots[i].item) {
        return i - this.numInputs
      }
    }
    return -1
  }

  static createRecipeNodeType (recipe: Recipe | null) {
    if (recipe) {
      const key = recipe.Name
      if (!(key in LiteGraph.registered_node_types)) {
        const NewRecipeNode = class extends RecipeNode {
          constructor () {
            super(recipe as Recipe)
          }
        }
        LiteGraph.registerNodeType(key, NewRecipeNode)
      }
    } else {
      LiteGraph.registerNodeType('', LGraphNode)
    }
  }
}

export {
  RecipeNode
}
