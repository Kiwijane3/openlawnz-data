// this app should convert pdf to html and store in a bucket
// next step - get pdf from bucket, convert to html, store in bucket
// then - get lots of pdfs from bucket, convert each, store in bucket

"use strict";

var pdftohtml = require('pdftohtmljs');
var s3 = require('s3');

// Convert a file from PDF to HTML
function doConvert(fileName, fileOutput){
    console.log("Converting..");    
    var converter = new pdftohtml(fileName, fileOutput);
    // See presets (ipad, default) 
    // Feel free to create custom presets 
    // see https://github.com/fagbokforlaget/pdftohtmljs/blob/master/lib/presets/ipad.js 
    // convert() returns promise 
    converter.convert('ipad').then(function() {
        console.log("Success");
        }).catch(function(err) {
        console.error("Conversion error: " + err);
    });
}
doConvert('../convert/175.pdf', '../conversions/175-2.html');

// create s3 client

function dos3stuff() {
    var client = s3.createClient({
    maxAsyncS3: 20,     // this is the default 
    s3RetryCount: 3,    // this is the default 
    s3RetryDelay: 1000, // this is the default 
    multipartUploadThreshold: 20971520, // this is the default (20 MB) 
    multipartUploadSize: 15728640, // this is the default (15 MB) 
    s3Options: {
        accessKeyId: "",
        secretAccessKey: "",
    },
    });

    // take the converted file and copy it to s3
    var params = {
    localFile: '../conversions/175-2.html',
    
    s3Params: {
        Bucket: "nzhc-pdfs",
        Key: "file-upload-test/175-2.html",
        // other options supported by putObject, except Body and ContentLength. 
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property 
    },
    };
    var uploader = client.uploadFile(params);
    uploader.on('error', function(err) {
    console.error("unable to upload:", err.stack);
    });
    uploader.on('progress', function() {
    console.log("progress", uploader.progressMd5Amount,
                uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
    console.log("done uploading");
    });

    }

dos3stuff();