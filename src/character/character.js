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
    this.position = {i: 0, j: 0}
    this.speed = {x: 0, y: 0}
    this.acceleration = {x: 0, y: 0}

    this.fixPositionToGrid()
    this.previousPosition = {i: this.position.i, j: this.position.j}

    this.timeFromTransition = 0
    this.fixedTimeForTransition = 0
    this.attrs = new Attributes({dexterity: 5})
    this.skills = []
    this.animations = config.animations
    this.sprite.setScale(SCALE).play(this.animations.idle)
    this.actionRange = 1

    this.type = 'character'
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

  applyJumpSpeed (transitionTime) {
    // vy = (h2 - h1) / t
    let gravityDistance = 3
    let yDistance = (-gravityDistance/2)*WIDTH*SCALE
    this.speed.y = yDistance/transitionTime
    
    this.fall(transitionTime, 1)
  }

  applyLateralSpeed (transitionTime, surrondings, direction) {
    this.sprite.setScale(direction*(SCALE), SCALE)
    let center = this.actionRange
    let steps = 1
    let c = surrondings[center][center + direction]
    let d = surrondings[center + 1][center + direction]
    let e = surrondings[center + 1][center]
    c = c && c.rigid
    d = d && d.rigid
    e = e && e.rigid
    if (!c) {
      this.speed.x = direction*WIDTH*SCALE*steps/transitionTime
    }
    if ((!c&&!d) || (c&&!e)) {
      this.fall(transitionTime, 1)
      // if fall can't jump again
      this.attrs.high = 0
    } else {
      this.attrs.restoreHigh()
    }

  }

  jump (transitionTime, surrondings) {
    let center = this.actionRange
    let steps = 1
    let a = surrondings[center - 1][center]
    let e = surrondings[center + 1][center]
    a = a && a.rigid
    e = e && e.rigid
    if (e) {
      this.attrs.restoreHigh()
    }
    let canJump = (this.attrs.high--) > 0

    if (!a && canJump) {
      this.applyJumpSpeed(transitionTime)
    }
  }

  down (transitionTime) {
    this.speed.y = 0
  }

  turnLeft (transitionTime, surrondings) {
    this.applyLateralSpeed(transitionTime, surrondings, -1)
  }

  turnRight (transitionTime, surrondings) {
    this.applyLateralSpeed(transitionTime, surrondings, 1)
  }

  applyJumpLateral (transitionTime, surrondings, direction) {
    this.sprite.setScale(direction*(SCALE), SCALE)
    let center = this.actionRange
    let steps = 1
    let a = surrondings[center - 1][center]
    let b = surrondings[center - 1][center + direction]
    let e = surrondings[center + 1][center]
    a = a && a.rigid
    b = b && b.rigid
    e = e && e.rigid
    if (e) {
      this.attrs.restoreHigh()
    }
    let canJump = (this.attrs.high--) > 0

    if (!a && canJump) {
      this.applyJumpSpeed(transitionTime)
      if (!b) {
        this.speed.x = direction*WIDTH*SCALE*steps/transitionTime
      }
    }
  }

  jumpLeft (transitionTime, surrondings) {
    this.applyJumpLateral(transitionTime, surrondings, -1)
  }

  jumpRight (transitionTime, surrondings) {
    this.applyJumpLateral(transitionTime, surrondings, 1)
  }

  fall(transitionTime, cellsToFall) {
    this.acceleration.y = WIDTH*SCALE*(cellsToFall)/(transitionTime*transitionTime)
  }

  pass (transitionTime, surrondings) {
    let center = this.actionRange
    let e = surrondings[center + 1][center]
    e = e && e.rigid
    if (!e) {
      this.fall(transitionTime, 1)
      // if fall can't jump again
      this.attrs.high = 0
    } else {
      this.sprite.anims.play(this.animations.idle)
      this.attrs.restoreHigh()
    }
  }

  enableTime (transitionTime, factor) {
    // update and save previous position
    this.fixPositionToGrid()
    this.previousPosition.i = this.position.i
    this.previousPosition.j = this.position.j
    
    this.timeFromTransition = 0
    this.fixedTimeForTransition = transitionTime
  }

  fixPositionToGrid () {
    let ts = WIDTH * SCALE
    let xIndex = ~~(this.sprite.x/ts)
    let yIndex = ~~(this.sprite.y/ts)
    this.position.i = (this.sprite.x - (xIndex*ts)) > (ts/2)? (xIndex + 1): xIndex
    this.position.j = (this.sprite.y - (yIndex*ts)) > (ts/2)? (yIndex + 1): yIndex

    this.sprite.x = this.position.i*ts
    this.sprite.y = this.position.j*ts
  }

  disableTime () {
    this.fixPositionToGrid()
    this.speed.x = 0
    this.speed.y = 0
    this.acceleration.y = 0
    this.sprite.update()
  }

  getAttackData () {
    return {
      hit: 10,
      type: 'melee'
    }
  }

  attack () {
    // dont fall while attacking
    // has a maximun number of attacks without falling
  }

  changedPosition () {
    return this.position.i != this.previousPosition.i || this.position.j != this.previousPosition.j
  }

  checkSkills (order, cells) {
    this.skills.forEach(skill => {
      if (skill.trigger(order, cells)) {
        skill.activate()
      }
    })
  }

  addSkill (skill) {
    this.skills.push(skill)
  }

}