const SCALE = 2
const WIDTH = 16
export default class Player {
  constructor (config) {
    let scene = config.scene
    let x = config.x
    let y = config.y
    this.sprite = scene.add.sprite(x-WIDTH*SCALE*0.5, y-WIDTH*SCALE*0.5, 'characters')
    this.sprite.setOrigin(0.5, 0.5)
    this.sprite.setScale(SCALE).play('idle-red')
    this.speed = {x: 0, y: 0}
    this.acceleration = {x: 0, y: 0}
    this.fixPositionToGrid()

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
    this.timeFromTransition = 0
    this.fixedTimeForTransition = 0 
  }

  update (dt) {
    if(!dt) {
      dt = this.fixedTimeForTransition - this.timeFromTransition
    }
    this.timeFromTransition += dt
    this.speed.y += this.acceleration.y * dt
    this.sprite.x +=  this.speed.x*dt
    this.sprite.y +=  this.speed.y*dt
  }

  jump (transitionTime) {
    // vy = (h2 - h1) / t
    let desiredHigh = 1
    let gravityDistance = 2
    let yDistance = (-desiredHigh - gravityDistance)*WIDTH*SCALE
    this.speed.y = yDistance/transitionTime
  }

  down (transitionTime) {
    //this.speed.y = WIDTH*SCALE/transitionTime
    this.speed.y = 0
    
    console.log(this.acceleration.y)
  }

  turnLeft (transitionTime) {
    this.sprite.setScale(-1*(SCALE), SCALE)
    this.speed.x = -WIDTH*SCALE/transitionTime
  }

  turnRight (transitionTime) {
    this.sprite.setScale((SCALE), SCALE)
    this.speed.x = WIDTH*SCALE/transitionTime
  }

  enableTime (transitionTime, factor) {
    this.acceleration.y = WIDTH*SCALE*3/(transitionTime*transitionTime)
    this.fixPositionToGrid()
    this.sprite.anims.play('flying-red', true)
    this.timeFromTransition = 0
    this.fixedTimeForTransition = transitionTime
  }

  fixPositionToGrid () {
    let ts = WIDTH*SCALE
    let xIndex = ~~(this.sprite.x/ts)
    let yIndex = ~~(this.sprite.y/ts)
    let x = (this.sprite.x - (xIndex*ts)) > (ts/2)? (xIndex + 1): xIndex
    let y = (this.sprite.y - (yIndex*ts)) > (ts/2)? (yIndex + 1): yIndex
    this.sprite.x = x*ts
    this.sprite.y = y*ts
  }

  disableTime () {
   // if (this.sprite.body.velocity.y === 0) {
   //   this.sprite.anims.play('idle-red')
   // }
    console.log('pre', this.sprite.y)
    console.log('speed y', this.speed.y)
    console.log('totalTime', this.timeFromTransition)
    this.fixPositionToGrid()
    console.log('pos', this.sprite.y)
    this.speed.x = 0
    this.speed.y = 0
    this.acceleration.y = 0
    this.sprite.update()
  }


}