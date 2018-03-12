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
  9: {type: 'talk', speed: 3},
  10: {type: 'pass', speed: 0.5}
}

export default class Character {
  constructor (config) {
    let scene = config.scene
    this.sprite = scene.add.sprite(0, 0, config.key)
    this.sprite.setOrigin(0.5, 0.5)
    this.xOffset = config.xOffset
    this.yOffset = config.yOffset
    this.sprite.x = config.i*SCALE*WIDTH + this.xOffset
    this.sprite.y = config.j*SCALE*WIDTH + this.yOffset
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
    this.hpBar = config.scene.add.graphics(0, 0)
    this.scene = scene
    this.hpBar.x = this.sprite.x - SCALE*WIDTH/2
    this.hpBar.y = this.sprite.y - SCALE*WIDTH/2 - 4*SCALE
    this.drawHp()

    this.meleeWeapon = undefined
    this.rangedWeapon = undefined

    this.lastDirection = 0
    this.attrs.setProperty('high', 0)
  }

  update (dt) {
    if(!dt) {
      dt = this.fixedTimeForTransition - this.timeFromTransition
    }
    this.timeFromTransition += dt
    this.speed.y += this.acceleration.y * dt
    this.sprite.x +=  this.speed.x*dt
    this.sprite.y +=  this.speed.y*dt

    // update hp bar
    this.hpBar.x = this.sprite.x - SCALE*WIDTH/2
    this.hpBar.y = this.sprite.y - SCALE*WIDTH/2 - 4*SCALE
  }

