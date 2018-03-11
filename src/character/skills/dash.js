import {ORDER_CODES} from '../../scenes/boot'
import Skill from './skill'

export default class Dash extends Skill {
  constructor (params) {
    super(params)
    this.maxCharges = 0
    this.charges = this.maxCharges
  }

  activate (character) {
    this.character.cellsToFall = 0
    this.charges--
    console.log('Dash!!')
  }

  trigger (order, cells) {
    let center = this.character.actionRange
    let e = cells[center + 1][center]
    e = e && e.rigid
    if (e) {
      this.charges = this.maxCharges
      return false
    }
    if(this.charges === 0) return false
    let isDashOrder = order.code === ORDER_CODES.LEFT ||
                      order.code === ORDER_CODES.RIGHT
    if (!isDashOrder) return false
    let direction = order.code === ORDER_CODES.LEFT?-1:1
    let d = cells[center + 1][center + direction]
    d = d && d.rigid
    return !d
  }

  afterTurn () {
    this.character.cellsToFall = 1
  }
}