# gulp-wp-bump
>Gulp plugin that bumps CSS and JS asset versions within a Wordpress theme's functions.php file

## Usage
gulp-wp-bump is a wrapper for [wp-bump](https://www.npmjs.com/package/wp-bump) which bumps the version number in the wp_enqueue_style() or wp_enqueue_script() function within the theme's functions.php file.

Using Gulp it can be piped through a task to bump the version of the asset being created.  The location of the functions.php file needs to be passed into the the function, the name of the asset being created is derived from the stream being passed by gulp.  Because of this, any package that changes the filename must be called before gulp-wp-bump.

```javascript
var bump = require('gulp-wp-bump');

gulp.task('styles', function() {
    return gulp.src( '/sass/style.scss' )
    .pipe( rename({suffix: '.min'}) )
    .pipe( bump('/wp-content/themes/mytheme/functions.php') )
    .pipe( gulp.dest( '/wp-content/themes/mytheme/assets/styles') );
});
```

## API
### gulp-wp-bump(file)
#### file
Type: `String`  
Path to functions.php
