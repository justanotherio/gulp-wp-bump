'use strict';
var stream = require('stream');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var wpBump = require('wp-bump');

function gulpWpBump(functionsPhp) {
    
    // Check to see there is a valid functions.php file
    try {
        var input = fs.statSync(functionsPhp);

        if ( !input.isFile() ) {
            throw new gutil.PluginError('gulp-wp-bump', 'Requires valid functions.php file');
        }

    } catch (e) {
        throw new gutil.PluginError('gulp-wp-bump', 'Requires valid functions.php file');
    }

    var gulpStream = new stream.Transform({objectMode: true});

    gulpStream._transform = function(file, unused, callback) {

        if ( file.isNull() ) {
            return callback( null, file );
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
