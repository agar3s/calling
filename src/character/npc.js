import Character from './character'
import Weapon from '../elements/weapon'
import {ORDER_CODES} from '../scenes/boot'
const SCALE = 2
const WIDTH = 16

const MODS = {
  IDLE: 0,
  GUARD: 1
}

export default class NPC extends Character {
  constructor (config) {
    super(config)
    
    let basicSword = new Weapon({dices:'1d4', weight: 3, damageMods: 1})
    //let basicBow = new Weapon({dices:'1d4', weight: 2, damageMods: 0})

    this.setMeleeWeapon(basicSword)
    this.attrs.addPropertyMod('hp', 2)
    this.attrs.updateStrength(2)
    this.attrs.updateDexterity(1)
    this.attrs.updateIntelligence(1)

    this.mod = MODS.IDLE
    this.attrs.setProperty('high', 0)
    //this.player.setRangedWeapon(basicBow)
  }

  getOrder (map, target) {
    if (this.mod === MODS.IDLE) {
      return this.assignOrder({code: ORDER_CODES.PASS})
    }
    let possibleOrders = [ORDER_CODES.LEFT, ORDER_CODES.RIGHT, ORDER_CODES.JUMP, ORDER_CODES.JUMP_LEFT, ORDER_CODES.JUMP_RIGHT, ORDER_CODES.PASS, ORDER_CODES.PASS]
    let order = possibleOrders[~~(possibleOrders.length*Math.random())]

    let iDistance = target.position.i - this.position.i
    let jDistance = target.position.j - this.position.j
    let ld = iDistance<0?-1:1 //lateral direction
    if(iDistance===0) ld = 0
    let vd = jDistance<0?-1:1 //vertical direction
    if(jDistance===0) vd = 0
    let range = this.attrs.getProperty('sightRange')
    console.log(iDistance, ld)
    console.log(jDistance, vd)
    if(iDistance*ld<=1 && jDistance*vd<=1) {
      return this.assignOrder({code: ORDER_CODES.ATTACK_MELEE, i: target.position.i, j: target.position.j})
    }

    if(iDistance*ld>range || jDistance*vd>range) {
      return this.assignOrder({code: order})
    }

    if(ld===-1 && vd===-1) {
      order = ORDER_CODES.JUMP_LEFT
    } else if(ld=== 0 && vd===-1) {
      order = ORDER_CODES.JUMP
    } else if(ld=== 1 && vd===-1) {
      order = ORDER_CODES.JUMP_RIGHT
    } else if(ld===-1 && vd===0) {
    } else if(ld=== 1 && vd=== 0) {
      order = ORDER_CODES.RIGHT
    } else if(ld===-1 && vd===1) {
      order = ORDER_CODES.LEFT
    } else if(ld=== 0 && vd=== 1) {
      order = ORDER_CODES.DOWN
    } else if(ld=== 1 && vd=== 1) {
      order = ORDER_CODES.RIGHT
    }
    return this.assignOrder({code: order, i: target.position.i, j: target.position.j})
    
  }

  applyHit (attack) {
    super.applyHit(attack)
    if (this.mod === MODS.IDLE && this.attrs.getPropertyPercentage('hp') < 1) {
      this.mod = MODS.GUARD 
      this.animations.idle = this.animations.guard
      this.sprite.anims.play(this.animations.guard)
    }
  }

}

const ENEMY_TYPES = {
  MELEE: 0,
  RANGE_A: 1,
  RANGE_B: 2
}