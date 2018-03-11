const SCALE = 2
const WIDTH = 16
let TS = SCALE*WIDTH

export default class Projectil {
  constructor (config) {
    let scene = config.scene
    this.sprite = scene.add.sprite(0, 0, 'arrow')
    this.sprite.setOrigin(0.5, 0.5)

    this.sprite.x = config.origin.i * TS
    this.sprite.y = config.origin.j * TS
    this.sprite.setScale(SCALE)
    this.target = {i: config.target.i, j: config.target.j}
    this.origin = {i: config.origin.i, j: config.origin.j}

    this.speed = new Phaser.Math.Vector2(
      this.target.i - this.origin.i,
      this.target.j - this.origin.j
    )
    this.speed.normalize()
    this.sprite.setRotation(this.speed.angle())

    this.cellsByTurn = config.cellsByTurn
    this.baseSpeed = this.cellsByTurn*TS / config.timeToTransition

    this.timeFromResume = 0
    this.timesChecked = 0
    this.timeToCheck = config.timeToTransition/(this.cellsByTurn + 1)

    this.position = {i: this.origin.i, j: this.origin.j}

    //DEBUG
    this.location = config.scene.add.graphics(0, 0)
  }

  update (dt) {
    this.sprite.x += this.speed.x*dt*this.baseSpeed
    this.sprite.y += this.speed.y*dt*this.baseSpeed

    this.timeFromResume += dt
    if (this.timesChecked*this.timeToCheck < this.timeFromResume) {
      this.timesChecked += 1
      this.checkMe = true
      this.updatePosition()
    }
  }

  updatePosition () {
    let arrowX = this.sprite.x+this.speed.x*TS*0.35
    let arrowY = this.sprite.y+this.speed.y*TS*0.35
    this.position.i = Math.round(arrowX/TS)
    this.position.j = Math.round(arrowY/TS)
    let tileCenter = {
      x: this.position.i*TS,
      y: this.position.j*TS
    }
    let v = new Phaser.Math.Vector2(
          arrowX-tileCenter.x,
          arrowY-tileCenter.y
    )
    let distance = v.length()
    
    this.location.clear()
    this.hit = distance < TS*0.4
    this.location.fillStyle(this.hit?0x994433:0x449933, 0.2)
    this.location.fillRect((this.position.i-0.5)*TS, (this.position.j-0.5)*TS, TS, TS)    
  }

  resumeTime () {
    this.timesChecked = 0
    this.timeFromResume = 0
  }

  pauseTime () {
    //this.updatePosition()
  }

  doCheckCollision () {
    let check = this.checkMe && this.hit
    this.checkMe = false
    return check
  }

  getAttackData () {
    return {
      hit: 2,
      type: 'ranged'
    }
  }
  
  destroy () {
    this.sprite.destroy()
    this.location.destroy()
  }
}