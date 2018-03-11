import Player from '../character/player'
import Character from '../character/character'
import Control from '../util/control'
import Cursor from '../util/cursor'
import Map from '../dungeon/map'
import Projectile from '../elements/projectile'

import DoubleJump from '../character/skills/doubleJump'
import Dash from '../character/skills/dash'

const ORDER_CODES = {
  JUMP: 1,
  LEFT: 2,
  RIGHT: 3,
  DOWN: 4,
  JUMP_RIGHT: 5,
  JUMP_LEFT: 6,
  ATTACK_MELEE: 7,
  ATTACK_RANGED: 8,
  TALK: 9
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
    this.load.spritesheet('arrow', '../assets/arrow.png', {frameWidth: 16, frameHeight: 16})
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
      i: 3,
      j: 5,
      animations: {idle: 'idle-red'},
      attrs: {
        dexterity: 5
      }
    })
    this.player.addSkill(new DoubleJump({character: this.player}))
    this.player.addSkill(new Dash({character: this.player}))
    this.map.updateCharacterLocation(this.player)

    this.npcs = []

    for (var i = 0; i< 1; i++) {
      let j = ~~(Math.random()*3) + 2
      let i = ~~(Math.random()*4) + 1
      let npc = new Character({
        scene: this,
        i: i,
        j: j,
        animations: {idle: 'flying-blue'}
      })
      let index = this.npcs.push(npc)
      this.map.updateCharacterLocation(npc)
      npc.npcIndex = index
    }

    this.projectiles = []

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
    this.order = {}

    var controlConfig = {
      camera: this.cameras.main,
      acceleration: 0.06,
      drag: 0.0005,
      maxSpeed: 1.0
    }

    this.cameraControl = new Phaser.Cameras.Controls.Smoothed(controlConfig)
    this.cameras.main.startFollow(this.player.sprite, 10)

    /*
    effects for camera
    this.cameras.main.flash(100, 0.9, 0.1, 0.1)
    this.cameras.main.shake(100,0.003)
    */
  }

  update (time, dt) {
    this.cameraControl.update(dt)
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
        this.showCursor(this.player.attrs.getProperty('sightRange'), this.cursor.MODES.TALK)
      } else if (this.control.isMeleeAttack()) {
        this.showCursor(this.player.attrs.getProperty('meleeRange'), this.cursor.MODES.MELEE)
      } else if (this.control.isRangedAttack()) {
        this.showCursor(this.player.attrs.getProperty('rangedRange'), this.cursor.MODES.RANGED)
      } else if (this.control.isJumpLeft()) {
        this.setOrder(ORDER_CODES.JUMP_LEFT)
      } else if (this.control.isJumpRight()) {
        this.setOrder(ORDER_CODES.JUMP_RIGHT)
      }
      return
    }

    if (this.status === STATUS.TRANSITION) {
      if (this.turnTransition < 0) {
        this.endTurn(dt)
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
        if (this.cursor.isTalkMode()) {
          this.setOrder(ORDER_CODES.TALK)
          this.cursor.hide()
        } else {
          this.showCursor(this.player.attrs.getProperty('sightRange'), this.cursor.MODES.TALK)
        }
      } else if (this.control.isMeleeAttack()) {
        if (this.cursor.isMeleeMode()) {
          this.setOrder(ORDER_CODES.ATTACK_MELEE)
          this.cursor.hide()
        } else {
          this.showCursor(this.player.attrs.getProperty('meleeRange'), this.cursor.MODES.MELEE)
        }
      } else if (this.control.isRangedAttack()) {
        if (this.cursor.isRangedMode()) {
          this.setOrder(ORDER_CODES.ATTACK_RANGED)
          this.cursor.hide()
        } else {
          this.showCursor(this.player.attrs.getProperty('rangedRange'), this.cursor.MODES.RANGED)
        }
      } else if (this.control.isCancel()) {
        this.cursor.hide()
        this.delayTransition(STATUS.WAITING, 1)
        actionTaken = false
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

  // declare action in this turn
  setOrder (orderCode) {
    this.order = {
      code: orderCode,
      i: this.cursor.position.i,
      j: this.cursor.position.j
    }
    this.status = STATUS.PROCESSING
    setTimeout(() => {
      this.processTurn()  
    }, 1)
  }

  showCursor (range, type) {
    this.delayTransition(STATUS.TARGETING, 150)
    this.cursor.setAnchor(this.player.position.i, this.player.position.j, range, type)
  }

  delayTransition (newStatus, delayTime) {
    this.status = STATUS.DELAY
    this.turnTransition = delayTime
    this.nextStatus = newStatus
  }

  processTurn () {
    let possibleOrders = [ORDER_CODES.LEFT, ORDER_CODES.RIGHT]
    let orders = this.npcs.map(npc => {
      let randomOrder = possibleOrders[~~(Math.random()*possibleOrders.length)]
      return npc.assignOrder({code: randomOrder})
    })
    orders.push(this.player.assignOrder(this.order))

    orders.sort((a, b) => {
      return b.priority - a.priority
    })
    console.log(orders)

    orders.forEach(order => {
      let character = order.character
      let cells = this.map.getMapSurrondings(character.position.i, character.position.j, character.actionRange)
      let action = character.processOrder(cells, TIME_TO_ANIMATE)
      
      character.enableTime(TIME_TO_ANIMATE, 1)
      console.log(action)
      if (action.type === 'attack') {
        if (action.melee) {
          let target = this.map.getElementInMap(action.melee.i, action.melee.j)
          this.applyAttack(target, action.melee)
          this.cameras.main.flash(100, 0.9, 0.1, 0.1)
          this.cameras.main.shake(100, 0.003)
        }
        if (action.ranged) {
          let {origin, target, speed} = action.ranged
          this.throwProjectile(origin, target, speed)
        }
      }

        this.map.updateCharacterLocation(character)
        character.updateToFuturePosition()
      if (action.type === 'movement') {
      }
    })

    this.turnTransition = TIME_TO_ANIMATE
    this.status = STATUS.TRANSITION
  }

  endTurn (dt) {
    this.player.update()
    this.player.disableTime()
    this.order = {}

    this.npcs.forEach(npc => {
      npc.update()
      npc.disableTime()
    })

    this.projectiles.forEach(projectile => {
      projectile.update(dt)
    })
  }

  updateTurn (dt) {
    // check collisions...?
    this.player.update(dt)
    this.npcs.forEach(npc => {
      npc.update(dt)
    })

    this.projectiles.forEach(projectile => {
      projectile.update(dt)
    })
  }

  applyAttack (target, attack) {
    console.log('attack to', target)
    let element = target.element
    if(target.type === 'character') {
      let index = element.npcIndex
      element.destroy()
     }
  }

  throwProjectile (origin, target, speed) {
    this.projectiles.push(new Projectile({
      scene: this,
      origin: origin,
      target: target,
      baseSpeed: speed/(TIME_TO_ANIMATE)
    }))
  }
}

export {
  ORDER_CODES,
  BootScene
}