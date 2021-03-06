let project_folder = require('path').basename(__dirname);
let source_folder = '#src';

let path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css/',
		js: project_folder + '/js/',
		img: project_folder + '/img/',
	},
	src: {
		html: source_folder + '/*.pug',
		css: source_folder + '/scss/main.scss',
		js: source_folder + '/js/main.js',
		img: source_folder + '/img/*.*',
	},
	watch: {
		modules: source_folder + '/modules/**/*.*',
		html: source_folder + '/*.pug',
		css: source_folder + '/scss/*.scss',
		js: source_folder + '/js/*.js',
		img: source_folder + '/img/*.*',
	},
}

let { dest, src } = require('gulp');
let gulp = require('gulp');
let browserSync = require('browser-sync').create();
let del = require('del');
let sass = require('gulp-sass');
let pug = require('gulp-pug');
let autoPrefixer = require("gulp-autoprefixer");
let uglifyJS = require('gulp-uglify-es').default;
let cleanCSS = require('gulp-clean-css');
let rename = require("gulp-rename");
let groupMedia = require('gulp-group-css-media-queries');
let babel = require('gulp-babel');
let imagemin = require('gulp-imagemin');

function browserReload() {
	browserSync.init({
		server: {
			baseDir: './' + project_folder + '/'
		},
		port: 3000,
		notify: false,
	})
}

function css() {
	return gulp.src(path.src.css)
		.pipe(sass())
		.pipe(groupMedia())
		.pipe(autoPrefixer({
			overrireBrowserList: ['last 5 version'],
			cascade: true,
		}))
		.pipe(dest(path.build.css))
		.pipe(cleanCSS())
		.pipe(rename({ extname: '.min.css' }))
		.pipe(dest(path.build.css))
		.pipe(browserSync.stream())
}

function html() {
	return gulp.src(path.src.html)
		.pipe(pug())
		.pipe(dest(path.build.html))
		.pipe(browserSync.stream())
}

function js() {
	return gulp.src(path.src.js)
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(dest(path.build.js))
		.pipe(uglifyJS())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(dest(path.build.js))
		.pipe(browserSync.stream())
}

function images() {
	return gulp.src(path.src.img)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			interlanced: true,
			optimizationLevel: 3
		}))
		.pipe(dest(path.build.img))
}

function wathcFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.modules]);
}

function clean() {
	return del([path.build.css, path.build.js, path.build.css, path.build.html + '*.html']);
}

function cleanImages() {
	return del([path.build.img])
}

exports.js = js;
exports.css = css;
exports.html = html;
exports.clean = clean;
exports.images = images
exports.cleanImages = cleanImages

exports.default = gulp.parallel(gulp.series(clean, gulp.parallel(js, css, html)), wathcFiles, browserReload);
exports.build = gulp.series(clean, gulp.parallel(js, css, html));
exports.watch = gulp.parallel(gulp.series(clean, gulp.parallel(js, css, html)), wathcFiles, browserReload);
exports.images = gulp.series(cleanImages, images)