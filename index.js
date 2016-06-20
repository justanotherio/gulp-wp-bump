'use strict';
var stream = require('stream');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var wpBump = require('wp-bump');

function gulpWpBump(functionsPhp) {

    var gulpStream = new stream.Transform({objectMode: true});

    gulpStream._transform = function(file, unused, callback) {

        if ( file.isNull() ) {
            cb(null, file);
            return;
        }

        if ( file.isStream() ) {
            cb(new gutil.PluginError('gulp-wp-bump', 'Streaming not supported'));
            return;
        }

        fs.readFile(functionsPhp, {encoding: 'utf-8'}, function(err, data){

            if ( err ) {
                callback( new gutil.PluginError('gulp-wp-bump', err) );
            } else {
                var gulpPath = path.parse(file.path);
                var fileName = gulpPath.base;

                var revisedFile = wpBump(fileName, data);

                if ( revisedFile == data ) {
                    gutil.log('gulp-wp-bump: File revision not committed');
                }

                fs.writeFile(functionsPhp, revisedFile, function(err){

                    if (err) {
                        callback( new gutil.PluginError('gulp-wp-bump', err) );
                    } else {
                        callback(null, file);
                    }

                });

            }

        });

    }

    return gulpStream;

}

module.exports = gulpWpBump;
