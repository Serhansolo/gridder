var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var inject = require('gulp-inject');
var siteServer = require('browser-sync').create('siteServer');
var deploy = require('gulp-gh-pages');

gulp.task('watchers', ['siteServer'], function() {
    gulp.watch(['source/_html/**/*.html'], function(file) {
        gulp.start('HTML');
    });
    gulp.watch(['source/_sass/**/*.scss'], function(file) {
        gulp.start('CSS');
    });
});

gulp.task('HTML', function() {
    var injectCSSAssetFiles = gulp.src(['build/css/assets/**/*.css']);
    var injectCSSGlobalFiles = gulp.src(['build/css/style.css']);

    var injectCSSAssetOptions = {
        addRootSlash: false,
        ignorePath: ['source', 'build'],
        removeTags: true,
        starttag: '<!--inject:assetcss-->',
        endtag: '<!--endinject-->'
    };
    var injectCSSGlobalOptions = {
        addRootSlash: false,
        ignorePath: ['source', 'build'],
        removeTags: true
    };

    return gulp.src('source/_html/**/*.html')
    .pipe(inject(injectCSSAssetFiles, injectCSSAssetOptions))
    .pipe(inject(injectCSSGlobalFiles, injectCSSGlobalOptions))
    .pipe(gulp.dest('build'))
});

gulp.task('CSS', function() {
    var injectAppFiles = gulp.src('source/_sass/_include/*.scss', {read: false});

    function transformFilepath(filepath) {
        return '@import "' + filepath + '";';
    }

    var injectAppOptions = {
        transform: transformFilepath,
        starttag: '// inject:css',
        endtag: '// endinject',
        addRootSlash: false
    };

    return gulp.src('source/_sass/style.scss')
    .pipe(inject(injectAppFiles, injectAppOptions))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write('sourcemaps'))
    .pipe(gulp.dest('build/css'))
});


gulp.task('buildAll', ['HTML', 'CSS'], function() {
    return true;
});

gulp.task('siteServer', function() {
    siteServer.init({
        server: {
            baseDir: "build",
            https: false
        },
        open: false,
        port: 2000,
        ui: {
            port: 2001
        },
        notify: false
    });
});

gulp.task('deploy', function(){
    return gulp.src(["./build/**/*", "!./build/css/sourcemaps/*"])
    .pipe(deploy());
});