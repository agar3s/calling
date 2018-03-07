
const SCALE = 2
const WIDTH = 16
export default class Target {
  constructor (config) {
    this.show = false
    this.positionIndex = {i: 0, j: 0}
    this.x = 0
    this.y = 0

    this.square = config.scene.add.graphics(0, 0)
    this.range = 1
    this.anchor = {i: 0, j: 0}
  }

  hideTarget () {
    this.square.clear()
  }

  draw () {
    let i = this.positionIndex.i
    let j = this.positionIndex.j
    this.square.clear()
    this.square.lineStyle(1, 0x660022, 1)
    this.square.strokeRect(i*SCALE*WIDTH + 1 - SCALE*WIDTH/2, j*SCALE*WIDTH + 1 - SCALE*WIDTH/2, SCALE*WIDTH - 2, SCALE*WIDTH - 2)
  }

  setRange (range) {
    this.range = range
  }

  setPosition (i, j) {
    this.positionIndex.i = i
    this.positionIndex.j = j
    this.draw()
  }

  move(i, j) {
    this.setPosition(this.positionIndex.i + i, this.positionIndex.j + j)
  }

  setAnchor (i, j) {
    this.anchor.i = i
    this.anchor.j = j
    this.setPosition(i, j)
  }

}