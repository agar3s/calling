
const SCALE = 2
const WIDTH = 16
const MODES = {
  TALK: 0,
  MELEE: 1,
  RANGED: 2
}

const COLORS = [0x002266, 0x660022, 0x226600]
export default class Cursor {
  constructor (config) {
    this.show = false
    this.position = {i: 0, j: 0}
    this.x = 0
    this.y = 0

    this.square = config.scene.add.graphics(0, 0)
    this.range = 1
    this.anchor = {i: 0, j: 0}
    this.MODES = MODES
    this.mode = MODES.MELEE
  }

  hide () {
    this.square.clear()
  }

  draw () {
    let i = this.position.i
    let j = this.position.j
    this.square.clear()
    this.square.lineStyle(1, COLORS[this.mode], 1)
    this.square.strokeRect(i*SCALE*WIDTH + 1 - SCALE*WIDTH/2, j*SCALE*WIDTH + 1 - SCALE*WIDTH/2, SCALE*WIDTH - 2, SCALE*WIDTH - 2)
  }

  setRange (range) {
    this.range = range
  }

  setPosition (i, j) {
    this.position.i = i
    if(this.position.i > (this.anchor.i + this.range)){
      this.position.i = this.anchor.i + this.range
    }
    if(this.position.i < (this.anchor.i - this.range)){
      this.position.i = this.anchor.i - this.range
    }
    this.position.j = j
    if(this.position.j > (this.anchor.j + this.range)){
      this.position.j = this.anchor.j + this.range
    }
    if(this.position.j < (this.anchor.j - this.range)){
      this.position.j = this.anchor.j - this.range
    }
    this.draw()
  }

  move(i, j) {
    this.setPosition(this.position.i + i, this.position.j + j)
  }

  setAnchor (i, j, range, mode) {
    this.setRange(range)
    this.anchor.i = i
    this.anchor.j = j
    this.setPosition(i, j)
    this.mode = mode
    this.draw()
  }

  isTalkMode () {
    return this.mode === MODES.TALK
  }

  isMeleeMode () {
    return this.mode === MODES.MELEE
  }

  isRangedMode () {
    return this.mode === MODES.RANGED
  }

}