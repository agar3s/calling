
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

const KEYS = {
  UP: 1,
  LEFT: 2,
  RIGHT: 4
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
    this.player = this.physics.add.sprite(xOffset + 8*scale*6+4, yOffset + 8*scale*4+4, 'tiles')
    this.player.setScale(scale*0.7).play('idle-red')

    this.physics.add.collider(this.player, platforms)

    // control
    this.cursors = this.input.keyboard.createCursorKeys()

    // experimental turn based order
    this.order = 0
    this.turnTransition = 0

    this.turnUpdated = false
  }

  update (time, dt) {
    this.turnTransition -= dt
    if (this.turnTransition <= 0 && this.turnTransition > -150) {
      this.turn = 0
      if(this.turnUpdated) {
        return
      } 

      if(this.player.body.velocity.y==0){
        this.player.anims.play('idle-red')
      }
      this.player.setVelocityX(0)
      this.player.setVelocityY(0)
      this.player.setAccelerationY(0)
      this.turnUpdated = true
    } else if (this.turnTransition <= -150) {
      let actionTaken = false
      if (this.cursors.left.isDown) {
        this.player.setAccelerationY(1000)
        this.turnTransition = 300
        this.order =  KEYS.LEFT
        this.player.setScale((3*0.7), 3*0.7)
        actionTaken = true
      } else if (this.cursors.right.isDown) {
        this.player.setAccelerationY(1000)
        this.order =  KEYS.RIGHT
        this.turnTransition = 300
        this.player.setScale(-1*(3*0.7), 3*0.7)
        actionTaken = true
      }
      if (this.cursors.up.isDown) {
        this.player.setAccelerationY(1000)
        if(!actionTaken) this.order = 0
        this.order +=  KEYS.UP
        this.turnTransition = 300
        this.player.setVelocityY(-300)
        actionTaken = true
      }
      if (this.cursors.down.isDown) {
        this.player.setAccelerationY(1000)
        this.turnTransition = 300
        this.order = 0
        actionTaken = true
      }
      if(actionTaken){
        this.turnUpdated = false
      }

    } else {
      if ((this.order & KEYS.LEFT) >0) {
        this.player.setVelocityX(-80)
        this.player.anims.play('flying-red', true)
      } else if ((this.order & KEYS.RIGHT) >0) {
        this.player.setVelocityX(80)
        this.player.anims.play('flying-red', true)
      } else {
        this.player.setVelocityX(0)
      }
      if ((this.order & KEYS.UP) >0) {
        //this.player.setVelocityY(-80)
        this.player.anims.play('flying-red', true)
      }

    }

    /*if (this.cursors.up.isDown && this.player.body.touching.down) {
      console.log('ahh')
      this.player.setVelocityY(-350)
    }*/

  }
}

export default BootScene