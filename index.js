'use strict';

var downloader = require('s3-download-stream');
var debug = require('debug')('s3-blob-store');
var mime = require('mime-types');
var uploadStream = require('s3-stream-upload');
var util = require('util');

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
  this.bucket = opts.bucket;
  this.s3 = opts.client;
}

/**
 * Create read stream
 * @param {ReadStreamOptions|String} opts options or object key
 * @param {ReadParams} [s3opts] additional S3 options
 * @returns {ReadableStream}
 *   readable stream of data for the file in your bucket whose key matches
 */
S3BlobStore.prototype.createReadStream = function (opts, s3opts) {
  if (typeof opts === 'string') opts = { key: opts };
  var config = { client: this.s3, params: this._s3params(opts, s3opts) };
  if (opts.concurrency) config.concurrency = opts.concurrency;
  if (opts.chunkSize) config.chunkSize = opts.chunkSize;
  var stream = downloader(config);
  // not sure if this a test bug or if I should be doing this in
  // s3-download-stream...
  stream.read(0);
  return stream;
};

/**
 * Create write stream
 * @param {Options<WriteParams>|String} opts options or object key
 * @param {WriteParams} [s3opts] additional S3 options
 * @param {function(Error, { key: String })} done callback
 * @returns {WritableStream} writable stream that you can pipe data to
 */
S3BlobStore.prototype.createWriteStream = function (opts, s3opts, done) {
  if (typeof s3opts === 'function') {
    done = s3opts;
    s3opts = {};
  }
  if (typeof opts === 'string') opts = { key: opts };
  var params = this._s3params(opts, s3opts);
  var contentType = (opts && opts.contentType) || mime.lookup(params.Key);
  if (contentType) params.ContentType = contentType;
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
 * @param {Options<RemoveParams>|String} opts options or object key
 * @param {RemoveParams} [s3opts] additional S3 options
 * @param {function(Error)} done callback
 */
S3BlobStore.prototype.remove = function (opts, s3opts, done) {
  if (typeof s3opts === 'function') {
    done = s3opts;
    s3opts = {};
  }
  if (typeof opts === 'string') opts = { key: opts };
  var params = this._s3params(opts, s3opts);
  this.s3.deleteObject(params, done);
  return this;
};

/**
 * Check if object exits
 * @param {Options<ExistsParams>|String} opts options or object key
 * @param {ExistsParams} [s3opts] additional S3 options
 * @param {function(Error, Boolean)} done callback
 */
S3BlobStore.prototype.exists = function (opts, s3opts, done) {
  if (typeof s3opts === 'function') {
    done = s3opts;
    s3opts = {};
  }
  if (typeof opts === 'string') opts = { key: opts };
  var params = this._s3params(opts, s3opts);
  this.s3.headObject(params, function (err, _res) {
    if (err && err.statusCode === 404) return done(null, false);
    done(err, !err);
  });
};

S3BlobStore.prototype._s3params = function (opts, s3opts) {
  opts = opts || {};
  opts.params = s3opts || opts.params || {};
  var key = opts.key || opts.name || opts.filename;
  var params = Object.assign({}, opts.params, {
    Bucket: opts.params.Bucket || this.bucket,
    Key: opts.params.Key || key
  });
  return params;
};

S3BlobStore.prototype.uploadParams = util.deprecate(function (opts) {
  opts = opts || {};
  var params = this._s3params(opts);
  var contentType = opts.contentType || mime.lookup(params.Key);
  if (contentType) params.ContentType = contentType;
  return params;
}, 'S3BlobStore#uploadParams(opts) is deprecated and will be removed in upcoming v5!');

S3BlobStore.prototype.downloadParams = util.deprecate(function (opts) {
  return this._s3params(opts);
}, 'S3BlobStore#downloadParams(opts) is deprecated and will be removed in upcoming v5!');

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

/**
 * S3 `deleteObject` params
 * @typedef {import('aws-sdk').S3.DeleteObjectRequest} RemoveParams
 * @name RemoveParams
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property
 */

/**
 * S3 `headObject` params
 * @typedef {import('aws-sdk').S3.HeadObjectRequest} ExistsParams
 * @name ExistsParams
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property
 */
