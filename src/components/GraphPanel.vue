<template>
  <div id='main-canvas-container'
    :class="isFullscreen ? 'vh-100' : 'fluid m-0 p-0'">
    <canvas id='maincanvas'
      style='background-color: #fff'
      :style="isFullscreen ? 'position: fixed; left: 0; top: 0' : ''">
    </canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Mixins from '@/common/mixin'
import { LiteGraph, LGraph, LGraphCanvas } from 'litegraph.js'
import { PipelineCanvas, RecipeNode } from '@/common/graphnodes'
import { Planner, PlannerNode } from '@/common/planner'
import { Options } from '@/common/options'
import { DataLoader } from '@/common/dataloader'
import 'litegraph.js/css/litegraph.css'

@Component({
  mixins: [Mixins],
  components: {
  }
})
export default class GraphPanel extends Vue {
  @Prop() planner!: Planner;
  @Prop() options!: Options;
  @Prop() shown!: boolean;
  private graph = new LGraph();
  private canvas: LGraphCanvas | null = null;
  private graphNodes: RecipeNode[] = [];

  static DefaultWidth = 1024
  static DefaultHeight = 720
  static START_Y = 100
  static MARGIN_X = 200
  static MARGIN_Y = 50

  private isFullscreen = false
  private lastMouseClick = 0

  constructor () {
    super()

    for (const key in LiteGraph.registered_node_types) {
      LiteGraph.unregisterNodeType(key)
    }

    for (const recipeId in DataLoader.getInstance().RecipeMap) {
      RecipeNode.CreateRecipeNodeType(DataLoader.getInstance().RecipeMap[recipeId])
    }

    LiteGraph.NODE_SLOT_HEIGHT = 32
  }

  mounted () {
    // Call this function after mounted
    this.canvas = new LGraphCanvas('#maincanvas', this.graph)
    this.canvas.onMouse = this.onMouse
    this.canvas.renderLink = PipelineCanvas.prototype.renderCutsomLink as unknown as typeof LGraphCanvas.prototype.renderLink
    /* eslint-disable @typescript-eslint/camelcase */
    this.canvas.connections_width = 4
    // this.canvas.links_render_mode = LiteGraph.STRAIGHT_LINK
    /* eslint-enable @typescript-eslint/camelcase */
    window.onresize = this.onResize
    this.onResize()
    this.createGraph()
    this.onResize()
  }

  @Watch('shown')
  onResize () {
    if (this.canvas) {
      let width = GraphPanel.DefaultWidth
      let height = GraphPanel.DefaultHeight
      if (this.isFullscreen) {
        width = window.innerWidth
        height = window.innerHeight
      } else {
        const container = document.getElementById('main-canvas-container')
        if (container) {
          width = container.offsetWidth
        }
      }
      this.canvas.ds.reset()
      this.canvas.resize(width, height)
      this.graph.setDirtyCanvas(true, true)
      this.centerizeGraph()
    }
  }

  @Watch('planner')
  @Watch('options')
  onPlannerChanged () {
    this.createGraph()
  }

  createGraph () {
    if (this.graph) {
      // reset status
      this.graph.clear()
      this.graphNodes = []
      const unit = this.options.unit

      this.planner.nodes.forEach((node) => {
        if (!node.recipe) {
          this.graphNodes.push(LiteGraph.createNode(''))
        } else {
          const key = RecipeNode.GetRecipeNodeTypeName(node.recipe)
          const graphNode = LiteGraph.createNode(key) as RecipeNode
          graphNode.updateAmount(node.amount)

          node.products.forEach((product) => {
            const idx = graphNode.findOutputSlotById(product.item.ID)
            if (idx >= 0) {
              graphNode.outputs[idx].label = product.getReadableValue(unit) + '         '
              graphNode.slots[graphNode.numInputs + idx].amount = product.amount
            }
          })

          node.requires.forEach((require) => {
            const idx = graphNode.findInputSlotById(require.item.ID)
            if (idx >= 0) {
              graphNode.inputs[idx].label = '         ' + require.getReadableValue(unit)
              graphNode.slots[idx].amount = require.amount
            }
          })

          graphNode.size = graphNode.computeSize()

          this.graph.add(graphNode)
          this.graphNodes.push(graphNode)
        }
      })

      const stack = [this.planner.targetNode]
      while (stack.length) {
        const node = stack.pop()
        if (!node) { break }
        const idx = this.planner.nodes.indexOf(node)
        const graphNode = this.graphNodes[idx]

        node.inputs.forEach((input) => {
          if (input.from) {
            const idx2 = this.planner.nodes.indexOf(input.from)
            const fromGraphNode = this.graphNodes[idx2]
            if (graphNode && fromGraphNode) {
              const fromSlot = fromGraphNode.findOutputSlotById(input.product.item.ID)
              const toSlot = graphNode.findInputSlotById(input.product.item.ID)
              if (fromSlot >= 0 && toSlot >= 0) {
                fromGraphNode.connect(fromSlot, graphNode, toSlot)
              }
            }
            stack.push(input.from)
          }
        })
      }

      this.rearrange()
    }
  }

