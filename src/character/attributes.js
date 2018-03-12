
// GURPS
export default class Attributes {
  constructor (config) {
    // basics
    this.dexterity = 1    // DX
    this.strength = 1     // ST
    this.intelligence = 1 // IQ

    // derivated from dexterity
    this.high = Attributes.initProperty(1)
    this.speed = Attributes.initProperty(1)
    this.dodge = Attributes.initProperty(1)
    this.updateDexterity(config.dexterity || 1)

    // derivated from strength
    this.hp = Attributes.initProperty(1)
    this.defense = Attributes.initProperty(1)
    this.updateStrength(config.strength || 1)

    // derivated from intelligence
    this.sightRange = Attributes.initProperty(6)

    // depending on item
    this.meleeRange = Attributes.initProperty(1)
    this.rangedRange = Attributes.initProperty(4)
  }

  updateDexterity (dx) {
    this.dexterity = dx
    this.setPropertyMaxValue('high', ~~(dx*0.34) + 1)
    this.setPropertyMaxValue('speed', dx*2)
    this.setPropertyMaxValue('dodge', ~~(dx*0.25) + 1)
  }

  updateStrength (st) {
    this.strength = st
    this.setPropertyMaxValue('hp', st*3 + 10)
    this.setPropertyMaxValue('defense', st*(0.4) + 1)
  }

  setProperty (property, value) {
    let prop = this[property]
    prop.value = value
    if (prop.value > prop.maxValue) {
      prop.value = prop.maxValue
    }
  }

  incrementProperty (property, value) {
    let newValue = this[property].value + value
    this.setProperty(property, newValue)
  }

  getProperty (property) {
    return this[property].value + this[property].mods
  }

  restoreProperty (property) {
    this.setProperty(property, this[property].maxValue)
  }

  setPropertyMaxValue (property, value) {
    let prop = this[property]
    prop.maxValue = value
    if (prop.maxValue>20) { // max value 20
      prop.maxValue = 20
    }
    prop.value = value
  }

  addPropertyMod (property, mod) {
    this[property].mods += mod
  }

  getPropertyPercentage (property) {
    let prop = this[property]
    return this.getProperty(property) / prop.maxValue
  }

  // 1d20 pifia
  // bad
  // apenas
  // bien
  // critico
  save (property, value) {
    let current = this.getProperty(property)
    if (current < value) return 0

    let d = ~~(Math.random()*20) + 1
    if(d === 1) {
      return -2
    } else if(d <= current) {
      return 0
    } else if(d < 20){
      return 1
    } else {
      return 2
    }
  }

  getStrengthModifier (maxMod) {
    let base = this.strength
    let roll = ~~(Math.random()*20) + 1
    if (roll === 1){
      return 0
    }
    if((roll + base) >= 20) {
      return maxMod
    }
    return 1
  }

  static initProperty(value) {
    return {
      value: value,
      maxValue: value,
      mods: 0
    }
  }

}