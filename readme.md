
# s3-blob-store

  Amazon S3 [abstract-blob-store](http://npmrepo.com/abstract-blob-store)

  [![Build Status](https://travis-ci.org/jb55/s3-blob-store.svg)](https://travis-ci.org/jb55/s3-blob-store)

## Installation

  Install with npm

    $ npm install s3-blob-store

## Example

```js
var aws = require('aws-sdk');
var s3blobs = require('s3-blob-store');

var client = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY
})

var store = s3blobs({
  client: client,
  bucket: 'mybucket'
});


// write to s3
fs.createReadStream('/tmp/somefile.txt')
  .pipe(store.createWriteStream({ key: 'somefile.txt' }))


// read from s3
store.createReadStream({ key: 'somefile.txt' })
  .pipe(fs.createWriteStream('/tmp/somefile.txt'))

// exists
store.exists({ key: 'somefile.txt' }, function(err, exists){
})
```

## API

### var s3 = require('s3-blob-store')(options)

`options` must be an object that has the following properties:

`client`: an `require('aws-sdk').S3` instance
`bucket`: your bucket

### s3.createWriteStream(options, cb)

returns a writable stream that you can pipe data to. 

`options` should be an object that has options `key` (will be the filename in your bucket)

`cb` will be called with `(err)` if there is was an error

### s3.createReadStream(opts)

opts should be `{key: string (usually a hash or path + filename}`

returns a readable stream of data for the file in your bucket whose key matches

## License

    The MIT License (MIT)

    Copyright (c) 2014 William Casarin

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