  rearrange () {
    if (this.options.graphViewMode === 'Sparse') {
      this.rearrangeSparse()
    } else {
      this.rearrangeCompact()
    }
  }

  sortGraphNodes (): [PlannerNode, number][][] {
    const sortedColumns: [PlannerNode, number][][] = []
    const usedNodes = new Map<number, number>() // used node index and to which column it belongs
    let lastColumn: [PlannerNode, number][] = [[this.planner.targetNode, -1]]
    while (lastColumn.length) {
      let column: [PlannerNode, number][] = []
      // add inputs for last column to this column
      lastColumn.forEach(([node]) => {
        if (!node) { return }

        node.inputs.forEach((input) => {
          if (!input.from) { return }

          const fromIdx = this.planner.nodes.indexOf(input.from)
          if (fromIdx >= 0 && (column.find(v => v[1] === fromIdx) === undefined)) {
            const usedColumn = usedNodes.get(fromIdx)
            // remove node from previous column if used
            if (usedColumn !== undefined && usedColumn < sortedColumns.length) {
              const usedColIdx = sortedColumns[usedColumn].findIndex(v => v[1] === fromIdx)
              if (usedColIdx >= 0) {
                sortedColumns[usedColumn].splice(usedColIdx, 1)
              }
            }
            column.push([input.from, fromIdx])
            usedNodes.set(fromIdx, sortedColumns.length)
          }
        })
      })

      // if any of the nodes has successive node in the same column, remove it
      column = column.filter(([node, idx]) => {
        if (!node || !node.recipe || idx < 0) { return false }
        for (const output of node.outputs) {
          if (output.to && column.find(v => v[0] === output.to)) {
            return false
          }
        }
        return true
      })

      sortedColumns.push(column)
      lastColumn = column
    }

    return sortedColumns
  }

  getAlignedY (graphNode: RecipeNode): number {
    let resultY = Number.POSITIVE_INFINITY
    const outSlot = graphNode.findFirstConnectedOutputSlot()
    if (outSlot < 0) { return resultY }
    const item = graphNode.slots[graphNode.numInputs + outSlot].item
    graphNode.getOutputNodes(outSlot).forEach((outGraphNode) => {
      const inputSlot = (outGraphNode as RecipeNode).slots.find(s => s.item === item)?.index || 0
      const y = outGraphNode.pos[1] + LiteGraph.NODE_SLOT_HEIGHT * (inputSlot - outSlot)
      resultY = Math.min(resultY, y)
    })
    return resultY
  }

