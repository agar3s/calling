import Player from '../character/player'
import NPC from '../character/npc'
import Control from '../util/control'
import Cursor from '../util/cursor'
import Map from '../dungeon/map'
import Projectile from '../elements/projectile'
import Weapon from '../elements/weapon'

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
  TALK: 9,
  PASS: 10
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
    // load the background for the rooms
    this.load.image('bg_walls', '../assets/bg_walls.png')
    this.load.image('bg_columns', '../assets/bg_columns.png')

    this.load.image('dialogue_box', '../assets/ui_dialogue-box.png')
    this.load.spritesheet('devil', '../assets/devil_ss.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('monk', '../assets/monk_ss.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('eye', '../assets/eye_ss.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('platforms', '../assets/platforms.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('ui_actions', '../assets/ui_ss_32x32.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('ui_info', '../assets/ui_ss_16x16.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('arrow', '../assets/arrow.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('laser', '../assets/laser.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('player', '../assets/player_ss2.png', { frameWidth: 16, frameHeight: 16 })
    this.load.bitmapFont('kenney', '../assets/fonts/KenneyBlocks.png', '../assets/fonts/KenneyBlocks.xml')

    // load sfx
    this.load.audio('arrow_shot', '../assets/arrow_shot.ogg')
    this.load.audio('sword_attack', '../assets/sword_attack.ogg')
    this.load.audio('devil_attack', '../assets/devil_attack.ogg')
    this.load.audio('monk_attack', '../assets/monk_attack.ogg')
    this.load.audio('eye_attack', '../assets/eye_attack.ogg')
  }

  create() {
    let SCALE = 2
    let WIDTH = 16
    let TS = SCALE * WIDTH // TileSize
    let xOffset = 16
    let yOffset = 16
    this.xOffset = xOffset
    this.yOffset = yOffset

    let walls = this.add.tileSprite(10 * 32, 6 * 32, 35 * 32 * 2, 40 * 32, 'bg_walls')
    walls.scrollFactorX = 0.5

    this.map = new Map({
      scene: this,
      scale: SCALE,
      width: WIDTH,
      xOffset: xOffset,
      yOffset: yOffset
    })
    this.dungeonLevel = 0
    console.log(this.map.rows, this.map.cols)

    this.anims.create({
      key: 'player-jump',
      frames: [{ key: 'player', frame: 8, duration: 2 }, { key: 'player', frame: 9 }],
      repeat: 0,
      frameRate: 4
    })
    this.anims.create({
      key: 'player-fall',
      frames: [{ key: 'player', frame: 14, duration: 2 }, { key: 'player', frame: 15 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'player-move',
      frames: [{ key: 'player', frame: 2, duration: 0 }, { key: 'player', frame: 3 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'player-melee',
      frames: [
        { key: 'player', frame: 4 },
        { key: 'player', frame: 5, duration: 50 },
        { key: 'player', frame: 4 }
      ],
      repeat: 0,
      frameRate: 8
    })

    this.anims.create({
      key: 'player-melee-air',
      frames: [
        { key: 'player', frame: 10 },
        { key: 'player', frame: 11, duration: 50 },
        { key: 'player', frame: 10 }
      ],
      repeat: 0,
      frameRate: 8
    })

    this.anims.create({
      key: 'player-ranged',
      frames: [
        { key: 'player', frame: 6 },
        { key: 'player', frame: 7, duration: 50 },
        { key: 'player', frame: 6 },
      ],
      repeat: 0,
      frameRate: 8
    })

    this.anims.create({
      key: 'player-ranged-air',
      frames: [
        { key: 'player', frame: 12 },
        { key: 'player', frame: 13, duration: 50 },
        { key: 'player', frame: 12 },
      ],
      repeat: 0,
      frameRate: 8
    })

    this.anims.create({
      key: 'player-idle',
      frames: [
        { key: 'player', frame: 0, duration: 2 },
        { key: 'player', frame: 1 }
      ],
      repeat: 1,
      frameRate: 4
    })


    let spot = this.map.getNextAvailableSpot()
    this.player = new Player({
      scene: this,
      i: spot.i,
      j: spot.j,
      key: 'player',
      xOffset: xOffset,
      yOffset: yOffset,
      animations: {
        idle: 'player-idle',
        jump: 'player-jump',
        fall: 'player-fall',
        move: 'player-move',
        melee: 'player-melee',
        ranged: 'player-ranged',
        melee2: 'player-melee-air',
        ranged2: 'player-ranged-air'
      },
      attrs: {
        dexterity: 2,
        strength: 3,
        intelligence: 3
      }
    })
    this.player.addSkill(new DoubleJump({ character: this.player }))
    this.player.addSkill(new Dash({ character: this.player }))
    this.map.updateCharacterLocation(this.player)
    this.player.updateToFuturePosition()

    let basicSword = new Weapon({ dices: '2d4', weight: 4, damageMods: 1 })
    let basicBow = new Weapon({ dices: '1d6', weight: 2, damageMods: 1 })

    this.player.setMeleeWeapon(basicSword)
    this.player.setRangedWeapon(basicBow)


    this.anims.create({
      key: 'devil-idle',
      frames: [{ key: 'devil', frame: 0 }, { key: 'devil', frame: 1 }],
      repeat: 1,
      frameRate: 4
    })

    this.anims.create({
      key: 'devil-move',
      frames: [{ key: 'devil', frame: 2 }, { key: 'devil', frame: 3 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'devil-guard',
      frames: [{ key: 'devil', frame: 4 }, { key: 'devil', frame: 5 }],
      repeat: 1,
      frameRate: 4
    })

    this.anims.create({
      key: 'devil-attack',
      frames: [{ key: 'devil', frame: 6 }, { key: 'devil', frame: 7 }, { key: 'devil', frame: 6 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'devil-jump',
      frames: [{ key: 'devil', frame: 8 }, { key: 'devil', frame: 9 }, { key: 'devil', frame: 8 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'devil-fall',
      frames: [{ key: 'devil', frame: 10 }, { key: 'devil', frame: 11 }, { key: 'devil', frame: 10 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'monk-idle',
      frames: [{ key: 'monk', frame: 0 }, { key: 'monk', frame: 1 }],
      repeat: 1,
      frameRate: 4
    })

    this.anims.create({
      key: 'monk-move',
      frames: [{ key: 'monk', frame: 2 }, { key: 'monk', frame: 3 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'monk-guard',
      frames: [{ key: 'monk', frame: 4 }, { key: 'monk', frame: 5 }],
      repeat: 1,
      frameRate: 4
    })

    this.anims.create({
      key: 'monk-attack',
      frames: [{ key: 'monk', frame: 6 }, { key: 'monk', frame: 7 }, { key: 'monk', frame: 6 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'monk-jump',
      frames: [{ key: 'monk', frame: 8 }, { key: 'monk', frame: 9 }, { key: 'monk', frame: 8 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'monk-fall',
      frames: [{ key: 'monk', frame: 10 }, { key: 'monk', frame: 11 }, { key: 'monk', frame: 10 }],
      repeat: 0,
      frameRate: 4
    })

    this.anims.create({
      key: 'eye-idle',
      frames: [{ key: 'eye', frame: 0 }, { key: 'eye', frame: 1 }],
      repeat: 1,
      frameRate: 4
    })

    this.anims.create({
      key: 'eye-guard',
      frames: [{ key: 'eye', frame: 2 }, { key: 'eye', frame: 3 }],
      repeat: 1,
      frameRate: 4
    })

    this.anims.create({
      key: 'eye-attack',
      frames: [{ key: 'eye', frame: 4 }, { key: 'eye', frame: 5 }, { key: 'eye', frame: 4 }],
      repeat: 0,
      frameRate: 4
    })

    this.npcs = []
    let monsterType = ['devil', 'devil', 'monk', 'monk', 'eye'][~~(Math.random() * 5)]

    for (var i = 0; i < 5; i++) {
      let j = ~~(Math.random() * 3) + 1
      let i = ~~(Math.random() * 13) + 1
      let npc = new NPC({
        scene: this,
        key: monsterType,
        xOffset: xOffset,
        yOffset: yOffset,
        i: i,
        j: j,
        animations: {
          idle: `${monsterType}-idle`,
          guard: `${monsterType}-guard`,
          move: `${monsterType}-move`,
          attack: `${monsterType}-attack`,
          jump: `${monsterType}-jump`,
          fall: `${monsterType}-fall`
        }
      })
      let index = this.npcs.push(npc) - 1
      this.map.updateCharacterLocation(npc)
      npc.updateToFuturePosition()
      npc.index = index
    }
    this.projectiles = []
    this.loadDungeon()

    // control
    this.control = new Control({
      scene: this
    })

    // target cursor
    this.cursor = new Cursor({
      scene: this,
      xOffset: xOffset,
      yOffset: yOffset
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

    //temp
    this.cameras.main.scrollX = 0
    this.cameras.main.scrollY = 0
    this.cameras.main.setBounds(0, 0, this.map.cols * 32, this.map.rows * 32)
    this.cameras.main.startFollow(this.player.sprite)
    /*
    effects for camera
    this.cameras.main.flash(100, 0.9, 0.1, 0.1)
    this.cameras.main.shake(100,0.003)
    */

    let columns = this.add.tileSprite(35 * 32, 0, 35 * 32 * 2, 40 * 32, 'bg_columns')

    columns.setAlpha(0.5)
    columns.scrollFactorX = 2

    // add the UI elements
    this.bowIcon = this.add.sprite(TS, TS, 'ui_actions')
    this.bowIcon.scrollFactorX = 0
    this.bowIcon.scrollFactorY = 0
    // this.bowIcon.setOrigin(0, 0)
    this.bowIcon.setScale(SCALE)
    this.bowIcon.setFrame(0)

    this.swordIcon = this.add.sprite(this.bowIcon.x + this.bowIcon.width + TS, this.bowIcon.y, 'ui_actions')
    this.swordIcon.scrollFactorX = 0
    this.swordIcon.scrollFactorY = 0
    // this.swordIcon.setOrigin(0, 0)
    this.swordIcon.setScale(SCALE)
    this.swordIcon.setFrame(2)

    this.talkIcon = this.add.sprite(this.swordIcon.x + this.swordIcon.width + TS, this.bowIcon.y, 'ui_actions')
    this.talkIcon.scrollFactorX = 0
    this.talkIcon.scrollFactorY = 0
    // this.talkIcon.setOrigin(0, 0)
    this.talkIcon.setScale(SCALE)
    this.talkIcon.setFrame(4)
  }

  resetPlayer() {
    let spot = this.map.getNextAvailableSpot()
    this.player.futurePosition.i = spot.i
    this.player.futurePosition.j = spot.j
    this.player.position.i = 0
    this.player.position.j = 0
    this.player.lastDirection = 0
    this.player.attrs.setProperty('high', 0)
    this.player.attrs.updateStrength(2)
    this.player.attrs.updateDexterity(2)
    this.player.attrs.updateIntelligence(2)
    this.player.attrs.restoreProperty('hp')
    this.drawHp()
    this.map.updateCharacterLocation(this.player)
    this.player.updateToFuturePosition()
    this.player.fixPositionToGrid()
    this.player.update(1)

    console.log('new position', this.player.attrs.getProperty('hp'))
    console.log('new percentage', this.player.attrs.getPropertyPercentage('hp'))
    console.log('raw data', this.player.attrs.hp)
  }

  upgradePlayer() {
    let spot = this.map.getNextAvailableSpot()
    this.player.futurePosition.i = spot.i
    this.player.futurePosition.j = spot.j
    this.map.updateCharacterLocation(this.player)
    this.player.updateToFuturePosition()
    this.player.fixPositionToGrid()
    this.player.update(1)
    console.log(this.player)
    console.log('new position', this.player.position, spot)
  }

  loadDungeon() {
    this.map.emptyElements()
    this.map.regenerateSpots()
    this.npcs.forEach(npc => npc.destroy())
    this.npcs = []
    this.projectiles.forEach(projectile => projectile.destroy())
    this.projectiles = []

    let monsterType = ['devil', 'devil', 'monk', 'monk', 'eye'][~~(Math.random() * 5)]
    this.dungeonLevel++

    //for (var i = 0; i < (this.dungeonLevel + 5); i++) {
    for (var i = 0; i < 1; i++) {
      let pos = this.map.getNextAvailableSpot()
      let npc = new NPC({
        scene: this,
        key: monsterType,
        xOffset: this.xOffset,
        yOffset: this.yOffset,
        level: this.dungeonLevel,
        i: pos.i,
        j: pos.j,
        animations: {
          idle: `${monsterType}-idle`,
          guard: `${monsterType}-guard`,
          move: `${monsterType}-move`,
          attack: `${monsterType}-attack`,
          jump: `${monsterType}-jump`,
          fall: `${monsterType}-fall`
        }
      })
      let index = this.npcs.push(npc) - 1
      this.map.updateCharacterLocation(npc)
      npc.updateToFuturePosition()
      npc.index = index
    }
  }

  update(time, dt) {
    this.turnTransition -= dt

    if (this.status === STATUS.WAITING) {
      // read keys
      if (this.control.isUp()) {
        // character can jump?
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
          if (this.cursor.position.i === this.player.position.i && this.cursor.position.j === this.player.position.j) {
            this.cursor.hide()
            this.delayTransition(STATUS.WAITING, 200)
            actionTaken = false
          } else {
            this.setOrder(ORDER_CODES.ATTACK_MELEE)
            this.cursor.hide()
          }
        } else {
          this.showCursor(this.player.attrs.getProperty('meleeRange'), this.cursor.MODES.MELEE)
        }
      } else if (this.control.isRangedAttack()) {
        if (this.cursor.isRangedMode()) {
          if (this.cursor.position.i === this.player.position.i && this.cursor.position.j === this.player.position.j) {
            this.cursor.hide()
            this.delayTransition(STATUS.WAITING, 200)
            actionTaken = false
          } else {
            this.setOrder(ORDER_CODES.ATTACK_RANGED)
            this.cursor.hide()
          }
        } else {
          this.showCursor(this.player.attrs.getProperty('rangedRange'), this.cursor.MODES.RANGED)
        }
      } else if (this.control.isCancel()) {
        this.cursor.hide()
        this.delayTransition(STATUS.WAITING, 200)
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
  setOrder(orderCode) {
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

  showCursor(range, type) {
    this.delayTransition(STATUS.TARGETING, 150)
    this.cursor.setAnchor(this.player.position.i, this.player.position.j, range, type)

    // reset the action icons when the player changes the current one
    this.talkIcon.setFrame(4)
    this.swordIcon.setFrame(2)
    this.bowIcon.setFrame(0)

    switch (type) {
      case this.cursor.MODES.TALK:
        this.talkIcon.setFrame(5)
        break;
      case this.cursor.MODES.MELEE:
        this.swordIcon.setFrame(3)
        break;
      case this.cursor.MODES.RANGED:
        this.bowIcon.setFrame(1)
        break;
    }
  }

  delayTransition(newStatus, delayTime) {
    this.status = STATUS.DELAY
    this.turnTransition = delayTime
    this.nextStatus = newStatus
  }

  processTurn() {
    let orders = this.npcs.map(npc => npc.getOrder(this.map, this.player))
    orders.push(this.player.assignOrder(this.order))

    orders.sort((a, b) => {
      return b.priority - a.priority
    })

    orders.forEach(order => {
      let character = order.character
      let cells = this.map.getMapSurrondings(character.position.i, character.position.j, character.actionRange)
      let action = character.processOrder(cells, TIME_TO_ANIMATE)

      character.enableTime(TIME_TO_ANIMATE, 1)
      if (action.type === 'attack') {
        if (action.melee) {
          let target = this.map.getElementInMap(action.melee.i, action.melee.j)
          this.applyAttack(target, action.melee)
        }
        if (action.ranged) {
          let { origin, target, speed, hit } = action.ranged
          this.throwProjectile(character, origin, target, speed, hit)
        }
      }

      this.map.updateCharacterLocation(character)
      character.updateToFuturePosition()
      if (action.type === 'movement') {
      }
    })

    this.projectiles.forEach(projectile => projectile.resumeTime())

    this.turnTransition = TIME_TO_ANIMATE
    this.status = STATUS.TRANSITION

    // reset the UI icons after an action takes effect
    this.talkIcon.setFrame(4)
    this.swordIcon.setFrame(2)
    this.bowIcon.setFrame(0)
  }

  endTurn(dt) {
    this.player.update()
    this.player.disableTime()
    this.order = {}

    this.npcs.forEach(npc => {
      npc.update()
      npc.disableTime()
    })

    this.projectiles.forEach((projectile, index) => {
      projectile.update(dt)
      projectile.updatePosition()
      if (projectile.hit) {
        this.applyProjectileAttack(projectile, index)
      }
      projectile.pauseTime()
    })
  }

  updateTurn(dt) {
    // check collisions...?
    this.player.update(dt)
    this.npcs.forEach(npc => {
      npc.update(dt)
    })

    this.projectiles.forEach((projectile, index) => {
      projectile.update(dt)
      if (projectile.doCheckCollision()) {
        this.applyProjectileAttack(projectile, index)
      }
    })
  }

  applyAttack(target, attack) {
    let element = target.element
    if (target.type === 'character') {
      let changeMood = element.applyHit(attack)
      if (changeMood) {
        this.npcs.forEach(npc => npc.getAngry())
      }
      if (element.isDead()) {
        if (element === this.player) {
          this.cameras.main.fade(2000)
          setTimeout(() => {
            this.cameras.main._fadeAlpha = 0
            this.loadDungeon()
            this.resetPlayer()
          }, 2500)
        } else {
          this.cameras.main.flash(60, 0.9, 0.1, 0.1)
          this.cameras.main.shake(60, 0.003)
          this.destroyCharacter(element)
        }
        // check index before destroy... or update last indexes
        if (this.npcs.length === 0) {
          this.cameras.main.fade(1000)
          setTimeout(() => {
            this.cameras.main._fadeAlpha = 0
            this.loadDungeon()
            this.upgradePlayer()
          }, 1200)

        }
      }
      return true
    }

    if (target.type === 'tile') {
      if (!target.element.traspasable) {
        return true
      }
    }
  }

  destroyCharacter(element) {
    let index = element.index
    this.map.removeElement(element.position.i, element.position.j, element)
    for (var i = this.npcs.length - 1; i >= 0; i--) {
      if (i === index) {
        this.npcs.splice(i, 1)
        break
      }
      this.npcs[i].index--
    }
    element.destroy()
  }

  applyProjectileAttack(projectile, index) {
    let target = this.map.getElementInMap(projectile.position.i, projectile.position.j)
    if (target.element === projectile.launcher) {
      return
    }
    let attack = projectile.getAttackData()
    let collide = this.applyAttack(target, attack)
    if (collide) {
      projectile.destroy()
      this.projectiles.splice(index, 1)
    }
  }

  throwProjectile(launcher, origin, target, speed, damage) {
    this.projectiles.push(new Projectile({
      scene: this,
      launcher: launcher,
      origin: origin,
      target: target,
      cellsByTurn: speed,
      timeToTransition: TIME_TO_ANIMATE,
      damage: damage,
      xOffset: this.xOffset,
      yOffset: this.yOffset,
      max: {
        i: this.map.cols - 1,
        j: this.map.rows - 1
      }
    }))
  }

  flashMessage(text, x, y, time) {
    let message = this.add.bitmapText(x, y - 5, 'kenney', text, 11)
    message.setOrigin(0.5)
    message.setRotation(Math.PI)
    setTimeout(() => {
      message.destroy()
    }, time)
  }
}

export {
  ORDER_CODES,
  BootScene
}