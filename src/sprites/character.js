import Attributes from './attributes'

const SCALE = 2
const WIDTH = 16

export default class Character {
  constructor (config) {
    let scene = config.scene
    let x = config.x
    let y = config.y
    this.sprite = scene.add.sprite(x-WIDTH*SCALE*0.5, y-WIDTH*SCALE*0.5, 'characters')
    this.sprite.setOrigin(0.5, 0.5)

    this.positionIndex = {i: 0, j: 0}
    this.speed = {x: 0, y: 0}
    this.acceleration = {x: 0, y: 0}

    this.fixPositionToGrid()

    this.timeFromTransition = 0
    this.fixedTimeForTransition = 0
    this.attributes = new Attributes({})
    this.animations = config.animations
    this.sprite.setScale(SCALE).play(this.animations[0])

      this.actionRange = 2
  }

  update (dt) {
    if(!dt) {
      dt = this.fixedTimeForTransition - this.timeFromTransition
    }
    this.timeFromTransition += dt
    this.speed.y += this.acceleration.y * dt
    this.sprite.x +=  this.speed.x*dt
    this.sprite.y +=  this.speed.y*dt
  }

  jump (transitionTime, surrondings) {
    for (var i = 0; i < surrondings.length; i++) {
      console.log(surrondings[i].map(s=>s?s.rigid:true))
    }
    let center = this.actionRange
    let desiredHigh = 2
    if(!surrondings[center-1][center] || surrondings[center-1][center].rigid) {
      desiredHigh = 0
    } else if(!surrondings[center-2][center] || surrondings[center-2][center].rigid) {
      desiredHigh = 1
    }
    // vy = (h2 - h1) / t
    let gravityDistance = 3
    let yDistance = (-desiredHigh - gravityDistance/2)*WIDTH*SCALE
    this.speed.y = yDistance/transitionTime
  }

  down (transitionTime) {
    this.speed.y = 0
  }

  turnLeft (transitionTime, surrondings) {
    this.sprite.setScale(-1*(SCALE), SCALE)
    let center = this.actionRange
    let steps = 1
    if(!surrondings[center][center-1] || surrondings[center][center-1].rigid) {
      steps = 0
    } else if((!surrondings[center+1][center] || !surrondings[center+1][center].rigid) && (!surrondings[center+1][center-1] || surrondings[center+1][center-1].rigid)) {
      steps = 0
    }
    this.speed.x = -WIDTH*SCALE*steps/transitionTime
  }

  turnRight (transitionTime, surrondings) {
    this.sprite.setScale((SCALE), SCALE)
    let center = this.actionRange
    let steps = 1
    if(!surrondings[center][center+1] || surrondings[center][center+1].rigid) {
      steps = 0
    } else if((!surrondings[center+1][center] || !surrondings[center+1][center].rigid) && (!surrondings[center+1][center+1] || surrondings[center+1][center+1].rigid)) {
      steps = 0
    }

    this.speed.x = WIDTH*SCALE*steps/transitionTime
  }

  jumpLeft (transitionTime, surrondings) {
    for (var i = 0; i < surrondings.length; i++) {
      console.log(surrondings[i].map(s=>s?s.rigid:true))
    }
    let center = this.actionRange
    let desiredHigh = 2
    if(!surrondings[center-1][center] || surrondings[center-1][center].rigid) {
      desiredHigh = 0
    } else if(!surrondings[center-2][center-1] || surrondings[center-2][center-1].rigid) {
      desiredHigh = 1
    }
    // vy = (h2 - h1) / t
    let gravityDistance = 3
    let yDistance = (-desiredHigh - gravityDistance/2)*WIDTH*SCALE
    this.speed.y = yDistance/transitionTime

    this.sprite.setScale(-1*(SCALE), SCALE)
    this.speed.x = -WIDTH*SCALE/transitionTime
  }

  jumpRight (transitionTime, surrondings) {
    for (var i = 0; i < surrondings.length; i++) {
      console.log(surrondings[i].map(s=>s?s.rigid:true))
    }
    let center = this.actionRange
    let desiredHigh = 2
    if(!surrondings[center-1][center] || surrondings[center-1][center].rigid) {
      desiredHigh = 0
    } else if(!surrondings[center-2][center+1] || surrondings[center-2][center+1].rigid) {
      desiredHigh = 1
    }
    // vy = (h2 - h1) / t
    let gravityDistance = 3
    let yDistance = (-desiredHigh - gravityDistance/2)*WIDTH*SCALE
    this.speed.y = yDistance/transitionTime

    this.sprite.setScale((SCALE), SCALE)
    this.speed.x = WIDTH*SCALE/transitionTime
  }

  applyUpdates (transitionTime, surrondings) {
    let cellsToFall = 3
    let center = this.actionRange
    if(this.speed.y<0){
      cellsToFall = 3
    }else if(!surrondings[center+1][center] || surrondings[center+1][center].rigid) {
      cellsToFall = 0
    } else if(!surrondings[center+2][center] || surrondings[center+2][center].rigid) {
      cellsToFall = 1
    }
    this.fall(transitionTime, cellsToFall)
  }

  fall(transitionTime, cellsToFall) {
    this.acceleration.y = WIDTH*SCALE*(cellsToFall)/(transitionTime*transitionTime)
    
  }

  enableTime (transitionTime, factor) {
    this.fixPositionToGrid()
    this.timeFromTransition = 0
    this.fixedTimeForTransition = transitionTime
  }

  fixPositionToGrid () {
    let ts = WIDTH * SCALE
    let xIndex = ~~(this.sprite.x/ts)
    let yIndex = ~~(this.sprite.y/ts)
    this.positionIndex.i = (this.sprite.x - (xIndex*ts)) > (ts/2)? (xIndex + 1): xIndex
    this.positionIndex.j = (this.sprite.y - (yIndex*ts)) > (ts/2)? (yIndex + 1): yIndex

    this.sprite.x = this.positionIndex.i*ts
    this.sprite.y = this.positionIndex.j*ts
  }

  disableTime () {
   // if (this.sprite.body.velocity.y === 0) {
   //   this.sprite.anims.play('idle-red')
   // }
    this.fixPositionToGrid()
    this.speed.x = 0
    this.speed.y = 0
    this.acceleration.y = 0
    this.sprite.update()
  }

}