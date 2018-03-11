
export default class Weapon {
  constructor (config) {
    this.dices = config.dices.split(',').map(dice => {
      let [number, faces] = dice.split('d')
      return {number, faces}
    })
    this.damageMods = config.damageMods || 0
    this.weight = config.weight
  }

  rollDices () {
    let res = this.dices.reduce((acc, item) => {
      let total = 0
      for (var i = 0; i < item.number; i++) {
        let value = Weapon.roll(item.faces)
        total += value
      }
      return acc + total
    }, 0)
    return res
  }

  getDamage () {
    return this.rollDices() + this.damageMods
  }

  static roll (faces) {
    return (~~(Math.random()*faces) + 1)
  }
}

