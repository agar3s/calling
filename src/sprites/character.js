import Attributes from './attributes'

const SCALE = 2
const WIDTH = 16

export default class Character {
  constructor (config) {
    let scene = config.scene
    let x = config.x
    let y = config.y
    this.sprite = scene.add.sprite(x-WIDTH*SCALE*0.5, y-WIDTH*SCALE*0.5, 'characters')
    this.sprite.setOrigin(0.5, 0.5)

    this.positionIndex = {i: 0, j: 0}
    this.speed = {x: 0, y: 0}
    this.acceleration = {x: 0, y: 0}

    this.fixPositionToGrid()

    this.timeFromTransition = 0
    this.fixedTimeForTransition = 0
    this.attributes = new Attributes({})
  }

  update (dt) {
    if(!dt) {
      dt = this.fixedTimeForTransition - this.timeFromTransition
      console.log(dt)
    }
    this.timeFromTransition += dt
    this.speed.y += this.acceleration.y * dt
    this.sprite.x +=  this.speed.x*dt
    this.sprite.y +=  this.speed.y*dt
  }

  jump (transitionTime) {
    // vy = (h2 - h1) / t
    let desiredHigh = 2
    let gravityDistance = 3
    let yDistance = (-desiredHigh - gravityDistance/2)*WIDTH*SCALE
    this.speed.y = yDistance/transitionTime
  }

  down (transitionTime) {
    this.speed.y = 0
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
    this.timeFromTransition = 0
    this.fixedTimeForTransition = transitionTime
  }

  fixPositionToGrid () {
    let ts = WIDTH * SCALE
    let xIndex = ~~(this.sprite.x/ts)
    let yIndex = ~~(this.sprite.y/ts)
    this.positionIndex.i = (this.sprite.x - (xIndex*ts)) > (ts/2)? (xIndex + 1): xIndex
    this.positionIndex.j = (this.sprite.y - (yIndex*ts)) > (ts/2)? (yIndex + 1): yIndex

    this.sprite.x = this.positionIndex.i*ts
    this.sprite.y = this.positionIndex.j*ts
  }

  disableTime () {
   // if (this.sprite.body.velocity.y === 0) {
   //   this.sprite.anims.play('idle-red')
   // }
    this.fixPositionToGrid()
    this.speed.x = 0
    this.speed.y = 0
    this.acceleration.y = 0
    this.sprite.update()
  }

}