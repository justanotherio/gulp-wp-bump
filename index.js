'use strict';
var stream = require('stream');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var gutil = require('gulp-util');

function bumpVersion(match) {
    // Start by checking if match is a comment and skip if it is
    var commentRegEx = new RegExp('\\s*?\\/\\/\\s*?wp_');
    if (commentRegEx.test(match)) {
        return match;
    }

    // We are going to split on commas but need to remove arrays first and save them
    var deps = '';
    var functionString = match.replace(/array\(.*?\)/g, function(match){
        deps = match;
        return '{{array_placeholder}}';
    });

    // Split function into argument sections by commas
    var functionSections = functionString.split(',');

    // Adds array args back
    if (deps !== '') {
        functionSections[2] = functionSections[2].replace('{{array_placeholder}}', deps);
    }

    // Removes ); from end of function, save to preserve coding style whitespace
    var endOfFunction = functionSections[functionSections.length -1].split(/(\s*\);)/);
    var endCap = endOfFunction[1];
    functionSections[functionSections.length -1] = endOfFunction[0];

    // Sets dependency arg to false if not present
    functionSections[2] = functionSections[2] || ' false';

    // Changes version
    var token = crypto.randomBytes(7).toString('hex');
    functionSections[3] = ' \'' + token + '\'';

    // Assemble function and validate before returning
    var updatedFunction = functionSections.join(',') + endCap;
    var validationRegex = new RegExp('wp_enqueue_(?:style|script)\\(\\s*(\'[^,]*?\')(\\s*?,\\s*)([^,]*)(\\s*?,\\s*)(true|false|array.*?\\))(\\s*?,\\s*)(\'[a-zA-Z0-9]*\')(\\s*?,\\s*)?(true|false|all|print|screen|speach)?\\s*\\);', 'gi');

    if ( validationRegex.test(updatedFunction) ) {
        return updatedFunction;
    } else {
        gutil.log('gulp-wp-bump: Bad function declaration');
        return match;
    }

}

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
                var regex = new RegExp('((\\s*\\/\\/\\s*)?wp_enqueue_(?:style|script)\\(\\s*.*' + fileName.replace('.', '\\.') + '.*;)', 'g');

                var revisionedFile = data.replace(regex, bumpVersion);

                if ( revisionedFile == data ) {
                    gutil.log('gulp-wp-bump: File revision not committed');
                }

                fs.writeFile(functionsPhp, revisionedFile, function(err){

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
