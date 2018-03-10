import Character from './character'
const SCALE = 2
const WIDTH = 16


export default class Player extends Character{
  constructor (config) {
    super(config)
  }

  enableTime (transitionTime, factor) {
    super.enableTime(transitionTime, factor)
    this.sprite.anims.play('flying-red', true)
  }

}