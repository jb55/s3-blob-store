

var blobTests = require('abstract-blob-store/tests');
var test = require('tape');
var s3 = require('./');

var tokens = {
  bucket: process.env.S3_BUCKET,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY
}

var common = {
  setup: function(t, cb) {
    var store = s3(tokens)
    cb(null, store)
  },
  teardown: function(t, store, blob, cb) {
    if (blob) store.remove(blob, cb)
    else cb()
  }
}

blobTests(test, common);
