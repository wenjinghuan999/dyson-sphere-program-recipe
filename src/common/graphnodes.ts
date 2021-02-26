import { LiteGraph, LGraphNode, IWidget, widgetTypes, LGraphCanvas } from 'litegraph.js'
import { Item, Recipe } from '@/common/product'
import { DataLoader, tr } from '@/common/dataloader'

class NodeSlot {
  item: number;
  align: number;
  index: number;
  img: HTMLImageElement | null;

  constructor (item: number, align: number, index: number) {
    this.item = item
    this.align = align
    this.index = index
    this.img = null
  }
}

class BuildingWidget implements IWidget<string, { values: string[] }> {
  name: string = tr('Building');
  value: string;
  type: widgetTypes = 'combo';
  options: { values: string[] };
  items: Item[];
  customCallback: ((item: Item) => void) | null;

  constructor (value: string, options: { values: string[] }, items: Item[], customCallback: ((item: Item) => void) | null = null) {
    this.value = value
    this.options = options
    this.items = items
    this.customCallback = customCallback
  }

  computeSize (width: number): [number, number] {
    return [width, LiteGraph.NODE_WIDGET_HEIGHT + LiteGraph.NODE_SLOT_HEIGHT + 4]
  }

  callback (value: string, graphCanvas: LGraphCanvas, node: LGraphNode, pos: [number, number], event?: MouseEvent) {
    if (this.customCallback) {
      const idx = this.options.values.indexOf(value)
      if (this.items[idx]) {
        this.customCallback(this.items[idx])
      }
    }
  }
}

class RecipeNode extends LGraphNode {
  slots: NodeSlot[] = [];
  numInputs = 0;
  recipe: Recipe;
  building: BuildingWidget;

  constructor (recipe: Recipe) {
    super()
    this.recipe = recipe
    recipe.Items.forEach((itemId, index) => {
      const item = DataLoader.getInstance().ItemMap[itemId]
      this.addInput('', 'number')
      const slotId = this.slots.length
      this.slots.push(new NodeSlot(item.ID, -1, index))
      import(`@/assets/${item.IconPath}.png`).then((module) => {
        this.loadImages(slotId, module.default)
      })
    })
    this.numInputs = this.slots.length
    recipe.Results.forEach((itemId, index) => {
      const item = DataLoader.getInstance().ItemMap[itemId]
      this.addOutput('', 'number')
      const slotId = this.slots.length
      this.slots.push(new NodeSlot(item.ID, 1, index))
      import(`@/assets/${item.IconPath}.png`).then((module) => {
        this.loadImages(slotId, module.default)
      })
    })
    {
      const slotId = this.slots.length
      const items = DataLoader.getInstance().RecipeTypesMap[this.recipe.Type]
      const values = items.map(v => tr(v.Name))
      const defaultItem = this.recipe.Type === 4 ? items[1] : items[0]
      this.slots.push(new NodeSlot(defaultItem.ID, 0, (Math.max(recipe.Items.length, recipe.Results.length) + 1)))
      this.building = new BuildingWidget(tr(defaultItem.Name), { values: values }, items, (item: Item) => {
        import(`@/assets/${item.IconPath}.png`).then((module) => {
          this.loadImages(slotId, module.default)
        })
      })
      this.addCustomWidget(this.building)
      import(`@/assets/${defaultItem.IconPath}.png`).then((module) => {
        this.loadImages(slotId, module.default)
      })
    }

    this.title = tr(recipe.Name)
  }

  onDrawForeground (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (!this.flags.collapsed) {
      this.slots.forEach((slot) => {
        if (slot.img) {
          if (slot.align === -1) {
            ctx.drawImage(slot.img, 23, LiteGraph.NODE_SLOT_HEIGHT * slot.index + 6, 32, 32)
          } else if (slot.align === 1) {
            ctx.drawImage(slot.img, this.size[0] - 54, LiteGraph.NODE_SLOT_HEIGHT * slot.index + 6, 32, 32)
          } else {
            ctx.drawImage(slot.img, this.size[0] / 2 - 16, LiteGraph.NODE_SLOT_HEIGHT * slot.index + 6, 32, 32)
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

  computeSize (): [number, number] {
    const size = super.computeSize()
    const margin = 4
    function computeTextSize (text: string): number {
      if (!text) {
        return 0
      }
      return LiteGraph.NODE_TEXT_SIZE * text.length * 0.6
    }
    if (this.building) {
      size[0] = Math.max(size[0], computeTextSize(this.building.name) + margin + computeTextSize(this.building.value))
    }
    return size
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
