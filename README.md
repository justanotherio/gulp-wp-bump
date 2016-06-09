# gulp-wp-bump
>Revisions CSS and JS assets within a Wordpress theme's functions.php file

## Usage
gulp-wp-bump will determine the CSS or JS file being generated and change the version number in the *wp_enqueue_style()* or *wp_enqueue_script()* function within the theme's functions.php file
```javascript
var bump = require('gulp-wp-bump');

gulp.task('styles', function() {
    return gulp.src( '/sass/style.scss' )
    .pipe( sass().on('error', sass.logError) )
    .pipe( rename({suffix: '.min'}) )
    .pipe( bump('wp-content/themes/mytheme/functions.php') );
    .pipe( gulp.dest( 'wp-content/themes/mytheme//assets/styles') );
});
```
Please note: any package that changes the filename must be called before gulp-wp-bump.

Besides changing the version number, gulp-wp-bump may modify your *wp_enqueue_style()* or *wp_enqueue_script()* function.  For example:

```php
wp_enqueue_style( 'mystyle', get_stylesheet_directory_uri() . '/assets/css/style.min.css' );
```

will be changed to

```php
wp_enqueue_style( 'mystyle', get_stylesheet_directory_uri() . '/assets/css/style.min.css', false, c6c58fa7feebc3 );
```

## API
### wp-bump(file)
#### file
Type: `String`

Path to functions.php
