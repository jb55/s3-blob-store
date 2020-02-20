# s3-blob-store [![build status](https://badgen.net/travis/jb55/s3-blob-store/master)](https://travis-ci.com/jb55/s3-blob-store) [![install size](https://badgen.net/packagephobia/install/s3-blob-store)](https://packagephobia.now.sh/result?p=s3-blob-store) [![npm package version](https://badgen.net/npm/v/s3-blob-store)](https://npm.im/s3-blob-store) [![github license](https://badgen.net/github/license/jb55/s3-blob-store)](https://github.com/jb55/s3-blob-store/blob/master/LICENSE) [![js semistandard style](https://badgen.net/badge/code%20style/semistandard/pink)](https://github.com/Flet/semistandard)

Amazon S3 [abstract-blob-store](http://npmrepo.com/abstract-blob-store)

[![blob-store-compatible](https://raw.githubusercontent.com/maxogden/abstract-blob-store/master/badge.png)](https://github.com/maxogden/abstract-blob-store)

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
});

var store = s3blobs({
  client: client,
  bucket: 'mybucket'
});

// write to s3
fs.createReadStream('/tmp/somefile.txt')
  .pipe(store.createWriteStream({ key: 'somefile.txt' }));

// read from s3
store.createReadStream({ key: 'somefile.txt' })
  .pipe(fs.createWriteStream('/tmp/somefile.txt'));

// remove
store.remove({ key: 'somefile.txt' }, function (err) {
   // ...
});

// exists
store.exists({ key: 'somefile.txt' }, function (err, exists) {
  // ...
});
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [S3BlobStore](#s3blobstore)
    -   [Parameters](#parameters)
    -   [createReadStream](#createreadstream)
        -   [Parameters](#parameters-1)
    -   [createWriteStream](#createwritestream)
        -   [Parameters](#parameters-2)
    -   [remove](#remove)
        -   [Parameters](#parameters-3)
    -   [exists](#exists)
        -   [Parameters](#parameters-4)
-   [ExistsParams](#existsparams)
-   [ReadStreamOptions](#readstreamoptions)
-   [S3](#s3)
-   [ReadParams](#readparams)
-   [WriteParams](#writeparams)
-   [RemoveParams](#removeparams)
-   [Options](#options)
    -   [Properties](#properties)

### S3BlobStore

Create S3 blob store

#### Parameters

-   `opts` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `opts.client` **[S3](#s3)** S3 client
    -   `opts.bucket` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** bucket name

#### createReadStream

Create read stream

##### Parameters

-   `opts` **([ReadStreamOptions](#readstreamoptions) \| [String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** options or object key
-   `s3opts` **[ReadParams](#readparams)?** additional S3 options

Returns **ReadableStream** readable stream of data for the file in your bucket whose key matches

#### createWriteStream

Create write stream

##### Parameters

-   `opts` **([Options](#options)&lt;[WriteParams](#writeparams)> | [String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** options or object key
-   `s3opts` **[WriteParams](#writeparams)?** additional S3 options
-   `done` **function ([Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), {key: [String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)})** callback

Returns **WritableStream** writable stream that you can pipe data to

#### remove

Remove object from store

##### Parameters

-   `opts` **([Options](#options)&lt;[RemoveParams](#removeparams)> | [String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** options or object key
-   `s3opts` **[RemoveParams](#removeparams)?** additional S3 options
-   `done` **function ([Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error))** callback

#### exists

Check if object exits

##### Parameters

-   `opts` **([Options](#options)&lt;[ExistsParams](#existsparams)> | [String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** options or object key
-   `s3opts` **[ExistsParams](#existsparams)?** additional S3 options
-   `done` **function ([Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), [Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean))** callback

### 

### 

### ExistsParams

-   **See: <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property>**

S3 `headObject` params

### ReadStreamOptions

-   **See: <https://github.com/jb55/s3-download-stream#api>**

[`Options`](#options) including `s3-stream-download` configuration

### S3

-   **See: <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html>**

S3 client

### ReadParams

-   **See: <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property>**

S3 `getObject` params

### WriteParams

-   **See: <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property>**

S3 `putObject` params

### RemoveParams

-   **See: <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property>**

S3 `deleteObject` params

### Options

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** object key
-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** `key` alias
-   `filename` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** `key` alias
-   `params` **S3Params?** additional S3 options
