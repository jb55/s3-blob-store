'use strict';

var downloader = require('s3-download-stream');
var debug = require('debug')('s3-blob-store');
var mime = require('mime-types');
var uploadStream = require('s3-stream-upload');

/**
 * Create S3 blob store
 * @constructor
 * @param {Object} opts
 * @param {S3} opts.client S3 client
 * @param {String} opts.bucket bucket name
 */
function S3BlobStore (opts) {
  if (!(this instanceof S3BlobStore)) return new S3BlobStore(opts);
  opts = opts || {};
  if (!opts.client) throw Error('S3BlobStore client option required (aws-sdk AWS.S3 instance)');
  if (!opts.bucket) throw Error('S3BlobStore bucket option required');
  this.accessKey = opts.accessKey;
  this.secretKey = opts.secretKey;
  this.bucket = opts.bucket;
  this.s3 = opts.client;
}

/**
 * Create read stream
 * @param {ReadStreamOptions|String} opts options or object key
 * @returns {ReadableStream}
 *   readable stream of data for the file in your bucket whose key matches
 */
S3BlobStore.prototype.createReadStream = function (opts) {
  if (typeof opts === 'string') opts = { key: opts };
  var config = { client: this.s3, params: this.downloadParams(opts) };
  if (opts.concurrency) config.concurrency = opts.concurrency;
  if (opts.chunkSize) config.chunkSize = opts.chunkSize;
  var stream = downloader(config);
  // not sure if this a test bug or if I should be doing this in
  // s3-download-stream...
  stream.read(0);
  return stream;
};

S3BlobStore.prototype.uploadParams = function (opts) {
  opts = Object.assign({}, opts, {
    params: Object.assign({}, opts.params)
  });

  var filename = opts.name || opts.filename;
  var key = opts.key || filename;
  var contentType = opts.contentType;

  var params = opts.params;
  params.Bucket = params.Bucket || this.bucket;
  params.Key = params.Key || key;

  if (!contentType) {
    contentType = filename ? mime.lookup(filename) : mime.lookup(opts.key);
  }
  if (contentType) params.ContentType = contentType;

  return params;
};

S3BlobStore.prototype.downloadParams = function (opts) {
  var params = this.uploadParams(opts);
  delete params.ContentType;
  return params;
};

/**
 * Create write stream
 * @param {Options<WriteParams>|String} opts options or object key
 * @param {function(Error, { key: String })} done callback
 * @returns {WritableStream} writable stream that you can pipe data to
 */
S3BlobStore.prototype.createWriteStream = function (opts, s3opts, done) {
  if (typeof s3opts === 'function') {
    done = s3opts;
    s3opts = {};
  }
  if (typeof opts === 'string') opts = { key: opts };
  var params = this.uploadParams(opts);
  var out = uploadStream(this.s3, params);
  out.on('error', function (err) {
    debug('got err %j', err);
    done && done(err);
  });
  out.on('finish', function () {
    debug('uploaded');
    done && done(null, { key: params.Key });
  });
  return out;
};

/**
 * Remove object from store
 * @param {{ key: String }|String} opts options containing object key or just key
 * @param {function(Error)} done callback
 */
S3BlobStore.prototype.remove = function (opts, done) {
  var params = {}
  if (typeof opts === 'string') {
    params.Key = opts;
  } else {
    opts = Object.assign({}, opts, {
      params: Object.assign({}, opts.params)
    });
    params.Key = opts.key;
    params.Bucket = opts.params.Bucket || this.bucket;
  }
  this.s3.deleteObject(params, done);
  return this;
};

/**
 * Check if object exits
 * @param {{ key: String }|String} opts options containing object key or just key
 * @param {function(Error, Boolean)} done callback
 */
S3BlobStore.prototype.exists = function (opts, done) {
  if (typeof opts === 'string') opts = { key: opts };
  this.s3.headObject({ Bucket: this.bucket, Key: opts.key }, function (err, res) {
    if (err && err.statusCode === 404) return done(null, false);
    done(err, !err);
  });
};

module.exports = S3BlobStore;

/** @typedef {import('stream').Readable} ReadableStream */
/** @typedef {import('stream').Writeable} WriteableStream */

/**
 * @typedef {Object} Options
 * @property {String} key object key
 * @property {String} [name] `key` alias
 * @property {String} [filename] `key` alias
 * @property {S3Params} [params] additional S3 options
 * @template S3Params
 */

/**
 * [`Options`](#options) including `s3-stream-download` configuration
 * @typedef {Options<ReadParams> & S3StreamDownloaderOptions} ReadStreamOptions
 * @name ReadStreamOptions
 * @see https://github.com/jb55/s3-download-stream#api
 */

/**
 * S3 client
 * @typedef {import('aws-sdk').S3} S3
 * @name S3
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
 */

/**
 * S3 `getObject` params
 * @typedef {import('aws-sdk').S3.GetObjectRequest} ReadParams
 * @name ReadParams
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
 */

/**
 * S3 `putObject` params
 * @typedef {import('aws-sdk').S3.PutObjectRequest} WriteParams
 * @name WriteParams
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
 */
