import Attributes from './attributes'
import {ORDER_CODES} from '../scenes/boot'

const SCALE = 2
const WIDTH = 16

const ORDER_DATA = {
  1: {type: 'movement', speed: 1.5},
  2: {type: 'movement', speed: 1.5},
  3: {type: 'movement', speed: 1.5},
  4: {type: 'movement', speed: 1.5},
  5: {type: 'movement', speed: 1.5},
  6: {type: 'movement', speed: 1.5},
  7: {type: 'attack', speed: 1},
  8: {type: 'attack', speed: 1.2},
  9: {type: 'talk', speed: 3}
}

export default class Character {
  constructor (config) {
    let scene = config.scene
    this.sprite = scene.add.sprite(0, 0, 'characters')
    this.sprite.setOrigin(0.5, 0.5)
    this.sprite.x = config.i*SCALE*WIDTH
    this.sprite.y = config.j*SCALE*WIDTH
    this.position = {i: 0, j: 0}
    this.speed = {x: 0, y: 0}
    this.acceleration = {x: 0, y: 0}

    this.futurePosition = {i: config.i, j: config.j}
    //this.fixPositionToGrid()

    this.timeFromTransition = 0
    this.fixedTimeForTransition = 0
    this.attrs = new Attributes(config.attrs || {})
    this.skills = []
    this.animations = config.animations
    this.sprite.setScale(SCALE).play(this.animations.idle)
    this.actionRange = 1

    this.cellsToFall = 1

    this.type = 'character'
    this.order = {}
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
    
    let cellsToFall = this.cellsToFall
    this.acceleration.y = WIDTH*SCALE*(cellsToFall)/(transitionTime*transitionTime)
  }

  applyLateralSpeed (transitionTime, surrondings, direction) {
    this.sprite.setScale(direction*(SCALE), SCALE)
    let center = this.actionRange
    let steps = 1
    let c = surrondings[center][center + direction]
    let d = surrondings[center + 1][center + direction]
    let e = surrondings[center + 1][center]
    c = c && !c.traspasable
    d = d && d.rigid
    e = e && e.rigid
    if (!c) {
      this.speed.x = direction*WIDTH*SCALE*steps/transitionTime
      this.futurePosition.i += direction
    }
    if ((!c&&!d) || (c&&!e)) {
      this.futurePosition.j += this.cellsToFall
      this.fall(transitionTime)
      // if fall can't jump again
      this.attrs.setProperty('high', 0)
    } else {
      this.attrs.restoreProperty('high')
    }

  }

  jump (transitionTime, surrondings) {
    let center = this.actionRange
    let steps = 1
    let a = surrondings[center - 1][center]
    let e = surrondings[center + 1][center]
    a = a && !a.traspasable
    e = e && e.rigid
    if (e) {
      this.attrs.restoreProperty('high')
    }
    let canJump = this.attrs.getProperty('high') > 0
    this.attrs.incrementProperty('high', -1)
    if (!a && canJump) {
      this.applyJumpSpeed(transitionTime)
      this.futurePosition.j -= 1
    }
  }

  down (transitionTime, surrondings) {
    let center = this.actionRange
    let e = surrondings[center + 1][center]
    e = e && !e.traspasable
    if (!e) {
      this.futurePosition.j += this.cellsToFall
      this.fall(transitionTime)
      this.attrs.setProperty('high', 0)
    }
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
      this.attrs.restoreProperty('high')
    }
    let canJump = this.attrs.getProperty('high') > 0
    this.attrs.incrementProperty('high', -1)

    if (!a && canJump) {
      this.applyJumpSpeed(transitionTime)
      this.futurePosition.j -= 1
      if (!b) {
        this.futurePosition.i += direction
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

  fall(transitionTime) {
    let cellsToFall = this.cellsToFall
    this.acceleration.y = WIDTH*SCALE*(cellsToFall*2)/(transitionTime*transitionTime)
  }

  pass (transitionTime, surrondings) {
    let center = this.actionRange
    let e = surrondings[center + 1][center]
    e = e && e.rigid
    if (!e) {
      this.futurePosition.j += 1
      this.fall(transitionTime)
      // if fall can't jump again
      this.attrs.setProperty('high', 0)
    } else {
      this.sprite.anims.play(this.animations.idle)
      this.attrs.restoreProperty('high')
    }
  }

  enableTime (transitionTime, factor) {
    // update and save previous position
    this.fixPositionToGrid()
    
    this.timeFromTransition = 0
    this.fixedTimeForTransition = transitionTime
  }

  fixPositionToGrid () {
    let ts = WIDTH * SCALE
    this.sprite.x = this.position.i*ts
    this.sprite.y = this.position.j*ts
  }

  updateToFuturePosition () {
    this.position.i = this.futurePosition.i
    this.position.j = this.futurePosition.j
  }

  disableTime () {
    this.fixPositionToGrid()
    this.speed.x = 0
    this.speed.y = 0
    this.acceleration.y = 0
    this.sprite.update()
    this.skills.forEach(skill => skill.afterTurn())
  }

  getAttackData () {
    return {
      hit: 10,
      type: 'melee'
    }
  }

  getRangedAttackData () {
    return {
      hit: 2,
      speed: 1.8,
      type: 'ranged'
    }
  }

  attack () {
    // dont fall while attacking
    // has a maximun number of attacks without falling
  }

  changedPosition () {
    return this.position.i != this.futurePosition.i || this.position.j != this.futurePosition.j
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

  destroy () {
    this.sprite.setScale(SCALE, -SCALE)
    this.attrs.setProperty('hp', 0)
  }

  assignOrder (order) {
    this.order = order
    let orderData = ORDER_DATA[order.code]
    this.order.priority = this.attrs.getProperty('speed')*orderData.speed
    this.order.character = this
    return this.order
  }

  processOrder (cells, timeFromTransition) {
    if(this.attrs.getProperty('hp') <= 0) return {type: 'pass'}
    this.checkSkills(this.order, cells)
    switch(this.order.code) {
      case ORDER_CODES.JUMP:
        this.jump(timeFromTransition, cells)
        return {type: 'movement'}
      case ORDER_CODES.LEFT:
        this.turnLeft(timeFromTransition, cells)
        return {type: 'movement'}
      case ORDER_CODES.RIGHT:
        this.turnRight(timeFromTransition, cells)
        return {type: 'movement'}
      case ORDER_CODES.JUMP_LEFT:
        this.jumpLeft(timeFromTransition, cells)
        return {type: 'movement'}
      case ORDER_CODES.JUMP_RIGHT:
        this.jumpRight(timeFromTransition, cells)
        return {type: 'movement'}
      case ORDER_CODES.DOWN:
        this.down(timeFromTransition, cells)
        return {type: 'movement'}
      case ORDER_CODES.TALK:
        console.log('pass')
        this.pass(timeFromTransition, cells)
        return {type: 'talk'}
      case ORDER_CODES.ATTACK_MELEE:
        let melee = this.getAttackData()
        melee.i = this.order.i
        melee.j = this.order.j
        if (melee.type === 'melee') {
          this.attack(timeFromTransition)
        }
        return {type: 'attack', melee}
      case ORDER_CODES.ATTACK_RANGED:
        let ranged = this.getRangedAttackData()
        ranged.target = {i: this.order.i, j: this.order.j}
        ranged.origin = {i: this.position.i, j: this.position.j}
        if (ranged.type === 'ranged') {
          this.attack(timeFromTransition)
        }
        return {type: 'attack', ranged}
    }
  }
}