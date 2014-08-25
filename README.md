# Simul

[![Build Status](https://secure.travis-ci.org/evansolomon/simul.svg?branch=master)](http://travis-ci.org/evansolomon/simul)

 > At the same time

Create Node.js writable streams that process data in parallel.

This should only be used for streams where chunks are completely independent.

## Example

```js
var simul = require('./index')

var parallelWrite = function (data, enc, done) {
  setTimeout(function () {
    console.log(data.toString())
    done()
  }, Math.random() * 2000)
}

var writable = simul.Writable.extend(parallelWrite, 5, {objectMode: true})
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
