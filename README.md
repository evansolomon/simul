# Simul

 > At the same time

Create Node.js writable streams that process data in parallel.

```js
var Simul = require('./index')

var parallelWrite = function (data, enc, done) {
  setTimeout(function () {
    console.log(data.toString())
    done()
  }, Math.random() * 2000)
}

var writable = Simul.extend(parallelWrite, 5, {objectMode: true})
writable.write(1)
writable.write(2)
writable.write(3)
writable.write(4)
writable.write(5)
writable.write(6)
writable.end(7)

// '4'
// '1'
// '3'
// '2'
// '5'
// '6'
// '7'
```