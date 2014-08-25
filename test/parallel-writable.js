var simul = require('../')

exports.writeInParallel = function (test) {
  var delayedWrite = function (data, enc, callback) {
    setTimeout(callback, 10)
  }

  var two = simul.Writable.extend(delayedWrite, 2)
  var ten = simul.Writable.extend(delayedWrite, 10)

  var tenDone = false
  var twoDone = false

  ten.on('close', function () {
    test.ok(! twoDone)
    tenDone = true
  })

  two.on('close', function () {
    test.ok(tenDone)
    test.done()
  })

  for (var i = 0; i < 100; i++) {
    ten.write(i.toString())
    two.write(i.toString())
  }

  ten.end()
  two.end()

}
