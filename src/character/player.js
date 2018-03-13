import Character from './character'
import Weapon from '../elements/weapon'
const SCALE = 2
const WIDTH = 16


export default class Player extends Character{
  constructor (config) {
    super(config)
    this.level = 1
  }

  upgradeStatOrWeapon (stat) {
    this.level++
    let increase = ['st', 'int', 'dx', 'melee', 'ranged']
    let r = increase[~~(Math.random()*increase.length)]
    switch (stat || r) {
      case 'st':
        let st = this.attrs.strength
        this.attrs.updateStrength(st + 1)
        console.log('strength increased')
        return 'strength'
      break
      case 'int':
        let int = this.attrs.intelligence
        this.attrs.updateIntelligence(int + 1)
        this.attrs.setPropertyMaxValue('rangedRange', this.attrs.rangedRange.maxValue + 1)
        console.log('intelligence increased')
        return 'intelligence'
      break
      case 'dx':
        let dx = this.attrs.dexterity
        this.attrs.updateDexterity(dx + 1)
        console.log('dexterity increased')
        return 'dexterity'
      break
      case 'melee':
        let basicSword = new Weapon({ dices: `${this.level}d4`, weight: 4, damageMods: this.level })
        this.setMeleeWeapon(basicSword)
        console.log('melee weapon upgraded')
        return 'sword power'
      break
      case 'ranged':
        let basicBow = new Weapon({ dices: `${~~(this.level*0.5+1)}d6`, weight: 2, damageMods: 1 })
        this.setRangedWeapon(basicBow)
        console.log('ranged weapon upgraded')
        return 'bow power'
      break
    }
  }

  reset () {
    this.level = 1
  }

}