  applyJumpSpeed (transitionTime) {
    // vy = (h2 - h1) / t
    let gravityDistance = 3
    let yDistance = (-gravityDistance/2)*WIDTH*SCALE
    this.speed.y = yDistance/transitionTime
    
    let cellsToFall = this.cellsToFall
    this.acceleration.y = WIDTH*SCALE*(cellsToFall)/(transitionTime*transitionTime)
    this.lastDirection = 0
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
      this.sprite.anims.play(this.animations.move)
      this.lastDirection = direction
    }
    if ((!c&&!d) || (c&&!e)) {
      this.futurePosition.j += this.cellsToFall
      this.fall(transitionTime)
      this.sprite.anims.play(this.animations.move)
      // if fall can't jump again
      this.attrs.setProperty('high', 0)
    } else {
      this.lastDirection = 0
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
      this.sprite.anims.play(this.animations.jump)
    } else if(!e && !canJump){
      this.futurePosition.j += 1
      this.fall(transitionTime)
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
    this.lastDirection = 0
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
    let d = surrondings[center + 1][center + direction]
    let e = surrondings[center + 1][center]
    a = a && a.traspasable
    b = b && b.traspasable
    d = d && d.rigid
    e = e && e.rigid

    if (e) {
      this.attrs.restoreProperty('high')
    }
    let canJump = this.attrs.getProperty('high') > 0
    this.attrs.incrementProperty('high', -1)

    if (a && canJump) {
      this.applyJumpSpeed(transitionTime)
      this.futurePosition.j -= 1
      this.sprite.anims.play(this.animations.jump)
      if (b) {
        this.futurePosition.i += direction
        this.speed.x = direction*WIDTH*SCALE*steps/transitionTime
        this.lastDirection = direction
      } else {
        this.lastDirection = 0
      }
    } else if (!e) {
      this.futurePosition.j += 1
      this.fall(transitionTime)
      if (!d) {
        this.futurePosition.i += direction
        this.speed.x = direction*WIDTH*SCALE*steps/transitionTime
        this.lastDirection = direction
      } else {
        this.lastDirection = 0
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
    this.sprite.anims.play(this.animations.fall)
  }

  pass (transitionTime, surrondings) {
    let center = this.actionRange
    let a = surrondings[center - 1][center]
    let b = surrondings[center - 1][center + this.lastDirection]
    let c = surrondings[center][center + this.lastDirection]
    let d = surrondings[center + 1][center + this.lastDirection]
    let e = surrondings[center + 1][center]
    b = b && b.traspasable
    e = e && e.rigid
    c = c && c.rigid
    d = d && d.rigid

    if (this.attrs.getProperty('high') > 0 && !e) {
      if (b && this.lastDirection) {
        let preLastDirection = this.lastDirection
        this.futurePosition.i += this.lastDirection
        this.speed.x = this.lastDirection*WIDTH*SCALE/transitionTime
        this.applyJumpSpeed(transitionTime)
        this.futurePosition.j -= 1
        this.attrs.incrementProperty('high', -1)
        this.lastDirection = preLastDirection
      } else if(!this.lastDirection && a) {
        this.applyJumpSpeed(transitionTime)
        this.futurePosition.j -= 1
        this.attrs.incrementProperty('high', -1)
      }
    } else if (!e) {
      // if there is space in front and there is a previous direction
      if (!d && this.lastDirection) {
        this.futurePosition.i += this.lastDirection
        this.speed.x = this.lastDirection*WIDTH*SCALE/transitionTime
      } else {
        if (!c && d) {
          this.futurePosition.i += this.lastDirection
          this.speed.x = this.lastDirection*WIDTH*SCALE/transitionTime
          this.futurePosition.j -= 1
          this.cellsToFall = 0
        }
        this.lastDirection = 0
      }
      this.futurePosition.j += 1
      this.fall(transitionTime)
      // if fall can't jump again
      this.attrs.setProperty('high', 0)
    } else {
      this.remainingHigh = 0
      this.lastDirection = 0
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
    this.sprite.x = this.position.i*ts + this.xOffset
    this.sprite.y = this.position.j*ts + this.yOffset
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
    let damage = this.meleeWeapon.getDamage()
    let weaponSpeed = this.attrs.getProperty('speed')/this.meleeWeapon.weight
    let damageModifier = this.attrs.getStrengthModifier(2)
    if (damageModifier === 0) {
      this.scene.flashMessage('miss', this.sprite.x, this.sprite.y - WIDTH, 800)
    }
    return {
      hit: damage*damageModifier,
      type: 'melee',
      speed: weaponSpeed
    }
  }

  getRangedAttackData () {
    let damage = this.rangedWeapon.getDamage()
    let weaponSpeed = this.attrs.getProperty('speed')/this.meleeWeapon.weight
    let damageModifier = this.attrs.getStrengthModifier(1.5)
    return {
      hit: damage*damageModifier,
      speed: weaponSpeed,
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
    this.hpBar.destroy()
    setTimeout(()=>{
      this.sprite.destroy()
    }, 200)
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

    let center = this.actionRange
    let e = cells[center + 1][center]
    e = e && e.rigid

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
        this.pass(timeFromTransition, cells)
        return {type: 'talk'}
      case ORDER_CODES.ATTACK_MELEE:
        this.pass(timeFromTransition, cells)
        let melee = this.getAttackData()
        melee.i = this.order.i
        melee.j = this.order.j
        if (melee.type === 'melee') {
          this.attack(timeFromTransition)
          let animation = e?this.animations.melee:this.animations.melee2
          if(!animation) animation = this.animations.attack
          this.sprite.anims.play(animation)
        }
        return {type: 'attack', melee}
      case ORDER_CODES.ATTACK_RANGED:
        this.pass(timeFromTransition, cells)
        let ranged = this.getRangedAttackData()
        ranged.target = {i: this.order.i, j: this.order.j}
        ranged.origin = {i: this.position.i, j: this.position.j}
        if (ranged.type === 'ranged') {
          this.attack(timeFromTransition)
          let animation = e?this.animations.ranged:this.animations.ranged2
          if(!animation) animation = this.animations.attack
          this.sprite.anims.play(animation)
        }
        return {type: 'attack', ranged}
      case ORDER_CODES.PASS:
        this.pass(timeFromTransition, cells)
        return {type: 'pass'}
    }
  }

  applyHit (attack) {
    let dodged = this.attrs.save('dodge', attack.speed || 3)

    if (dodged===2) {
      this.scene.flashMessage('miss', this.sprite.x, this.sprite.y - WIDTH, 800)
      return
    } else if (dodged === 1){
      
    } else if(dodged<0) {
      attack.hit *= -dodged
    }

    let defense = this.attrs.getProperty('defense')
    let damage = Math.round(attack.hit - defense)
    this.attrs.incrementProperty('hp', -damage)
    this.drawHp()
    if (damage > 0) {
      // load text
      this.scene.flashMessage(`${damage}`, this.sprite.x, this.sprite.y - WIDTH, 1200)
      this.sprite.tint = 0x990000
      setTimeout(() => {
        this.sprite.tint = undefined
      }, 120)
    }
  }

  isDead () {
    return this.attrs.getProperty('hp') <= 0
  }

  drawHp () {
    let hpPercentage = this.attrs.getPropertyPercentage('hp')
    this.hpBar.clear()
    this.hpBar.fillStyle(0xCC4433, 0.9)
    this.hpBar.fillRect(1*SCALE, 0, SCALE*(WIDTH - 2)*hpPercentage, 2*SCALE)
  }

  shake () {

  }

  setMeleeWeapon (weapon) {
    this.meleeWeapon = weapon
  }

  setRangedWeapon (weapon) {
    this.rangedWeapon = weapon
  }
}