'use strict';

var format = require('util').format;
var blobTests = require('abstract-blob-store/tests');
var test = require('tape');
var AWS = require('aws-sdk');
var s3 = require('./');
var S3erver = require('s3rver');
var tmpDir = require('tmp').dirSync();

var S3_BUCKET = 'test-bucket';

var server = new S3erver({
  directory: tmpDir.name,
  silent: true,
  configureBuckets: [{
    name: S3_BUCKET
  }]
});

server.run(function (err, options) {
  if (err) throw err;

  var serverUrl = format('http://%s:%d', options.address, options.port);

  var client = new AWS.S3({
    accessKeyId: 'S3RVER',
    secretAccessKey: 'S3RVER',
    endpoint: new AWS.Endpoint(serverUrl),
    sslEnabled: false,
    s3ForcePathStyle: true
  });

  var store = s3({
    client: client,
    bucket: S3_BUCKET
  });

  var common = {
    setup: function (_t, cb) {
      cb(null, store);
    },
    teardown: function (_t, store, blob, cb) {
      if (blob) store.remove(blob, cb);
      else cb();
    }
  };

  blobTests(test, common);

  test('works without callback', function (t) {
    t.plan(1);
    var writer = store.createWriteStream({ key: 'test5.txt' });
    writer.write('abc');
    writer.end();

    writer.on('error', function (err) {
      t.error(err);
    });

    writer.on('finish', function () {
      t.ok(true);
    });
  });

  test('does NOT mutate upload params', function (t) {
    t.plan(1);
    var params = { ACL: 'public-read' };
    var writer = store.createWriteStream({ key: 'test6.txt', params });
    writer.write('abc');
    writer.end();

    writer.on('error', function (err) {
      t.error(err);
    });

    writer.on('finish', function () {
      t.notOk(params.Key);
    });
  });

  test.onFinish(function () {
    server.close();
    tmpDir.removeCallback();
  });
});
