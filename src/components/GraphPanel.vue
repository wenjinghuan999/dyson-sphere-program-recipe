<template>
  <b-container>
    <canvas id='maincanvas' width='1024' height='720'></canvas>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Mixins from '@/common/mixin'
import { LiteGraph, LGraph, LGraphCanvas } from 'litegraph.js'
import { RecipeNode } from '@/common/graphnodes'
import { Planner, PlannerNode } from '@/common/planner'
import { DataLoader } from '@/common/dataloader'
import 'litegraph.js/css/litegraph.css'

@Component({
  mixins: [Mixins],
  components: {
  }
})
export default class GraphPanel extends Vue {
  @Prop() planner!: Planner;
  private graph = new LGraph();
  private canvas: LGraphCanvas | null = null;
  private graphNodes: RecipeNode[] = [];

  constructor () {
    super()

    for (const key in LiteGraph.registered_node_types) {
      LiteGraph.unregisterNodeType(key)
    }

    for (const recipeId in DataLoader.getInstance().RecipeMap) {
      RecipeNode.createRecipeNodeType(DataLoader.getInstance().RecipeMap[recipeId])
    }

    LiteGraph.NODE_SLOT_HEIGHT = 32
  }

  mounted () {
    // Call this function after mounted
    this.canvas = new LGraphCanvas('#maincanvas', this.graph)
    this.createGraph()
  }

  @Watch('planner')
  onPlannerChanged () {
    this.createGraph()
  }

  createGraph () {
    if (this.graph) {
      // reset status
      this.graph.clear()
      this.graphNodes = []

      this.planner.nodes.forEach((node) => {
        if (!node.recipe) {
          this.graphNodes.push(LiteGraph.createNode(''))
        } else {
          const graphNode = LiteGraph.createNode(node.recipe.Name) as RecipeNode

          node.products.forEach((product) => {
            const idx = graphNode.findOutputSlotById(product.item.ID)
            if (idx >= 0) {
              graphNode.outputs[idx].label = product.amount + '/s         '
            }
          })

          node.requires.forEach((require) => {
            const idx = graphNode.findInputSlotById(require.item.ID)
            if (idx >= 0) {
              graphNode.inputs[idx].label = '         ' + require.amount + '/s'
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
    // sort graph nodes
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

    const START_X = 1024
    const START_Y = 100
    const MARGIN_X = 100
    const MARGIN_Y = 50

    let x = START_X
    let y = START_Y
    for (const column of sortedColumns) {
      // calculate maximum width
      let maxWidth = 0
      column.forEach(([, idx]) => {
        const graphNode = this.graphNodes[idx]
        maxWidth = Math.max(maxWidth, graphNode.size[0])
      })
      x -= maxWidth + MARGIN_X
      y = START_Y
      // set position for each node
      column.forEach(([, idx]) => {
        const graphNode = this.graphNodes[idx]
        graphNode.pos = [x, y]
        graphNode.size = [maxWidth, graphNode.size[1]]
        y += graphNode.size[1] + MARGIN_Y
      })
    }
    this.graph.setDirtyCanvas(true, true)
  }
}
</script>
