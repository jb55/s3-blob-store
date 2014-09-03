

var blobTests = require('abstract-blob-store/tests');
var test = require('tape');
var aws = require('aws-sdk');
var s3 = require('./');

var client = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY
})

var common = {
  setup: function(t, cb) {
    var store = s3({
      client: client,
      bucket: process.env.S3_BUCKET
    })
    cb(null, store)
  },
  teardown: function(t, store, blob, cb) {
    if (blob) store.remove(blob, cb)
    else cb()
  }
}

blobTests(test, common);
