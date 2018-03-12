const SCALE = 2
const WIDTH = 16
let TS = SCALE*WIDTH

export default class Projectil {
  constructor (config) {
    let scene = config.scene
    this.sprite = scene.add.sprite(0, 0, 'arrow')
    this.sprite.setOrigin(0.5, 0.5)

    this.xOffset = config.xOffset
    this.yOffset = config.yOffset

    this.sprite.x = config.origin.i * TS + config.xOffset
    this.sprite.y = config.origin.j * TS + config.yOffset
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

    this.maxPosition = {i: config.max.i, j: config.max.j}

    this.damage = config.damage
    this.launcher = config.launcher

    //DEBUG
    //this.location = config.scene.add.graphics(0, 0)
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
    let arrowX = this.sprite.x+this.speed.x*TS*0.35 - this.xOffset
    let arrowY = this.sprite.y+this.speed.y*TS*0.35 - this.yOffset
    this.position.i = Math.round(arrowX/TS)
    this.position.j = Math.round(arrowY/TS)
    // check arrow outside 
    this.checkOutsideBounds()
    if (this.hit) return

    let tileCenter = {
      x: this.position.i*TS,
      y: this.position.j*TS
    }
    let v = new Phaser.Math.Vector2(
          arrowX-tileCenter.x,
          arrowY-tileCenter.y
    )
    let distance = v.length()
    this.hit = distance < TS*0.4
    
    /*this.location.clear()
    this.location.fillStyle(this.hit?0x994433:0x449933, 0.2)
    this.location.fillRect((this.position.i)*TS, (this.position.j)*TS, TS, TS)
    console.log(this.position)
    */
    
  }

  checkOutsideBounds () {
    if (this.position.i < 0) {
      this.position.i = 0
      this.hit = true
    }
    
    if (this.position.j < 0) {
      this.position.j = 0
      this.hit = true
    }

    if (this.maxPosition.i > this.maxPosition.i) {
      this.position.i = this.maxPosition.i
      this.hit = true
    }

    if(this.maxPosition.j > this.maxPosition.j) {
      this.position.j = this.maxPosition.j
      this.hit = true
    }
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
      hit: this.damage,
      type: 'ranged',
      speed: 5
    }
  }
  
  destroy () {
    this.sprite.destroy()
    //this.location.destroy()
  }
}