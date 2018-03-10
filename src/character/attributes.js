

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
    this.updateDexterity(config.dexterity || 1)

    // derivated from strength
    this.hp = Attributes.initProperty(1)
    this.updateStrength(config.strength || 1)
  }

  updateDexterity (dx) {
    this.dexterity = dx
    this.setPropertyMaxValue('high', ~~(dx*0.34) + 1)
    this.setPropertyMaxValue('speed', dx*2)
  }

  updateStrength (st) {
    this.strength = st
    this.setPropertyMaxValue('hp', st*3 + 10)
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
    prop.value = value
  }

  addPropertyMod (property, mod) {
    this[property].mods += mod
  }

  static initProperty(value) {
    return {
      value: value,
      maxValue: value,
      mods: 0
    }
  }
}