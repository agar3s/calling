
export default class Map {
  constructor (params) {
    let scene = params.scene
    let scale = params.scale
    let width = params.width
    let xOffset = params.xOffset
    let yOffset = params.yOffset
    let TS = scale * width //tileSize
    this.rows = 0
    this.cols = 0

    this.tiles = basicMap.split('\n').map(row => row.split(',').map(tile => parseInt(tile)))
    for (var j = 0; j < this.tiles.length; j++) {
      let row = this.tiles[j]
      for (var i = 0; i < row.length; i++) {
        row[i] = new Tile({
          scene: params.scene,
          tile: row[i],
          i: i,
          j: j,
          xOffset: xOffset,
          yOffset: yOffset,
          width: width,
          scale: scale
        })
      }
    }
    this.rows = this.tiles.length
    this.cols = this.tiles[0].length

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
      if(j < 0 || j >= this.rows) continue
      for (var i = indexI - range; i <= indexI + range; i++) {
        col++
        if(i < 0 || i >= this.cols) continue
        map[row][col] = this.tiles[j][i].properties
      }
    }
    return map
  }

  getElementInMap (i, j) {
    return this.tiles[j][i].getElement()
  }

  setElement (i, j, element) {
    this.tiles[j][i].setElement(element)
  }

  updateCharacterLocation (character) {
    if (!character.changedPosition()) return
    let current = character.position
    let future = character.futurePosition
    this.setElement(current.i, current.j)
    this.setElement(future.i, future.j, character)
  }
}

class Tile {
  constructor (params) {
    this.tile = params.tile
    this.i = params.i
    this.j = params.j
    this.xOffset = params.xOffset
    this.yOffset = params.yOffset
    this.scale = params.scale
    this.width = params.width
    let TS = this.scale * this.width
    this.x = this.xOffset + this.i * TS
    this.y = this.yOffset + this.j * TS

    let invert = (this.tile < 0)?-1:1
    params.scene.add.tileSprite(
      this.x,
      this.y,
      this.width,
      this.width,
      'platforms',
      this.tile * invert
    ).setScale(invert * this.scale, this.scale)

    this.properties = tileProperties[this.tile]
    this.element = undefined
  }

  getElement () {
    let type = this.element?this.element.type:'tile'
    let element =  this.element || this.properties
    return {type, element}
  }

  setElement (element) {
    this.element = element
  }

  
}

let basicMap = 
`6,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,6
6,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,6
6,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,6
6,1,2,8,8,8,8,0,1,1,2,8,0,1,1,2,8,8,8,8,8,6
6,2,2,8,8,8,8,0,6,6,2,8,0,6,6,2,8,8,8,8,8,6
6,2,8,8,8,3,4,0,6,6,2,8,0,6,6,2,8,8,8,8,8,6
6,2,8,8,8,8,9,0,6,6,2,8,0,6,6,2,8,8,8,8,8,6
6,1,1,1,1,1,1,5,6,6,2,1,0,6,6,7,1,1,1,1,1,6`

let tileProperties = {
  '0': {
    rigid: true,
    traspasable: false,
  },
  '1': {
    rigid: true,
    traspasable: false
  },
  '2': {
    rigid: true,
    traspasable: false
  },
  '3': {
    rigid: true,
    traspasable: true
  },
  '4': {
    rigid: true,
    traspasable: true
  },
  '5': {
    rigid: true,
    traspasable: false
  },
  '6': {
    rigid: true,
    traspasable: false
  },
  '7': {
    rigid: true,
    traspasable: false
  },
  '8': {
    rigid: false,
    traspasable: true
  },
  '9': {
    rigid: false,
    traspasable: true
  }
}