  rearrangeSparse () {
    const sortedColumns = this.sortGraphNodes()
    const START_X = this.canvas?.canvas.width || GraphPanel.DefaultWidth

    let x = START_X
    let y = GraphPanel.START_Y
    for (let columnIdx = 0; columnIdx < sortedColumns.length; ++columnIdx) {
      const column = sortedColumns[columnIdx]
      if (columnIdx > 0) {
        // sort this column again based on last column
        column.sort(([, idx1], [, idx2]) => {
          return this.getAlignedY(this.graphNodes[idx1]) - this.getAlignedY(this.graphNodes[idx2])
        })
      }

      // calculate maximum width
      let maxWidth = 0
      column.forEach(([, idx]) => {
        const graphNode = this.graphNodes[idx]
        maxWidth = Math.max(maxWidth, graphNode.size[0])
      })
      x -= maxWidth + GraphPanel.MARGIN_X
      y = GraphPanel.START_Y
      // set position for each node
      column.forEach(([, idx]) => {
        const graphNode = this.graphNodes[idx]
        const alignY = this.getAlignedY(graphNode)
        if (alignY < Number.POSITIVE_INFINITY) {
          y = Math.max(y, alignY)
        }
        graphNode.pos = [x, y]
        graphNode.size = [maxWidth, graphNode.size[1]]
        y += graphNode.size[1] + GraphPanel.MARGIN_Y
      })
    }

    this.centerizeGraph()
  }

  rearrangeCompact () {
    const sortedColumns = this.sortGraphNodes()
    const START_X = this.canvas?.canvas.width || GraphPanel.DefaultWidth

    let x = START_X
    let y = GraphPanel.START_Y
    for (let columnIdx = 0; columnIdx < sortedColumns.length; ++columnIdx) {
      const column = sortedColumns[columnIdx]
      if (columnIdx > 0) {
        // sort this column again based on last column
        column.sort(([, idx1], [, idx2]) => {
          return this.getAlignedY(this.graphNodes[idx1]) - this.getAlignedY(this.graphNodes[idx2])
        })
      }

      // calculate maximum width
      let maxWidth = 0
      column.forEach(([, idx]) => {
        const graphNode = this.graphNodes[idx]
        maxWidth = Math.max(maxWidth, graphNode.size[0])
      })
      x -= maxWidth + GraphPanel.MARGIN_X
      y = GraphPanel.START_Y
      // set position for each node
      column.forEach(([, idx]) => {
        const graphNode = this.graphNodes[idx]
        graphNode.pos = [x, y]
        graphNode.size = [maxWidth, graphNode.size[1]]
        y += graphNode.size[1] + GraphPanel.MARGIN_Y
      })
    }

    this.centerizeGraph()
  }

  centerizeGraph () {
    // centerize items if there's space
    const width = this.canvas?.canvas.width || GraphPanel.DefaultWidth
    const height = this.canvas?.canvas.height || GraphPanel.DefaultHeight
    const bounds = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0, 0]
    for (const graphNode of this.graphNodes) {
      bounds[0] = Math.min(bounds[0], graphNode.pos[0])
      bounds[1] = Math.min(bounds[1], graphNode.pos[1])
      bounds[2] = Math.max(bounds[2], graphNode.pos[0] + graphNode.size[0])
      bounds[3] = Math.max(bounds[3], graphNode.pos[1] + graphNode.size[1])
    }

    if (bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) {
      return
    }

    const offsetX = width - Math.max((width - (bounds[2] - bounds[0])) / 2, GraphPanel.MARGIN_X) - bounds[2]
    const offsetY = Math.max((height - (bounds[3] - bounds[1])) / 2, GraphPanel.START_Y) - bounds[1]

    for (const graphNode of this.graphNodes) {
      graphNode.pos[0] += offsetX
      graphNode.pos[1] += offsetY
    }

    this.graph.setDirtyCanvas(true, true)
  }

  onMouse (e: MouseEvent): boolean {
    if (!this.canvas) { return false }
    type CanvasMouseEvent = MouseEvent & { canvasX: number; canvasY: number }
    this.canvas.adjustMouseEvent(e)
    const ea = e as CanvasMouseEvent
    const node = this.graph.getNodeOnPos(
      ea.canvasX, ea.canvasY,
      this.canvas.visible_nodes,
      5
    )
    if (node) { return false }
    if (e.button === 0) {
      const now = LiteGraph.getTime()
      const isDoubleClick = now - this.lastMouseClick < 300
      if (isDoubleClick) {
        this.toggleFullscreen()
        return true
      }
      this.lastMouseClick = now
    }
    return false
  }

  toggleFullscreen () {
    this.isFullscreen = !this.isFullscreen
    this.onResize()
  }
}
</script>
