var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var inject = require('gulp-inject');
var siteServer = require('browser-sync').create('siteServer');
var deploy = require('gulp-gh-pages');
var autoprefixer = require('gulp-autoprefixer');


gulp.task('watchers', ['siteServer'], function() {
    gulp.watch(['source/_html/**/*.html'], function(file) {
        gulp.start('HTML');
    });
    gulp.watch(['source/_sass/**/*.scss'], function(file) {
        gulp.start('injectStyleCSS');
        gulp.start('buildFileCss');
    });
});

gulp.task('HTML', function() {
    var injectCSSGlobalFile = gulp.src(['build/css/style.css']);
    var injectCSSGlobalOptions = {
        addRootSlash: false,
        ignorePath: ['source', 'build'],
        removeTags: true
    };

    return gulp.src('source/_html/**/*.html')
    .pipe(inject(injectCSSGlobalFile, injectCSSGlobalOptions))
    .pipe(gulp.dest('build'))
});

gulp.task('buildFileCss', function() {
    return gulp.src('./source/_sass/_file-includes/*.scss')
    .pipe(
        plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end');
            }
        })
    )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer(
        {
            grid:true,
            browsers: [
                "ie 10",
                "ie 11",
                "last 2 versions"
            ]
        }
        ))
    .pipe(sourcemaps.write('sourcemaps'))
    .pipe(gulp.dest('build/css'))
});

gulp.task('injectStyleCSS', function() {
    var injectAppFiles = gulp.src('source/_sass/_includes/*.scss', {read: false});

    function transformFilepath(filepath) {
        console.log(filepath);
        return '@import "' + filepath + '";';
    }

    var injectAppOptions = {
        transform: transformFilepath,
        starttag: '// inject:css',
        endtag: '// endinject',
        addRootSlash: false
    };

    return gulp.src('source/_sass/style.scss')
    .pipe(
        plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end');
            }
        })
    )
    .pipe(inject(injectAppFiles, injectAppOptions))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer(
        {
            grid:true,
            browsers: [
                "ie 10",
                "ie 11",
                "last 2 versions"
            ]
        }
    ))
    .pipe(sourcemaps.write('sourcemaps'))
    .pipe(gulp.dest('build/css'))
});

gulp.task('buildAll', ['injectStyleCSS', 'buildFileCss', 'HTML'], function() {
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

gulp.task('deploy', function() {
    return gulp.src(["./build/**/*", "!./build/css/sourcemaps/*"])
    .pipe(deploy());
});