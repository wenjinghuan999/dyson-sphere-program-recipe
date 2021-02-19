<template>
  <b-container>
    <canvas id='maincanvas' width='1024' height='720' style='border: 1px solid'></canvas>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Mixins from '@/common/mixin'
import { LiteGraph, LGraph, LGraphCanvas, LGraphNode } from 'litegraph.js'
import tempIcon from '@/assets/Icons/Vein/iron-vein.png'

@Component({
  mixins: [Mixins],
  components: {
  }
})
export default class GraphPanel extends Vue {
  private graph: LGraph | null = null;
  private canvas: LGraphCanvas | null = null;

  constructor () {
    super()

    class RecipeNode extends LGraphNode {
      img: HTMLImageElement | null = null;

      constructor () {
        super()

        this.addInput('        1/s', 'number')
        this.addInput('        1/s', 'number')
        this.addOutput('1/s         ', 'number')

        this.title = 'Recipe'
      }

      onDrawForeground (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        this.loadImages(tempIcon)
        if (this.img) {
          ctx.drawImage(this.img, 22, 6, 32, 32)
          ctx.drawImage(this.img, 22, LiteGraph.NODE_SLOT_HEIGHT + 6, 32, 32)
          ctx.drawImage(this.img, this.size[0] - 54, 6, 32, 32)
        }
      }

      loadImages (url: string, func: ((_: RecipeNode) => void) | null = null) {
        if (!url) {
          this.img = null
          return
        }

        this.img = document.createElement('img')

        this.img.src = url
        this.boxcolor = '#F95'
        this.img.onload = () => {
          if (func) {
            func(this)
          }
          this.boxcolor = '#9F9'
          this.setDirtyCanvas(true, false)
        }
        this.img.onerror = function () {
          console.log('error loading the image: ' + url)
        }
      }
    }

    LiteGraph.registerNodeType('dsp/recipe', RecipeNode)
  }

  mounted () {
    this.createGraph()
  }

  createGraph () {
    // Call this function after mounted
    LiteGraph.NODE_SLOT_HEIGHT = 32

    this.graph = new LGraph()

    this.canvas = new LGraphCanvas('#maincanvas', this.graph)

    const nodeMine = LiteGraph.createNode('dsp/recipe')
    nodeMine.pos = [200, 200]
    this.graph.add(nodeMine)
  }
}
</script>
