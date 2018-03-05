import Player from '../sprites/player'
import Control from '../util/control'

let basicMap = 
`-16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16
-16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16
-16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,45,16
-16,0,0,0,0,0,0,0,0,0,26,26,26,3,47,3,4,26,53,16
-16,0,0,0,45,0,0,0,0,8,9,9,9,-11,55,11,9,9,9,10
-16,0,0,0,53,0,0,46,23,16,0,0,0,-19,55,19,0,0,0,0
-16,0,0,0,22,14,14,54,15,16,0,0,0,-27,55,27,0,0,0,0
-16,0,0,0,30,0,0,54,0,16,0,0,-19,63,55,63,20,20,20,34
-16,0,0,14,14,22,0,54,0,16,0,0,-19,0,55,0,0,0,0,42
-16,0,0,0,0,30,0,54,2,16,0,0,-19,0,55,0,0,0,0,42
-16,0,0,0,26,30,1,54,23,16,0,0,-13,12,12,12,12,13,0,42
-10,0,14,15,8,9,9,9,9,10,0,0,0,0,0,0,0,0,0,42
-0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
9,9,9,9,10,0,0,0,0,0,0,0,11,12,12,12,12,12,12,12`

const ORDER_CODES = {
  JUMP: 1,
  LEFT: 2,
  RIGHT: 3,
  DOWN: 4,
  JUMP_RIGHT: 5,
  JUMP_LEFT: 6,
  ATTACK: 7,
  TALK: 8
}

const STATUS = {
  WAITING: 0,
  TRANSITION: 1,
  DELAY: 2
}

class BootScene extends Phaser.Scene {
  constructor(test) {
    super({
      key: 'bootScene'
    })
  }

  preload() {
    this.load.spritesheet('tiles', '../assets/cavesofgallet_tiles_t.png', {frameWidth: 8, frameHeight: 8})
  }

  create() {
    let scale = 3
    let padding = 1
    let ts = 8 // tileSize
    for (var j = 0; j < 12; j++) {
      for (var i = 0; i < 8; i++) {
        let image = this.add.tileSprite(50 + i*(ts*scale+padding), 50 + j*(ts*scale+padding), ts, ts, 'tiles', j*8+i)
        image.setScale(scale, scale)
      }
    }
    
    let platforms = this.physics.add.staticGroup()

    let xOffset = 300
    let yOffset = 100
    
    padding = 0
    let map = basicMap.split('\n').map(row => row.split(',').map(tile => parseInt(tile)))
    for (var j = 0; j < map.length; j++) {
      let y = yOffset + j * (ts * scale + padding)
      let row = map[j]
      for (var i = 0; i < row.length; i++) {
        let x = xOffset + i * (ts * scale + padding)
        let tile = row[i]
        let invert = (tile < 0)?-1:1
        if ([8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 22, 24].indexOf(invert*tile)!=-1) {
          platforms.create(x, y, 'tiles', tile * invert).setScale(scale, scale).refreshBody().setScale(invert * scale, scale)
        } else {
          this.add.tileSprite(x, y, ts, ts, 'tiles', tile * invert).setScale(invert * scale, scale)
        }
      }
    }


    this.anims.create({
      key: 'flying-blue',
      frames: [{key: 'tiles', frame: 41}, {key: 'tiles', frame: 49}],
      repeat: -1,
      frameRate: 3
    })

    this.anims.create({
      key: 'flying-red',
      frames: [{key: 'tiles', frame: 31}, {key: 'tiles', frame: 38}],
      repeat: -1,
      frameRate: 6
    })

    this.anims.create({
      key: 'idle-red',
      frames: [{key: 'tiles', frame: 39}]
    })

    this.add.sprite(xOffset + 8*scale*5+4, yOffset, 'tiles').setScale(scale).play('flying-blue')

    this.player = new Player({
      scene: this,
      x: xOffset + 8*scale*6+4,
      y: yOffset + 8*scale*4+4
    })

    this.physics.add.collider(this.player.sprite, platforms)

    // control
    this.control = new Control({
      scene: this
    })

    // experimental turn based order
    this.status = STATUS.WAITING
    this.turnTransition = 0
    this.order = 0
  }

  update (time, dt) {
    this.turnTransition -= dt

    if (this.status === STATUS.WAITING) {
      // read keys
      if (this.control.isUp()) {
        this.order = ORDER_CODES.JUMP
        this.player.jump()
      } else if (this.control.isLeft()) {
        this.order = ORDER_CODES.LEFT
        this.player.turnLeft()
      } else if (this.control.isRight()) {
        this.order = ORDER_CODES.RIGHT
        this.player.turnRight()
      } else if (this.control.isDown()) {
        this.order = ORDER_CODES.DOWN
      } else if (this.control.isTalk()) {
        this.order = ORDER_CODES.TALK
      } else if (this.control.isAttack()) {
        this.order = ORDER_CODES.ATTACK
      } else if (this.control.isJumpLeft()) {
        this.order = ORDER_CODES.JUMP_LEFT
        this.player.jump()
        this.player.turnLeft()
      } else if (this.control.isJumpRight()) {
        this.order = ORDER_CODES.JUMP_RIGHT
        this.player.jump()
        this.player.turnRight()
      }

      if (this.order > 0) {
        // take decisions
        this.player.enableTime(1)
        this.turnTransition = 300
        this.status = STATUS.TRANSITION
      }
      return
    }

    if (this.status === STATUS.TRANSITION) {
      this.player.update()

      if (this.turnTransition < 0) {
        this.turnTransition = 150
        this.player.disableTime()
        this.order = 0
        this.status = STATUS.DELAY
      }
      return
    }

    if (this.status === STATUS.DELAY) {
      if (this.turnTransition < 0) {
        this.status = STATUS.WAITING
      }
    }

  }
}

export default BootScene