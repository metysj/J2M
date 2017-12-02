const babel = require('rollup-plugin-babel'),
  buffer = require('vinyl-buffer'),
  eslint = require('gulp-eslint'),
  filter = require('gulp-filter'),
  gulp = require('gulp'),
  jest = require('gulp-jest').default,
  lazypipe = require('lazypipe'),
  minify = require('gulp-babel-minify'),
  prettierOptions = require('./.prettier'),
  prettier = require('prettier'),
  rename = require('gulp-rename'),
  rollup = require('rollup-stream'),
  rollupNode = require('rollup-plugin-node-resolve'),
  rollupCommonJS = require('rollup-plugin-commonjs'),
  runSequence = require('run-sequence'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  through = require('through2'),
  util = require('gulp-util');

function rollupLib(inopts) {
  const opts = Object.assign(
      {
        input: inopts.src || './src/index.js',
        sourcemap: true,
        format: inopts.format,
        plugins: [
          rollupNode(),
          rollupCommonJS({
            include: 'node_modules/**'
          })
        ]
      },
      inopts.rollupOpts || {}
    ),
    presetOpts = {
      modules: false
    };

  if (inopts.target) {
    presetOpts.targets = [inopts.target];
  }

  if (inopts.compile || typeof inopts.compile === 'undefined') {
    opts.plugins.push(
      babel({
        babelrc: false,
        presets: [['env', presetOpts]],
        plugins: ['external-helpers']
      })
    );
  }
  return rollup(opts);
}

function buildLib(dest, opts) {
  return () => {
    const fullDest = `./dist/${dest}`;
    const minifyLib = lazypipe()
      .pipe(filter, ['**/*.js'])
      .pipe(minify, { mangle: { keepClassNames: true } })
      .pipe(rename, { extname: '.min.js' })
      .pipe(sourcemaps.write, '.')
      .pipe(gulp.dest, fullDest);

    return rollupLib(opts)
      .pipe(source(opts.src || './src/index.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('.'))
      .pipe(rename({ basename: 'jira2markdown', dirname: '' }))
      .pipe(gulp.dest(fullDest))
      .pipe(minifyLib());
  };
}

function prettify(opts) {
  return through.obj((file, _, callback) => {
    const str = file.contents.toString(),
      data = prettier.format(str, opts);
    file.contents = Buffer.from(data);
    callback(null, file);
  });
}

function test() {
  const opts = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**']
  };
  return gulp.src('test').pipe(jest(opts));
}

const browsersOld = { browsers: 'last 2 major versions' };
const rollupOpts = { name: 'jira2markdown' };
const lintable = ['src/**/*.js', 'test/**/*.js', 'gulpfile.js', '.eslintrc.js', '.prettier.js'];
const doLint = () =>
  gulp
    .src(lintable)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

gulp.task(
  'global',
  buildLib('global', {
    rollupOpts,
    format: 'iife',
    target: browsersOld
  })
);

gulp.task(
  'amd',
  buildLib('amd', {
    rollupOpts,
    format: 'amd',
    target: browsersOld
  })
);

gulp.task(
  'node',
  buildLib('node', {
    format: 'cjs',
    target: 'node >= 6'
  })
);

gulp.task(
  'es6',
  buildLib('es6', {
    format: 'es',
    compile: false
  })
);

gulp.task(
  'global-es6',
  buildLib('global-es6', {
    rollupOpts,
    format: 'iife',
    compile: false
  })
);

gulp.task('build', ['node', 'es6', 'amd', 'global', 'global-es6']);

gulp.task('test', () => test());

gulp.task('lint!', ['format'], doLint);
gulp.task('lint', doLint);

gulp.task('format', () =>
  gulp
    .src(lintable, { base: './' })
    .pipe(prettify(prettierOptions))
    .pipe(gulp.dest('./'))
);

gulp.task('default', cb => runSequence('format', 'build', 'lint', 'test', cb));

gulp.task('prerelease', cb => runSequence('format', 'build', 'lint', cb));
