
export default class Player {
  constructor (config) {
    let scene = config.scene
    let x = config.x
    let y = config.y
    this.sprite = scene.physics.add.sprite(x, y, 'tiles')
    this.sprite.setScale(3*0.7).play('idle-red')
    this.speed = {x: 0, y: 0}
  }

  update () {
    this.sprite.setVelocityX(this.speed.x)
  }

  jump () {
    this.sprite.setVelocityY(-300)
  }

  turnLeft () {
    this.sprite.setScale((3*0.7), 3*0.7)
    this.speed.x = -80
  }

  turnRight () {
    this.sprite.setScale(-1*(3*0.7), 3*0.7)
    this.speed.x = 80
  }

  enableTime (factor) {
    this.sprite.setAccelerationY(1000 * factor)
    this.sprite.anims.play('flying-red', true)
  }

  disableTime () {
    if (this.sprite.body.velocity.y === 0) {
      this.sprite.anims.play('idle-red')
    }
    this.speed.x = 0
    this.speed.y = 0
    this.sprite.setVelocityX(0)
    this.sprite.setVelocityY(0)
    this.sprite.setAccelerationY(0)        
  }


}