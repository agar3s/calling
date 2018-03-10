

// GURPS
export default class Attributes {
  constructor (config) {
    // basics
    this.dexterity = 1    // DX
    this.strength = 1     // ST
    this.intelligence = 1 // IQ


    // derivated from dexterity
    this.maxHigh = 1
    this.high = 1
    this.speed = 1

    // derivated from strength
    this.maxHp = 1
    this.hp = 1

    this.updateDexterity(config.dexterity || 1)
    this.updateStrength(config.strength || 1)
  }

  updateDexterity (dx) {
    this.dexterity = dx
    this.maxHigh = ~~(dx*0.34) + 1
    this.high = this.maxHigh
    this.speed = dx*2
  }

  updateStrength (st) {
    this.strength = st
    this.maxHp = st*3 + 10
    this.hp = this.maxHp
  }

  restoreHigh (high) {
    if (!high) {
      this.high = this.maxHigh
      return
    }
    this.high += high
    if (this.high > this.maxHigh) {
      this.high = this.maxHigh
    }
  }

  restoreHp (hp) {
    if (!hp) {
      this.hp = this.maxHp
      return
    }
    this.hp += hp
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp
    }
  }
}