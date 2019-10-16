var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var cors = require('cors');
app.use(cors());
app.options('*', cors())
form.maxFileSize = 10 * 1024 * 1024 * 1024;
app.use(express.static(__dirname));
app.use(bodyParser.json()); // <--- Here
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', indexRouter);
app.use('/users', usersRouter);

var multiparty = require('multiparty');
var fs = require('fs');
var AWS = require('aws-sdk');
var async = require('async');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.post('/upload', (req, res) => {

  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
      uploadFile(fields, files, (error, response) => {
          if (error) {
            res.send(error);
          } else {
            res.send(response);
          }
        });
  })
  function uploadFile(fields, files, callback) {
      try {
          let responseData = [];
          // let _this = this;
          var length = files['fileKey'].length
          async.forEach(files['fileKey'], function (item) {
              upload(item, fields, function (data, err) {
                  if (data) {
                      responseData.push(data);
                      length--;
                      if (length <= 0) {
                          
                          callback(null, { status: "success", msg: "Files uploaded successfully", data: responseData });
                      }
                  } else {
                      callback(err, { status: "error" });
                  }
              });
          })
      } catch (error) {
          callback(null, { status: "error", e: error });
      }

  }
  function upload(item, fields, callback) {
      try {
          var s3 = new AWS.S3({
              accessKeyId: 'BUCKET_NAME',
              secretAccessKey: 'ACCESS_KEY'
          });
          readFile(item.path, item).then((resp, err) => {
              console.log(item);
              // return;
              if (resp) {
                  const input = {
                      Bucket: "BUCKET_NAME", // pass your bucket name
                      Key: "original_file_name", 
                      Body: resp.result,
                      ContentType: 'image/png'
                  };
                  s3.upload(input, function (s3Err, data) {
                      if (s3Err) {
                          callback(null, { status: "error", msg: "Error occurred in uploading file", error: s3Err });
                      }
                      else {
                          console.log(
                              `The URL is ${s3.getSignedUrl('getObject', { Bucket: "BUCKET_NAME", Key: resp.fileData.originalFilename })}`
                            )
                            var resparams = {
                                "s3url":`${s3.getSignedUrl('getObject', { Bucket: "BUCKET_NAME", Key: resp.fileData.originalFilename })}`,
                                "data": data,
                                "originalname":resp.fileData.originalFilename
                            }
                          callback(resparams)
                      }
                  });
              } else {
                  callback(err);
              }
          });
      } catch (error) {
          callback(null, { status: "error", e: error });
      }
  }
  function readFile(file, fileData) {
      try {
          return new Promise((resolve, reject) => {
              fs.readFile(file, (err, data) => {
                  if (data) {
                      var result = {
                          fileData: fileData,
                          result: data
                      }
                      resolve(result);
                  } else {
                      reject(err);
                  }
              })
          })
      } catch (error) {
          callback(null, { status: "error", e: error });
      }
  }
});
module.exports = app;
