import 'phaser'
import BootScene from './scenes/boot'

let config = {
  type: Phaser.WEBGL,
  parent: 'content',
  width: 4*250,
  height: 3*250,
  scaleMode: 1,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  backgroundColor: 0x212443,
  scene: [
    BootScene
  ]
}

let game = new Phaser.Game(config)