import Character from './character'
import Weapon from '../elements/weapon'
import {ORDER_CODES} from '../scenes/boot'
const SCALE = 2
const WIDTH = 16

const MODS = {
  IDLE: 0,
  GUARD: 1
}

const ENEMY_TYPES = {
  MELEE: 0,
  RANGE_A: 1,
  RANGE_B: 2
}

export default class NPC extends Character {
  constructor (config) {
    super(config)

    let enemyProperties = ENEMY_LIST[config.key]
    
    let weapon = enemyProperties.getWeapon(1)

    this.setMeleeWeapon(weapon)
    this.setRangedWeapon(weapon)

    this.attrs.addPropertyMod('hp', enemyProperties.getHp(1))
    this.attrs.updateStrength(enemyProperties.getStrength(1))
    this.attrs.updateDexterity(enemyProperties.getDexterity(1))
    this.attrs.updateIntelligence(enemyProperties.getIntelligence(1))

    this.mod = MODS.IDLE
    this.attackType = enemyProperties.attackType
    this.attrs.setProperty('high', 0)
    //this.player.setRangedWeapon(basicBow)
  }

  getOrder (map, target) {
    if (this.mod === MODS.IDLE) {
      return this.assignOrder({code: ORDER_CODES.PASS})
    }
    let possibleOrders = []

    let iDistance = target.position.i - this.position.i
    let jDistance = target.position.j - this.position.j
    let ld = iDistance<0?-1:1 //lateral direction
    if(iDistance===0) ld = 0
    let vd = jDistance<0?-1:1 //vertical direction
    if(jDistance===0) vd = 0
    let range = this.attrs.getProperty('sightRange')
    let additional = [ORDER_CODES.PASS]
    if(this.attackType === ENEMY_TYPES.MELEE) {
      if(iDistance*ld<=1 && jDistance*vd<=1) {
        return this.assignOrder({code: ORDER_CODES.ATTACK_MELEE, i: target.position.i, j: target.position.j})
      }
    }else {
      additional = additional.concat([ORDER_CODES.ATTACK_RANGED, ORDER_CODES.PASS])
    }
    if(this.attackType === ENEMY_TYPES.RANGE_B) {
      possibleOrders = additional
    }else if(iDistance*ld>range || jDistance*vd>range) {
      possibleOrders = additional.concat([ORDER_CODES.LEFT, ORDER_CODES.RIGHT, ORDER_CODES.JUMP, ORDER_CODES.JUMP_LEFT, ORDER_CODES.JUMP_RIGHT, ORDER_CODES.PASS])
    } else if(ld===-1 && vd===-1) {
      possibleOrders = additional.concat([ORDER_CODES.JUMP_LEFT, ORDER_CODES.JUMP_LEFT])
    } else if(ld=== 0 && vd===-1) {
      possibleOrders = additional.concat([ORDER_CODES.JUMP, ORDER_CODES.JUMP])
    } else if(ld=== 1 && vd===-1) {
      possibleOrders = additional.concat([ORDER_CODES.JUMP_RIGHT, ORDER_CODES.JUMP_RIGHT])
    } else if(ld===-1 && vd===0) {
      possibleOrders = additional.concat([ORDER_CODES.LEFT, ORDER_CODES.JUMP_LEFT])
    } else if(ld=== 1 && vd=== 0) {
      possibleOrders = additional.concat([ORDER_CODES.RIGHT, ORDER_CODES.JUMP_RIGHT])
    } else if(ld===-1 && vd===1) {
      possibleOrders = additional.concat([ORDER_CODES.LEFT, ORDER_CODES.LEFT])
    } else if(ld=== 0 && vd=== 1) {
      possibleOrders = additional.concat([ORDER_CODES.DOWN, ORDER_CODES.DOWN])
    } else if(ld=== 1 && vd=== 1) {
      possibleOrders = additional.concat([ORDER_CODES.RIGHT, ORDER_CODES.RIGHT])
    }
    let order = possibleOrders[~~(possibleOrders.length*Math.random())]
    return this.assignOrder({code: order, i: target.position.i, j: target.position.j})
    
  }

  applyHit (attack) {
    super.applyHit(attack)
    if (this.mod === MODS.IDLE && this.attrs.getPropertyPercentage('hp') < 1) {
      return true
    }
  }

  getAngry() {
    this.mod = MODS.GUARD
    this.animations.idle = this.animations.guard
    this.sprite.anims.play(this.animations.guard)
  }

}

const ENEMY_LIST = {
  'devil': {
    attackType: ENEMY_TYPES.MELEE,
    getWeapon: (level) => {
      return new Weapon({dices:`${level}d4`, weight: 3+level, damageMods: 1+~~(level/2)})
    },
    getHp: (level) => {
      return level + 10
    },
    getStrength: (level) => {
      return level + 1
    },
    getDexterity: (level) => {
      return ~~(level/2 + 1)
    },
    getIntelligence: (level) => {
      return ~~(level/3 + 1)
    }
  },
  'monk': {
    attackType: ENEMY_TYPES.MELEE,
    getWeapon: (level) => {
      return new Weapon({dices:'1d4,1d6', weight: 2+level, damageMods: level})
    },
    getHp: (level) => {
      return ~~(level*1.5) + 5
    },
    getStrength: (level) => {
      return ~~(level*1.5) + 1
    },
    getDexterity: (level) => {
      return level + 1
    },
    getIntelligence: (level) => {
      return ~~(level/2 + 1)
    }
  },
  'eye': {
    attackType: ENEMY_TYPES.RANGE_B,
    getWeapon: (level) => {
      return new Weapon({dices:'1d4', weight: 3, damageMods: level})
    },
    getHp: (level) => {
      return level*2 + 4
    },
    getStrength: (level) => {
      return ~~(level*0.5) + 1
    },
    getDexterity: (level) => {
      return level + 1
    },
    getIntelligence: (level) => {
      return level*2
    }
  }
}