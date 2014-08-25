import stream = require('stream')
import util = require('util')

import futurus = require('../node_modules/futurus/index')

export class Writable extends stream.Writable implements ParallelWritable {
  private queue:futurus.Queue
  private hasFinished:boolean

  static extend(write:WriteMethod, concurrency:number, options?:Object) : Writable {

    var writable = new Writable(concurrency, options)
    writable._parallelWrite = write

    return writable
  }

  constructor(concurrency:number, options?:Object) {
    super(options)

    var worker = (task:Task, done:futurus.Errback) : void => {
      try {
        this._parallelWrite(task.data, task.enc, done)
      } catch (e) {
        done(e)
      }
    }
    this.queue = new futurus.Queue(concurrency, worker)

    this.hasFinished = false

    this.on('finish', () : void => {
      this.hasFinished = true
    })

    this.queue.on('drain', () : void => {
      if (this.hasFinished) {
        this.emit('close')
      }
    })
  }

  _parallelWrite(data:any, enc:string, done:futurus.Errback) : void {
    throw new Error('This should be implemented by child classes')
  }

  _write(data:any, enc:string, cb:futurus.Errback) : void {
    if (this.queue.isReady()) {
      cb()
      cb = this._emitIfError.bind(this)
    }

    var task:Task = {data: data, enc: enc}
    this.queue.push(task, cb)
  }

  private _emitIfError(err?:Error) : void {
    if (err != null) {
      this.emit('error', err)
    }
  }
}

interface Task {
  data:any
  enc:string
}

export interface ParallelWritable {
  _parallelWrite:WriteMethod
}

export interface WriteMethod {
  (data:any, enc:string, done:futurus.Errback) : void
}
