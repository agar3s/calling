import Player from '../sprites/player'
import Character from '../sprites/character'
import Control from '../util/control'

let basicMap = 
`8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,0,1,1,2,8,0,1,1,2,8,8,8,8,8
8,8,8,8,8,8,0,6,6,2,8,0,6,6,2,8,8,8,8,8
8,8,8,8,3,4,0,6,6,2,8,0,6,6,2,8,8,8,8,8
8,8,8,8,8,9,0,6,6,2,8,0,6,6,2,8,8,8,8,8
1,1,1,1,1,1,5,6,6,2,8,0,6,6,7,1,1,1,1,1
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,8,8,8,0
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6,6
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6,6,6
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6,6,6,6
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,6,6,6,6
6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6
6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6
6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6
6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6`

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
  DELAY: 2,
  PROCESSING: 3
}

const TIME_TO_ANIMATE = 300

class BootScene extends Phaser.Scene {
  constructor(test) {
    super({
      key: 'bootScene'
    })
  }

  preload() {
    this.load.spritesheet('characters', '../assets/characters.png', {frameWidth: 16, frameHeight: 16})
    this.load.spritesheet('platforms', '../assets/platforms.png', {frameWidth: 16, frameHeight: 16})
    this.load.spritesheet('ui', '../assets/ui.png', {frameWidth: 32, frameHeight: 32})
  }

  create() {
    let scale = 2
    let padding = 1
    let ts = 16 // tileSize
    
    let platforms = this.add.group()

    let xOffset = ts*scale
    let yOffset = ts*scale
    
    padding = 0
    let map = basicMap.split('\n').map(row => row.split(',').map(tile => parseInt(tile)))
    for (var j = 0; j < map.length; j++) {
      let y = yOffset + j * (ts * scale + padding)
      let row = map[j]
      for (var i = 0; i < row.length; i++) {
        let x = xOffset + i * (ts * scale + padding)
        let tile = row[i]
        let invert = (tile < 0)?-1:1
        this.add.tileSprite(x, y, ts, ts, 'platforms', tile * invert).setScale(invert * scale, scale)
      }
    }


    this.anims.create({
      key: 'flying-blue',
      frames: [{key: 'characters', frame: 2}, {key: 'characters', frame: 3}],
      repeat: -1,
      frameRate: 3
    })

    this.anims.create({
      key: 'flying-red',
      frames: [{key: 'characters', frame: 0}, {key: 'characters', frame: 1}],
      repeat: -1,
      frameRate: 6
    })

    this.anims.create({
      key: 'idle-red',
      frames: [{key: 'characters', frame: 0}]
    })

    this.player = new Player({
      scene: this,
      x: xOffset + 16 + (16 * scale * 6),
      y: yOffset + 16 + (16 * scale * 2),
      animations: ['idle-red']
    })

    this.npc = new Character({
      scene: this,
      x: xOffset + 16 + (16 * scale * 8),
      y: yOffset + 16 + (16 * scale * 1),
      animations: ['flying-blue']
    })

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
        this.player.jump(TIME_TO_ANIMATE)
      } else if (this.control.isLeft()) {
        this.order = ORDER_CODES.LEFT
        this.player.turnLeft(TIME_TO_ANIMATE)
      } else if (this.control.isRight()) {
        this.order = ORDER_CODES.RIGHT
        this.player.turnRight(TIME_TO_ANIMATE)
      } else if (this.control.isDown()) {
        this.order = ORDER_CODES.DOWN
        this.player.down(TIME_TO_ANIMATE)
      } else if (this.control.isTalk()) {
        this.order = ORDER_CODES.TALK
      } else if (this.control.isAttack()) {
        this.order = ORDER_CODES.ATTACK
      } else if (this.control.isJumpLeft()) {
        this.order = ORDER_CODES.JUMP_LEFT
        this.player.jump(TIME_TO_ANIMATE)
        this.player.turnLeft(TIME_TO_ANIMATE)
      } else if (this.control.isJumpRight()) {
        this.order = ORDER_CODES.JUMP_RIGHT
        this.player.jump(TIME_TO_ANIMATE)
        this.player.turnRight(TIME_TO_ANIMATE)
      }

      if (this.order > 0) {        
        this.status = STATUS.PROCESSING
        setTimeout(() => {
          this.processTurn()  
        }, 1)
      }
      return
    }

    if (this.status === STATUS.TRANSITION) {
      if (this.turnTransition < 0) {
        this.endTurn()
        this.turnTransition = 150
        this.status = STATUS.DELAY
      } else {
        this.updateTurn(dt)
      }
      return
    }

    if (this.status === STATUS.DELAY) {
      if (this.turnTransition < 0) {
        this.status = STATUS.WAITING
      }
    }
  }

  processTurn () {
    //verify order enter by user, update enemies orders
    this.player.enableTime(TIME_TO_ANIMATE, 1)

    // update enemies
    this.npc.enableTime(TIME_TO_ANIMATE, 1)

    this.turnTransition = TIME_TO_ANIMATE
    this.status = STATUS.TRANSITION
  }

  endTurn () {
    this.player.update()
    this.player.disableTime()
    this.order = 0

    this.npc.update()
    this.npc.disableTime()
  }

  updateTurn (dt) {
    this.player.update(dt)
    this.npc.update(dt)
  }

}

export default BootScene