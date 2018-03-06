import Character from './character'
const SCALE = 2
const WIDTH = 16


export default class Player extends Character{
  constructor (config) {
    super(config)

    this.grid = config.scene.add.graphics(0,0)
    this.grid.lineStyle(0x220022, 1)
    this.grid.fillStyle(0x220022, 0.2)
    this.grid.beginPath()
    for (var j = 0; j < 50; j++) {
      for (var i = 0; i < 50; i++) {
        this.grid.fillRect(i*SCALE*WIDTH+1 + SCALE*WIDTH/2, j*SCALE*WIDTH+1 + SCALE*WIDTH/2, SCALE*WIDTH-2, SCALE*WIDTH-2)
      }
    }
    this.grid.closePath()
  }


  enableTime (transitionTime, factor) {
    super.enableTime(transitionTime, factor)
    this.sprite.anims.play('flying-red', true)
  }


}