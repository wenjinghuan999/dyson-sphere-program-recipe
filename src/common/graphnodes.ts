import { LiteGraph, LGraphNode, IWidget, widgetTypes, LGraphCanvas, Vector2, LLink } from 'litegraph.js'
import { Item, Entity, Recipe } from '@/common/product'
import { DataLoader, tr } from '@/common/dataloader'

class NodeSlot {
  item: number;
  align: number;
  index: number;
  amount: number;
  img: HTMLImageElement | null;

  constructor (item: number, align: number, index: number) {
    this.item = item
    this.align = align
    this.index = index
    this.amount = 0
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
    return [width, LiteGraph.NODE_WIDGET_HEIGHT + LiteGraph.NODE_SLOT_HEIGHT + 8]
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
  amount = 0;
  speedFactor = 1;
  buildingItems: Item[];
  building: BuildingWidget;

  constructor (recipe: Recipe) {
    super()
    this.recipe = recipe
    recipe.Items.forEach((itemId, index) => {
      const item = DataLoader.getInstance().ItemMap[itemId]
      this.addInput('', item.Name)
      const slotId = this.slots.length
      this.slots.push(new NodeSlot(item.ID, -1, index))
      import(`@/assets/${item.IconPath}.png`).then((module) => {
        this.loadImages(slotId, module.default)
      })
    })
    this.numInputs = this.slots.length
    recipe.Results.forEach((itemId, index) => {
      const item = DataLoader.getInstance().ItemMap[itemId]
      this.addOutput('', item.Name)
      const slotId = this.slots.length
      this.slots.push(new NodeSlot(item.ID, 1, index))
      import(`@/assets/${item.IconPath}.png`).then((module) => {
        this.loadImages(slotId, module.default)
      })
    })
    {
      const slotId = this.slots.length
      this.buildingItems = DataLoader.getInstance().RecipeTypesMap[this.recipe.Type]
      const values = this.buildingItems.map(v => tr(v.Name))
      const defaultItem = this.recipe.Type === 4 ? this.buildingItems[1] : this.buildingItems[0]
      this.slots.push(new NodeSlot(defaultItem.ID, 0, (Math.max(recipe.Items.length, recipe.Results.length) + 1)))
      this.building = new BuildingWidget(tr(defaultItem.Name), { values: values }, this.buildingItems, (building: Item) => {
        if (building.ID === 2303) {
          this.speedFactor = 0.75
        } else if (building.ID === 2305) {
          this.speedFactor = 1.5
        } else {
          this.speedFactor = 1
        }
        this.updateProperties()
        import(`@/assets/${building.IconPath}.png`).then((module) => {
          this.loadImages(slotId, module.default)
        })
      })
      this.addCustomWidget(this.building)
      import(`@/assets/${defaultItem.IconPath}.png`).then((module) => {
        this.loadImages(slotId, module.default)
      })
    }
    this.addProperty('buildings', 0, 'number')
    this.addWidget('number', 'x', this.numBuildings, (value: number) => {
      this.numBuildings = value
    }, { min: 0, max: 100, precision: 1, step: 10, property: 'buildings' })

    this.title = tr(recipe.Name)
  }

  updateAmount (amount: number) {
    this.amount = amount
    this.updateProperties()
  }

  updateProperties () {
    // @ts-expect-error
    this.setProperty('buildings', this.numBuildings)
  }

  get numBuildings () {
    return this.amount / this.speedFactor
  }

  set numBuildings (value: number) {
    if (value < 0) {
      return
    }
    this.updateAmount(value * this.speedFactor)
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
            ctx.drawImage(slot.img, this.size[0] / 3 - 16, LiteGraph.NODE_SLOT_HEIGHT * slot.index + 6, 32, 32)
          }
        }
      })
      const text = this.getEnergyText()
      if (text) {
        const pos = [this.size[0] / 2 + 8, LiteGraph.NODE_SLOT_HEIGHT * (this.slots.length - 0.5) + 6]
        ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR
        ctx.fillText(text, pos[0] + 4, pos[1] + 4)
      }
    }
  }

  getEnergyText (): string {
    if (this.buildingItems) {
      const building = this.buildingItems.find(b => tr(b.Name) === this.building.value)
      if (building !== undefined) {
        const entity = DataLoader.getInstance().EntityMap[building.ID]
        if (entity !== undefined) {
          const energy = entity.workEnergyPerTick * this.numBuildings
          return Entity.getEnergyText(Entity.getEnergy(entity, this.numBuildings))
        }
      }
    }
    return ''
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

  findFirstConnectedOutputSlot (): number {
    for (let i = this.numInputs; i < this.slots.length; ++i) {
      const outputNodes = this.getOutputNodes(i - this.numInputs)
      if (outputNodes?.length) {
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

  static GetRecipeNodeTypeName (recipe: Recipe | null): string {
    if (recipe) {
      const typeStr = DataLoader.getInstance().RecipeTypesNameMap[recipe.Type]
      if (typeStr) {
        return tr(typeStr) + '/' + tr(recipe.Name)
      }
    }
    return ''
  }

  static CreateRecipeNodeType (recipe: Recipe | null) {
    if (recipe) {
      const key = this.GetRecipeNodeTypeName(recipe)
      if (!(key in LiteGraph.registered_node_types)) {
        const NewRecipeNode = class extends RecipeNode {
          constructor () {
            super(recipe as Recipe)
          }
        }
        NewRecipeNode.title = tr(recipe.Name)
        LiteGraph.registerNodeType(key, NewRecipeNode)
      }
    } else {
      LiteGraph.registerNodeType('', LGraphNode)
    }
  }
}

class PipelineCanvas extends LGraphCanvas {
  static belt1 = new Image();
  static belt2 = new Image();
  static belt3 = new Image();
  private static _initializer = (() => {
    import('@/assets/Icons/Belt/belt-1.png').then((module) => {
      PipelineCanvas.belt1.src = module.default
    })
    import('@/assets/Icons/Belt/belt-2.png').then((module) => {
      PipelineCanvas.belt2.src = module.default
    })
    import('@/assets/Icons/Belt/belt-3.png').then((module) => {
      PipelineCanvas.belt3.src = module.default
    })
  })()

  renderCutsomLink (
    ctx: CanvasRenderingContext2D,
    a: Vector2,
    b: Vector2,
    link: LLink,
    skipBorder: boolean,
    flow: boolean,
    color?: string | undefined,
    startDir?: number | undefined,
    endDir?: number | undefined,
    numSublines?: number | undefined
  ) {
    if (link) {
      this.visible_links.push(link)
    }

    // choose color
    if (!color && link) {
      color = LGraphCanvas.link_type_colors[link.type]
    }
    if (!color) {
      color = this.default_link_color
    }
    if (link != null && this.highlighted_links[link.id]) {
      color = '#FFF'
    }

    startDir = startDir || LiteGraph.RIGHT
    endDir = endDir || LiteGraph.LEFT

    const dist = Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]))

    if (this.render_connections_border && this.ds.scale > 0.6) {
      ctx.lineWidth = this.connections_width + 4
    }
    ctx.lineJoin = 'round'
    numSublines = numSublines || 1
    if (numSublines > 1) {
      ctx.lineWidth = 0.5
    }

    // begin line shape
    ctx.beginPath()
    for (let i = 0; i < numSublines; i += 1) {
      const offsety = (i - (numSublines - 1) * 0.5) * 5

      if (this.links_render_mode === LiteGraph.SPLINE_LINK) {
        ctx.moveTo(a[0], a[1] + offsety)
        let startOffsetX = 0
        let startOffsetY = 0
        let endOffsetX = 0
        let endOffsetY = 0
        switch (startDir) {
          case LiteGraph.LEFT:
            startOffsetX = dist * -0.25
            break
          case LiteGraph.RIGHT:
            startOffsetX = dist * 0.25
            break
          case LiteGraph.UP:
            startOffsetY = dist * -0.25
            break
          case LiteGraph.DOWN:
            startOffsetY = dist * 0.25
            break
        }
        switch (endDir) {
          case LiteGraph.LEFT:
            endOffsetX = dist * -0.25
            break
          case LiteGraph.RIGHT:
            endOffsetX = dist * 0.25
            break
          case LiteGraph.UP:
            endOffsetY = dist * -0.25
            break
          case LiteGraph.DOWN:
            endOffsetY = dist * 0.25
            break
        }
        ctx.bezierCurveTo(
          a[0] + startOffsetX,
          a[1] + startOffsetY + offsety,
          b[0] + endOffsetX,
          b[1] + endOffsetY + offsety,
          b[0],
          b[1] + offsety
        )
      } else if (this.links_render_mode === LiteGraph.LINEAR_LINK) {
        ctx.moveTo(a[0], a[1] + offsety)
        let startOffsetX = 0
        let startOffsetY = 0
        let endOffsetX = 0
        let endOffsetY = 0
        switch (startDir) {
          case LiteGraph.LEFT:
            startOffsetX = -1
            break
          case LiteGraph.RIGHT:
            startOffsetX = 1
            break
          case LiteGraph.UP:
            startOffsetY = -1
            break
          case LiteGraph.DOWN:
            startOffsetY = 1
            break
        }
        switch (endDir) {
          case LiteGraph.LEFT:
            endOffsetX = -1
            break
          case LiteGraph.RIGHT:
            endOffsetX = 1
            break
          case LiteGraph.UP:
            endOffsetY = -1
            break
          case LiteGraph.DOWN:
            endOffsetY = 1
            break
        }
        const l = 15
        ctx.lineTo(
          a[0] + startOffsetX * l,
          a[1] + startOffsetY * l + offsety
        )
        ctx.lineTo(
          b[0] + endOffsetX * l,
          b[1] + endOffsetY * l + offsety
        )
        ctx.lineTo(b[0], b[1] + offsety)
      } else if (this.links_render_mode === LiteGraph.STRAIGHT_LINK) {
        ctx.moveTo(a[0], a[1])
        let startX = a[0]
        let startY = a[1]
        let endX = b[0]
        let endY = b[1]
        if (startDir === LiteGraph.RIGHT) {
          startX += 10
        } else {
          startY += 10
        }
        if (endDir === LiteGraph.LEFT) {
          endX -= 10
        } else {
          endY -= 10
        }
        ctx.lineTo(startX, startY)
        ctx.lineTo((startX + endX) * 0.5, startY)
        ctx.lineTo((startX + endX) * 0.5, endY)
        ctx.lineTo(endX, endY)
        ctx.lineTo(b[0], b[1])
      } else {
        return
      } // unknown
    }

    // rendering the outline of the connection can be a little bit slow
    if (
      this.render_connections_border &&
      this.ds.scale > 0.6 &&
      !skipBorder
    ) {
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      if (link && this.highlighted_links[link.id]) {
        ctx.strokeStyle = '#FFF'
      }
      ctx.stroke()
    }

    ctx.lineWidth = this.connections_width

    let pattern = ctx.createPattern(PipelineCanvas.belt1, 'repeat')
    const linkTarget = this.graph.getNodeById(link?.target_id)
    if (linkTarget) {
      const slotIdx = linkTarget.inputs.findIndex(i => i.link === link.id)
      const slot = (linkTarget as RecipeNode).slots[slotIdx]
      if (slot.amount > 12) {
        pattern = ctx.createPattern(PipelineCanvas.belt3, 'repeat')
      } else if (slot.amount > 6) {
        pattern = ctx.createPattern(PipelineCanvas.belt2, 'repeat')
      }
    }
    if (pattern) {
      ctx.fillStyle = ctx.strokeStyle = pattern
    } else {
      ctx.fillStyle = ctx.strokeStyle = '#AAA'
    }
    ctx.stroke()
    // end line shape

    // render arrow in the middle
    if (
      this.ds.scale >= 0.6 &&
      this.highquality_render &&
      endDir !== LiteGraph.CENTER
    ) {
      // render arrow
      if (this.render_connection_arrows) {
        // compute two points in the connection
        const posA = this.computeConnectionPoint(
          a,
          b,
          0.25,
          startDir,
          endDir
        ) as unknown as [number, number]
        const posB = this.computeConnectionPoint(
          a,
          b,
          0.26,
          startDir,
          endDir
        ) as unknown as [number, number]
        const posC = this.computeConnectionPoint(
          a,
          b,
          0.75,
          startDir,
          endDir
        ) as unknown as [number, number]
        const posD = this.computeConnectionPoint(
          a,
          b,
          0.76,
          startDir,
          endDir
        ) as unknown as [number, number]

        // compute the angle between them so the arrow points in the right direction
        let angleA = 0
        let angleB = 0
        if (this.render_curved_connections) {
          angleA = -Math.atan2(posB[0] - posA[0], posB[1] - posA[1])
          angleB = -Math.atan2(posD[0] - posC[0], posD[1] - posC[1])
        } else {
          angleB = angleA = b[1] > a[1] ? 0 : Math.PI
        }

        // render arrow
        ctx.save()
        ctx.translate(posA[0], posA[1])
        ctx.rotate(angleA)
        ctx.beginPath()
        ctx.moveTo(-5, -3)
        ctx.lineTo(0, +7)
        ctx.lineTo(+5, -3)
        ctx.fill()
        ctx.restore()
        ctx.save()
        ctx.translate(posC[0], posC[1])
        ctx.rotate(angleB)
        ctx.beginPath()
        ctx.moveTo(-5, -3)
        ctx.lineTo(0, +7)
        ctx.lineTo(+5, -3)
        ctx.fill()
        ctx.restore()
      }
    }
  }
}

export {
  RecipeNode, PipelineCanvas
}
