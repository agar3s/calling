
export default class Control {
  constructor (config) {
    let keyboard = config.scene.input.keyboard
    this.keys = {}
    this.keys.W = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.keys.UP = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)

    this.keys.A = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keys.LEFT = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)

    this.keys.D = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    this.keys.RIGHT = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

    this.keys.S = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.keys.DOWN = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)

    this.keys.Q = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    this.keys.DELETE = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE)

    this.keys.E = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.keys.PAGE_DOWN = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN)

    this.keys.C = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C)
    this.keys.X = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
  }

  isUp () {
    return this.keys.W.isDown || this.keys.UP.isDown
  }

  isLeft () {
    return this.keys.A.isDown || this.keys.LEFT.isDown
  }

  isRight () {
    return this.keys.D.isDown || this.keys.RIGHT.isDown
  }

  isDown () {
    return this.keys.S.isDown || this.keys.DOWN.isDown
  }

  isTalk () {
    return this.keys.C.isDown
  }

  isAttack () {
    return this.keys.X.isDown
  }

  isJumpLeft () {
    return this.keys.Q.isDown || this.keys.DELETE.isDown
  }

  isJumpRight () {
    return this.keys.E.isDown || this.keys.PAGE_DOWN.isDown
  }
}