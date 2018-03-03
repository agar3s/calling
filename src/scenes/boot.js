
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

class BootScene extends Phaser.Scene {
  constructor(test) {
    super({
      key: 'bootScene'
    })
  }

  preload() {
    this.load.spritesheet('tiles', '../assets/cavesofgallet_tiles.png', {frameWidth: 8, frameHeight: 8})
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

    let xOffset = 350
    let yOffset = 150
    console.log(basicMap)
    padding = 0
    let map = basicMap.split('\n').map(row => row.split(','))
    for (var j = 0; j < map.length; j++) {
      let y = yOffset + j * (ts * scale + padding)
      let row = map[j]
      for (var i = 0; i < row.length; i++) {
        let x = xOffset + i * (ts * scale + padding)
        let tile = row[i]
        let invert = (tile < 0)?-1:1
        let image = this.add.tileSprite(x, y, ts, ts, 'tiles', tile * invert)
        image.setScale(invert * scale, scale)
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
      frameRate: 3
    })

    this.add.sprite(xOffset + 50, yOffset, 'tiles').setScale(scale).play('flying-blue')
    this.add.sprite(xOffset + 250, yOffset + 60, 'tiles').setScale(scale).play('flying-red')
  }

  update (time, dt) {

  }
}

export default BootScene