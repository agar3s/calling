let basicMap = 
`8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
1,2,8,8,8,8,0,1,1,2,8,0,1,1,2,8,8,8,8,8
2,2,8,8,8,8,0,6,6,2,8,0,6,6,2,8,8,8,8,8
2,8,8,8,3,4,0,6,6,2,8,0,6,6,2,8,8,8,8,8
2,8,8,8,8,9,0,6,6,2,8,0,6,6,2,8,8,8,8,8
1,1,1,1,1,1,5,6,6,2,8,0,6,6,7,1,1,1,1,1
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,8,8,8,0
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6,6
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6,6,6
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6,6,6
8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,6,6,6,6
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,6,6,6,6
6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6
6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6
6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6
6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6`


export default class Map {
  constructor (config) {
    let scene = config.scene
    let scale = config.scale
    let width = config.width
    let xOffset = config.xOffset
    let yOffset = config.yOffset
    let TS = scale * width //tileSize

    this.tiles = basicMap.split('\n').map(row => row.split(',').map(tile => parseInt(tile)))
    for (var j = 0; j < this.tiles.length; j++) {
      let y = yOffset + j * TS
      let row = this.tiles[j]
      for (var i = 0; i < row.length; i++) {
        let x = xOffset + i * TS
        let tile = row[i]
        let invert = (tile < 0)?-1:1
        scene.add.tileSprite(x, y, width, width, 'platforms', tile * invert).setScale(invert * scale, scale)
      }
    }

    this.grid = scene.add.graphics(0,0)
    this.grid.lineStyle(1, 0x220022, 0.05)
    this.grid.fillStyle(0x220022, 0.05)
    for (var j = 0; j < 50; j++) {
      for (var i = 0; i < 50; i++) {
        //this.grid.fillRect(i*SCALE*WIDTH + 1 - SCALE*WIDTH/2, j*SCALE*WIDTH + 1 - SCALE*WIDTH/2, SCALE*WIDTH - 2, SCALE*WIDTH - 2)
        this.grid.strokeRect(i*TS - TS/2, j*TS - TS/2, TS, TS)
      }
    }
  }

  getMapSurrondings (indexI, indexJ, range) {
    let map = []
    let row = -1
    for (var j = indexJ - range; j <= indexJ + range; j++) {
      map.push((new Array(range * 2 + 1)).fill(undefined))
      let col = -1
      row++
      if(j < 0) continue
      for (var i = indexI - range; i <= indexI + range; i++) {
        col++
        if(i < 0) continue
        map[row][col] = this.getTileProperties(this.tiles[j][i])
      }
    }
    return map
  }

  getTileProperties (type) {
    let properties = {
      rigid: true
    }
    if([8].indexOf(type)!=-1) {
      properties.rigid = false
    }
    return properties
  }

  getElementInMap (i, j) {
    return this.getTileProperties(this.tiles[j][i])
  }
}

class Tile {

}