var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var spawn = require('child_process').spawn;

// Set the banner content
var banner = ['/*!\n',
' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
' */\n',
''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', function() {
    return gulp.src('less/sb-admin-2.less')
    .pipe(less())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
    return gulp.src('dist/css/sb-admin-2.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

// Copy JS to dist
gulp.task('js', function() {
    return gulp.src(['js/sb-admin-2.js'])
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({
        stream: true
    }))
})

// Minify JS
gulp.task('minify-js', ['js'], function() {
    return gulp.src('js/sb-admin-2.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

// Copy vendor libraries from /bower_components into /vendor
gulp.task('copy', function() {
    gulp.src(['bower_components/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
    .pipe(gulp.dest('vendor/bootstrap'))

    gulp.src(['bower_components/bootstrap-social/*.css', 'bower_components/bootstrap-social/*.less', 'bower_components/bootstrap-social/*.scss'])
    .pipe(gulp.dest('vendor/bootstrap-social'))

    gulp.src(['bower_components/font-awesome/**/*', '!bower_components/font-awesome/*.json', '!bower_components/font-awesome/.*'])
    .pipe(gulp.dest('vendor/font-awesome'))

    gulp.src(['bower_components/jquery/dist/jquery.js', 'bower_components/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'))

    gulp.src(['bower_components/js-xlsx/dist/xlsx.full.min.js'])
    .pipe(gulp.dest('vendor/js-xlsx'))
})

// Run everything
gulp.task('default', ['server', 'minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
})

// Run python solver server
gulp.task('solver', function() {
    var solver = spawn('python', ['./solver/server.py']);
    solver.stdout.on('data', data => console.log(`Solver stdout: ${data.toString()}`));
    solver.stderr.on('data', data => console.error(`Solver stderr: ${data.toString()}`));
    solver.on('close', function(code) {
        console.log(`Solver child process exited with code ${code}`);
    });
})

// Dev task with browserSync
gulp.task('dev', ['solver', 'browserSync', 'less', 'minify-css', 'js', 'minify-js', 'copy'], function() {
    gulp.watch('less/*.less', ['less']);
    gulp.watch('dist/css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('pages/*.html', browserSync.reload);
    gulp.watch('dist/js/*.js', browserSync.reload);
});
