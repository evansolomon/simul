var stream = require('stream')
var util = require('util')

var Futurus = require('futurus')

module.exports = Simul

function Simul(concurrency, options) {
  stream.Writable.call(this, options)

  this.queue = new Futurus(concurrency, function (task, done) {
    try {
      this._parallelWrite(task.data, task.enc, done)
    } catch (e) {
      done(e)
    }
  }.bind(this))

  var hasFinished = false
  this.on('finish', function () {
    hasFinished = true
  }.bind(this))

  this.queue.on('drain', function () {
    if (hasFinished) {
      this.emit('close')
    }
  }.bind(this))
}
util.inherits(Simul, stream.Writable)

Simul.prototype._write = function (data, enc, cb) {
  if (this.queue.isReady()) {
    cb()
    cb = this._emitIfError.bind(this)
  }

  this.queue.push({
    data: data,
    enc: enc
  }, cb)
}

Simul.prototype._parallelWrite = function () {
  throw new Error('This should be implemented by child classes')
}

Simul.prototype._emitIfError = function (e) {
  if (e != null) {
    this.emit('error', e)
  }
}

Simul.extend = function (parallelWrite, concurrency, options) {
  var Ctor = function () {
    Simul.call(this, concurrency, options)
  }

  util.inherits(Ctor, Simul)

  Ctor.prototype._parallelWrite = parallelWrite

  return new Ctor()
}
