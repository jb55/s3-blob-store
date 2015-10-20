

var blobTests = require('abstract-blob-store/tests');
var test = require('tape');
var aws = require('aws-sdk');
var s3 = require('./');

var client = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY
})

var store = s3({
  client: client,
  bucket: process.env.S3_BUCKET
})

var common = {
  setup: function(t, cb) {
    cb(null, store)
  },
  teardown: function(t, store, blob, cb) {
    if (blob) store.remove(blob, cb)
    else cb()
  }
}

blobTests(test, common);

test('works without callback', function(t){
  t.plan(1);
  var writer = store.createWriteStream({ key: 'test5.txt' });
  writer.push("abc");
  writer.push(null);

  writer.on('error', function(ee){
    t.error(e)
  });

  writer.on('end', function(){
    t.ok(true);
  });
});

test('should emit error event when key does not exist', function(t){
  t.plan(1);
  var readStream = store.createReadStream({ key: 'nonexistingkey' });
  readStream.on('error', function(err){
    t.equal(err.code, 'NoSuchKey');
  });
});

