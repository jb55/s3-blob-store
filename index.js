
var downloader = require('s3-download-stream');
var debug = require('debug')('s3-blob-store');
var mime = require('mime-types');
var through = require('through2');

function S3BlobStore(opts) {
  if (!(this instanceof S3BlobStore)) return new S3BlobStore(opts);
  opts = opts || {};
  if (!opts.client) throw Error("S3BlobStore client option required (aws-sdk AWS.S3 instance)");
  if (!opts.bucket) throw Error("S3BlobStore bucket option required");
  this.accessKey = opts.accessKey;
  this.secretKey = opts.secretKey;
  this.bucket = opts.bucket;
  this.s3 = opts.client;
}

S3BlobStore.prototype.createReadStream = function(opts) {
  if (typeof opts === 'string') opts = {key: opts}
  if (opts.range) return this.createRangeReadStream(opts);
  var config = { client: this.s3, params: this.downloadParams(opts) };
  var stream = downloader(config);
  // not sure if this a test bug or if I should be doing this in
  // s3-download-stream...
  stream.read(0);
  return stream;
}

S3BlobStore.prototype.createRangeReadStream = function(opts) {
  // Use regulare s3 download instead of s3-download-stream for range downloads
  var params = this.downloadParams(opts);
  params.Range = 'bytes=' + opts.range.start + '-' + opts.range.end;
  return this.s3.getObject(params).createReadStream();
}

S3BlobStore.prototype.uploadParams = function(opts) {
  opts = opts || {};

  var params = opts.params || {};
  var filename = opts.name || opts.filename;
  var key = opts.key || filename;
  var contentType = opts.contentType;

  params.Bucket = params.Bucket || this.bucket;
  params.Key = params.Key || key;

  if (!contentType) {
    contentType = filename? mime.lookup(filename) : mime.lookup(opts.key)
  }
  if (contentType) params.ContentType = contentType;

  return params;
}

S3BlobStore.prototype.downloadParams = function(opts) {
  var params = this.uploadParams(opts);
  delete params.ContentType;
  return params;
}


S3BlobStore.prototype.createWriteStream = function(opts, s3opts, done) {
  if (typeof(s3opts) === 'function') {
    done = s3opts;
    s3opts = {};
  }
  if (typeof opts === 'string') opts = {key: opts}
  var params = this.uploadParams(opts)
  var proxy = through();
  proxy.pause();

  params.Body = proxy;
  // var s3opts = {partSize: 10 * 1024 * 1024, queueSize: 1};
  this.s3.upload(params, s3opts, function(err, data) {
    if (err) {
      debug('got err %j', err);
      if (done) {
        return done(err)
      }
      proxy.emit('error', err)
    }

    debug('uploaded %j', data);
    done && done(null, { key: params.Key })
  });
  return proxy;
}

S3BlobStore.prototype.remove = function(opts, done) {
  this.s3.deleteObject({ Bucket: this.bucket, Key: opts.key }, done)
  return this;
}

S3BlobStore.prototype.exists = function(opts, done) {
  if (typeof opts === 'string') opts = {key: opts}
  this.s3.headObject({ Bucket: this.bucket, Key: opts.key }, function(err, res){
    if (err && err.statusCode === 404) return done(null, false);
    done(err, !err)
  });
}

module.exports = S3BlobStore;
