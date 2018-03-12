import 'phaser'
import {BootScene} from './scenes/boot'

let config = {
  type: Phaser.WEBGL,
  parent: 'content',
  width: 20*32,
  height: 12*32,
  scaleMode: 1,
  pixelArt: true,
  backgroundColor: 0x111111,
  scene: [
    BootScene
  ]
}

let game = new Phaser.Game(config)