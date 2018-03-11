const SCALE = 2
const WIDTH = 16

export default class Projectil {
  constructor (config) {
    let scene = config.scene
    this.sprite = scene.add.sprite(0, 0, 'arrow')
    this.sprite.setOrigin(0.5, 0.5)

    let TS = SCALE*WIDTH
    this.sprite.x = config.origin.i * TS
    this.sprite.y = config.origin.j * TS
    this.sprite.setScale(SCALE)
    this.target = {i: config.target.i, j: config.target.j}
    this.origin = {i: config.origin.i, j: config.origin.j}

    this.speed = new Phaser.Math.Vector2(
      this.target.i - this.origin.i,
      this.target.j - this.origin.j
    )
    this.speed.normalize()
    this.sprite.setRotation(this.speed.angle())

    this.baseSpeed = config.baseSpeed * TS
    this.speed.scale(this.baseSpeed)
  }

  update (dt) {
    this.sprite.x += this.speed.x*dt
    this.sprite.y += this.speed.y*dt
  }
}