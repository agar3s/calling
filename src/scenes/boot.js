import Player from '../sprites/player'
import Character from '../sprites/character'
import Control from '../util/control'
import Cursor from '../util/cursor'
import Map from '../dungeon/map'

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
  PROCESSING: 3,
  TARGETING: 4
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

  create () {   
    let SCALE = 2
    let WIDTH = 16
    let TS = SCALE*WIDTH // TileSize
    let xOffset = 0
    let yOffset = 0
    
    this.map = new Map({
      scene: this,
      scale: SCALE,
      width: WIDTH,
      xOffset: xOffset,
      yOffset: yOffset
    })
    

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
      x: xOffset + 16 + (16 * SCALE * 6),
      y: yOffset + 16 + (16 * SCALE * 2),
      animations: {idle: 'idle-red'}
    })

    this.npcs = []

    for (var i = 0; i< 10; i++) {
      let xi = ~~(Math.random()*16) + 2
      let yi = ~~(Math.random()*16)
      let npc = new Character({
        scene: this,
        x: xOffset + 16 + (16 * SCALE * xi),
        y: yOffset + 16 + (16 * SCALE * yi),
        animations: {idle: 'flying-blue'}
      })
      this.npcs.push(npc)
    }

    // control
    this.control = new Control({
      scene: this
    })

    // target cursor
    this.cursor = new Cursor({
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
        this.setOrder(ORDER_CODES.JUMP)
      } else if (this.control.isLeft()) {
        this.setOrder(ORDER_CODES.LEFT)
      } else if (this.control.isRight()) {
        this.setOrder(ORDER_CODES.RIGHT)
      } else if (this.control.isDown()) {
        this.setOrder(ORDER_CODES.DOWN)
      } else if (this.control.isTalk()) {
        //this.order = ORDER_CODES.TALK
      } else if (this.control.isAttack()) {
        this.showCursor()
        //this.order = ORDER_CODES.ATTACK
      } else if (this.control.isJumpLeft()) {
        this.setOrder(ORDER_CODES.JUMP_LEFT)
      } else if (this.control.isJumpRight()) {
        this.setOrder(ORDER_CODES.JUMP_RIGHT)
      }
      return
    }

    if (this.status === STATUS.TRANSITION) {
      if (this.turnTransition < 0) {
        this.endTurn()
        this.delayTransition(STATUS.WAITING, 150)
      } else {
        this.updateTurn(dt)
      }
      return
    }

    if (this.status === STATUS.TARGETING) {
      let actionTaken = true
      if (this.control.isUp()) {
        this.cursor.move(0, -1)
      } else if (this.control.isLeft()) {
        this.cursor.move(-1, 0)
      } else if (this.control.isRight()) {
        this.cursor.move(1, 0)
      } else if (this.control.isDown()) {
        this.cursor.move(0, 1)
      } else if (this.control.isJumpLeft()) {
        this.cursor.move(-1, -1)
      } else if (this.control.isJumpRight()) {
        this.cursor.move(1, -1)
      } else if (this.control.isTalk()) {
        //this.order = ORDER_CODES.TALK
      } else if (this.control.isAttack()) {
        this.setOrder(ORDER_CODES.ATTACK)
        this.cursor.hide()
      } else {
        actionTaken = false
      }

      if (actionTaken) {
        this.delayTransition(STATUS.TARGETING, 150)
      }
    }

    if (this.status === STATUS.DELAY) {
      if (this.turnTransition < 0) {
        this.status = this.nextStatus
      }
    }
  }

  setOrder (order) {
    this.order = order
    this.status = STATUS.PROCESSING
    setTimeout(() => {
      this.processTurn()  
    }, 1)
  }

  showCursor () {
    this.delayTransition(STATUS.TARGETING, 150)
    this.cursor.setPosition(this.player.position.i, this.player.position.j)
  }

  delayTransition (newStatus, delayTime) {
    this.status = STATUS.DELAY
    this.turnTransition = delayTime
    this.nextStatus = newStatus
  }

  processTurn () {
    //verify order entered by user, update enemies orders
    let cells = this.map.getMapSurrondings(this.player.position.i, this.player.position.j, this.player.actionRange)
    switch(this.order) {
      case ORDER_CODES.JUMP:
        this.player.jump(TIME_TO_ANIMATE, cells)
      break
      case ORDER_CODES.LEFT:
        this.player.turnLeft(TIME_TO_ANIMATE, cells)
      break
      case ORDER_CODES.RIGHT:
        this.player.turnRight(TIME_TO_ANIMATE, cells)
      break
      case ORDER_CODES.JUMP_LEFT:
        this.player.jumpLeft(TIME_TO_ANIMATE, cells)
      break
      case ORDER_CODES.JUMP_RIGHT:
        this.player.jumpRight(TIME_TO_ANIMATE, cells)
      break
      case ORDER_CODES.DOWN:
        this.player.down(TIME_TO_ANIMATE)
        this.player.pass(TIME_TO_ANIMATE, cells)
      break
      case ORDER_CODES.TALK:
        console.log('pass')
        this.player.pass(TIME_TO_ANIMATE, cells)
      break
      case ORDER_CODES.ATTACK:
        let pos = {i: this.cursor.position.i, j: this.cursor.position.j}
        let attack = this.player.getAttackData()
        if (attack.type === 'melee') {  // apply hit inmediatily
          let target = this.map.getElementInMap(pos.i, pos.j)
          this.player.attack(TIME_TO_ANIMATE)
          this.applyAttack(target, attack)
        }
      break
    }

    //this.player.applyUpdates(TIME_TO_ANIMATE, cells)
    this.player.enableTime(TIME_TO_ANIMATE, 1)


    // update enemies
    this.npcs.forEach(npc => {      
      let npcCells = this.map.getMapSurrondings(npc.position.i, npc.position.j, npc.actionRange)
      npc.pass(TIME_TO_ANIMATE, npcCells)
      npc.enableTime(TIME_TO_ANIMATE, 1)
    })

    this.turnTransition = TIME_TO_ANIMATE
    this.status = STATUS.TRANSITION
  }

  endTurn () {
    this.player.update()
    this.player.disableTime()
    this.order = 0

    this.npcs.forEach(npc => {
      npc.update()
      npc.disableTime()
      this.map.updateCharacterLocation(npc)
    })
  }

  updateTurn (dt) {
    // check collisions...?
    this.player.update(dt)
    this.npcs.forEach(npc => {
      npc.update(dt)
    })
  }

  applyAttack (element, attack) {
    console.log('attack to', element)
  }
}

export default BootScene