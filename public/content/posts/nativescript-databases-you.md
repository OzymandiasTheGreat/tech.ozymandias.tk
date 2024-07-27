---
title: NativeScript, Databases, and You
slug: nativescript-databases-you
published: 2021-05-11T19:14:45+0300
medium: https://ozymandiasthegreat.medium.com/android-continuous-background-services-with-nativescript-a0840fc1eceb
devto: https://dev.to/ozymandiasthegreat/android-continuous-background-services-with-nativescript-42c9
---
Or how to get recent versions of [typeorm](https://www.npmjs.com/package/typeorm) and NativeScript to play nicely together.

By recent, I mean the latest version of typeorm as of this writing and NativeScript 7.
NativeScript 8 has been released recently, but since they overhauled the website for this version,
the documentation is incomplete and not exhaustive. Also, most plugins haven't been updated for version 8 yet.

<!--more-->

Whether you're upgrading or starting a new project, you're likely to run into some issues.
Leaving your code aside, typeorm version 0.2.26 and later doesn't play nice with webpack in NativeScript projects.
There are several related issues in the official repository of typeorm, but the author of typeorm doesn't consider
them a problem as evidenced by several versions with no fixes and closing of related bugs without resolution.

Another thing to consider is typeorm's viability going forward. The work on current architecture has stalled, and
the author plans to introduce breaking changes going forward. The future of this library seems pretty shaky right now.
Hopefully, considering the popularity of this project, we'll get a fork avoiding breaking changes and easing migration.

For the reasons above you should not use typeorm on new projects. If you're OK with writing raw SQL queries,
you can use [nativescript-sqlite](https://www.npmjs.com/package/nativescript-sqlite). Otherwise, there are a couple of alternatives. For an offline local database, you might want to look into [@triniwiz/nativescript-couchbase](https://www.npmjs.com/package/@triniwiz/nativescript-couchbase). As I haven't used CouchBase before, I can't say much about this
plugin, other than it seems well maintained and supported.

Another alternative, especially if you have bigger needs than a local database can satisfy, is
[@nativescript/firebase](https://www.npmjs.com/package/@nativescript/firebase). This plugin is one the most
popular plugins for NativeScript and as such it sees frequent updates and good support. It provides a cloud
database, push notifications, social third-party authentication, and much more. For the vast majority of new projects,
this is the way forward.

That said, if you already use typeorm or choose to use it despite the issues above, here's how to get it
working with NativeScript 7.

## The Setup

First, install `nativescript-sqlite` as it provides the database driver for the actual database operations.
The install the latest version of `typeorm`. Note that commands differ, as `nativescript-sqlite` is a NativeScript
plugin and so needs additional setup that `ns` command will perform for us.

```bash
ns plugin add nativescript-sqlite
npm i @typeorm@latest
```

Now, regardless of which flavor of NativeScript you use, in your `main.ts` setup the database connection.
There are official and otherwise examples for various flavors in the `typeorm` Github account.
Those examples are of rather poor quality, but they did provide a useful starting point for me.
Also, for this example, I'll skip entity definitions as they work just as described in the documentation
and they're not relevant here. All the issues we'll encounter stem from webpack (and poorly thought-through changes in `typeorm`).

```typescript
import { platformNativeScriptDynamic } from "@nativescript/angular";
import { AppModule } from "./app/app.module";
import { createConnection } from "typeorm/browser";
const driver = require("nativescript-sqlite");


createConnection({
    database: "notes.db",
    type: "nativescript",
    driver,
    entities: [/* ... put your entities here */],
}).then((conn) => {
    conn.synchronize(false);
}).catch((err) => console.error(err));


platformNativeScriptDynamic().bootstrapModule(AppModule);

```

If you're upgrading from version of `typeorm` 0.2.25 or earlier, you're going to be greeted by a wall
of `Critical-Dependency` and missing module warnings and these 2 errors when you try running your project:

```bash
ERROR in ../node_modules/app-root-path/lib/resolve.js
Module not found: Error: Can't resolve 'module' in '/home/ozymandias/Projects/scratchpad/typeorm-example/node_modules/app-root-path/lib'
 @ ../node_modules/app-root-path/lib/resolve.js 7:18-35
 @ ../node_modules/app-root-path/lib/app-root-path.js
 @ ../node_modules/app-root-path/index.js
 @ ../node_modules/typeorm/browser/logger/FileLogger.js
 @ ../node_modules/typeorm/browser/index.js
 @ ./main.ts

ERROR in ../node_modules/xml2js/lib/parser.js
Module not found: Error: Can't resolve 'timers' in '/home/ozymandias/Projects/scratchpad/typeorm-example/node_modules/xml2js/lib'
 @ ../node_modules/xml2js/lib/parser.js 17:17-34
 @ ../node_modules/xml2js/lib/xml2js.js
 @ ../node_modules/typeorm/browser/connection/options-reader/ConnectionOptionsXmlReader.js
 @ ../node_modules/typeorm/browser/connection/ConnectionOptionsReader.js
 @ ../node_modules/typeorm/browser/index.js
 @ ./main.ts
```

For the warnings, just add every package mentioned there to your `externals`
in your webpack config. As for the `Critical-Dependency` ones, I haven't quite figured
out how to solve them, but you can disable them by adding this to your webpack config:

```javascript
stats: {
    warningsFilter: [/critical dependency:/i],
}
```

As for the errors, just add `module` to externals as well. Then in node shim configuration
section, change `timers` from `false` to `'empty'`.

Now, the project compiles, but upon startup, you'll likely crash with
`ReferenceError: process is not defined`. Yes, we'll be saved by the good old webpack
`DefinePlugin`.

In your webpack config, `DefinePlugin` section, change `process: 'global.process'` to
`'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')`.

At this point app still crashes at startup but the error is different: `TypeError: util.inherits is not a function`.
Now the fix for this one is magic, for I have no idea why it works. Anyway, here it is:
in your webpack config, under `resolve` key add this line `mainFields: ['browser', 'module', 'main']`.

And that is it, my friends. At this point, you should be able to run your app successfully.

## Postscript

I've considered (and actually tried) to stick to `typeorm` version 0.2.25. It certainly takes less setup.
However, I ran into a bug that's only present in that version. Upon retrieving an entry from the database and modifying
it, saving fails with an utterly unhelpful error message. After spending half a day thinking it's a bug with my code,
I accidentally ran across a bug for this particular issue. As described in the bug, the only fix is upgrading.
So since it's the same errors whether it's version 0.2.26 or the latest version, I buckled up and upgraded.
Hopefully, this has been helpful for you and saved you some headache.

## Full webpack.config.js for reference

```typescript
const { join, relative, resolve, sep, dirname } = require('path');
const fs = require('fs');

const webpack = require('webpack');
const nsWebpack = require('@nativescript/webpack');
const nativescriptTarget = require('@nativescript/webpack/nativescript-target');
const {
  nsSupportHmrNg
} = require('@nativescript/webpack/transformers/ns-support-hmr-ng');
const { nsTransformNativeClassesNg } = require("@nativescript/webpack/transformers/ns-transform-native-classes-ng");
const {
  parseWorkspaceConfig, hasConfigurations
} = require('@nativescript/webpack/helpers/angular-config-parser');
const {
  getMainModulePath
} = require('@nativescript/webpack/utils/ast-utils');
const { getNoEmitOnErrorFromTSConfig, getCompilerOptionsFromTSConfig } = require("@nativescript/webpack/utils/tsconfig-utils");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const {
  NativeScriptWorkerPlugin
} = require('nativescript-worker-loader/NativeScriptWorkerPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const {
  getAngularCompilerPlugin
} = require('@nativescript/webpack/plugins/NativeScriptAngularCompilerPlugin');
const hashSalt = Date.now().toString();

module.exports = env => {
  // Add your custom Activities, Services and other Android app components here.
  const appComponents = [
    "@nativescript/core/ui/frame", "@nativescript/core/ui/frame/activity"
  ];

  const platform = env && ((env.android && 'android') || (env.ios && 'ios'));
  if (!platform) {
    throw new Error('You need to provide a target platform!');
  }

  const AngularCompilerPlugin = getAngularCompilerPlugin(platform);
  const projectRoot = __dirname;

  // Default destination inside platforms/<platform>/...
  const dist = resolve(
    projectRoot,
    nsWebpack.getAppPath(platform, projectRoot)
  );

  const {
    // The 'appPath' and 'appResourcesPath' values are fetched from
    // the nsconfig.json configuration file
    // when bundling with `tns run android|ios --bundle`.
    appPath = 'src',
    appResourcesPath = 'App_Resources',

    // You can provide the following flags when running 'tns run android|ios'
    snapshot, // --env.snapshot,
    production, // --env.production
    configuration, // --env.configuration (consistent with angular cli usage)
    projectName, // --env.projectName (drive configuration through angular projects)
    uglify, // --env.uglify
    report, // --env.report
    sourceMap, // --env.sourceMap
    hiddenSourceMap, // --env.hiddenSourceMap
    hmr, // --env.hmr,
    unitTesting, // --env.unitTesting
    testing, // --env.testing
    verbose, // --env.verbose
    ci, // --env.ci
    snapshotInDocker, // --env.snapshotInDocker
    skipSnapshotTools, // --env.skipSnapshotTools
    compileSnapshot // --env.compileSnapshot
  } = env;

  const { fileReplacements, copyReplacements } = parseWorkspaceConfig(platform, configuration, projectName);

  const useLibs = compileSnapshot;
  const isAnySourceMapEnabled = !!sourceMap || !!hiddenSourceMap;
  const externals = nsWebpack.getConvertedExternals(env.externals);
  const appFullPath = resolve(projectRoot, appPath);
  const appResourcesFullPath = resolve(projectRoot, appResourcesPath);
  let tsConfigName = 'tsconfig.json';
  let tsConfigPath = resolve(projectRoot, tsConfigName);
  const tsConfigTnsName = 'tsconfig.tns.json';
  const tsConfigTnsPath = resolve(projectRoot, tsConfigTnsName);
  if (fs.existsSync(tsConfigTnsPath)) {
    // support shared angular app configurations
    tsConfigName = tsConfigTnsName;
    tsConfigPath = tsConfigTnsPath;
  }
  const tsConfigEnvName = 'tsconfig.env.json';
  const tsConfigEnvPath = resolve(projectRoot, tsConfigEnvName);
  if (hasConfigurations(configuration) && fs.existsSync(tsConfigEnvPath)) {
    // when configurations are used, switch to environments supported config
    tsConfigName = tsConfigEnvName;
    tsConfigPath = tsConfigEnvPath;
  }
  const entryModule = `${nsWebpack.getEntryModule(appFullPath, platform)}.ts`;
  const entryPath = `.${sep}${entryModule}`;
  const entries = { bundle: entryPath };
  const areCoreModulesExternal =
    Array.isArray(env.externals) &&
    env.externals.some(e => e.indexOf('@nativescript') > -1);
  if (platform === 'ios' && !areCoreModulesExternal && !testing) {
    entries['tns_modules/@nativescript/core/inspector_modules'] =
      'inspector_modules';
  }

  const compilerOptions = getCompilerOptionsFromTSConfig(tsConfigPath);
  nsWebpack.processTsPathsForScopedModules({ compilerOptions });
  nsWebpack.processTsPathsForScopedAngular({ compilerOptions });

  const ngCompilerTransformers = [nsTransformNativeClassesNg];
  const additionalLazyModuleResources = [];

  const copyIgnore = { ignore: [`${relative(appPath, appResourcesFullPath)}/**`] };
  const copyTargets = [
    { from: { glob: 'assets/**', dot: false } },
    { from: { glob: 'fonts/**', dot: false } },
    ...copyReplacements,
  ];

  if (!production) {
    // for development purposes only
    // for example, include mock json folder
    // copyTargets.push({ from: 'tools/mockdata', to: 'assets/mockdata' });

    if (hmr) {
      ngCompilerTransformers.push(nsSupportHmrNg);
    }
  }

  // when "@angular/core" is external, it's not included in the bundles. In this way, it will be used
  // directly from node_modules and the Angular modules loader won't be able to resolve the lazy routes
  // fixes https://github.com/NativeScript/nativescript-cli/issues/4024
  if (env.externals && env.externals.indexOf('@angular/core') > -1) {
    const appModuleRelativePath = getMainModulePath(
      resolve(appFullPath, entryModule),
      tsConfigName
    );
    if (appModuleRelativePath) {
      const appModuleFolderPath = dirname(
        resolve(appFullPath, appModuleRelativePath)
      );
      // include the new lazy loader path in the allowed ones
      additionalLazyModuleResources.push(appModuleFolderPath);
    }
  }

  const ngCompilerPlugin = new AngularCompilerPlugin({
    hostReplacementPaths: nsWebpack.getResolver([platform, 'tns']),
    platformTransformers: ngCompilerTransformers.map(t =>
      t(() => ngCompilerPlugin, resolve(appFullPath, entryModule), projectRoot)
    ),
    mainPath: join(appFullPath, entryModule),
    tsConfigPath,
    skipCodeGeneration: false,
    sourceMap: !!isAnySourceMapEnabled,
    additionalLazyModuleResources: additionalLazyModuleResources,
    compilerOptions: { paths: compilerOptions.paths }
  });

  let sourceMapFilename = nsWebpack.getSourceMapFilename(
    hiddenSourceMap,
    __dirname,
    dist
  );

  const itemsToClean = [`${dist}/**/*`];
  if (platform === 'android') {
    itemsToClean.push(
      `${join(
        projectRoot,
        'platforms',
        'android',
        'app',
        'src',
        'main',
        'assets',
        'snapshots'
      )}`
    );
    itemsToClean.push(
      `${join(
        projectRoot,
        'platforms',
        'android',
        'app',
        'build',
        'configurations',
        'nativescript-android-snapshot'
      )}`
    );
  }

  const noEmitOnErrorFromTSConfig = getNoEmitOnErrorFromTSConfig(tsConfigName);

  // Shut up typeorm and nativescript-sqlite warnings
  externals.push('module');
  externals.push('typeorm-aurora-data-api-driver');
  externals.push('sqlite3');
  externals.push('sql.js');
  externals.push('redis');
  externals.push('react-native-sqlite-storage');
  externals.push('pg-query-stream');
  externals.push('pg-native');
  externals.push('pg');
  externals.push('oracledb');
  externals.push('nativescript-sqlite-sync');
  externals.push('nativescript-sqlite-encrypted');
  externals.push('nativescript-sqlite-commercial');
  externals.push('mysql2');
  externals.push('mysql');
  externals.push('mssql');
  externals.push('mongodb');
  externals.push('ioredis');
  externals.push('hdb-pool');
  externals.push('better-sqlite3');
  externals.push('@sap/hana-client');

  nsWebpack.processAppComponents(appComponents, platform);
  const config = {
    mode: production ? 'production' : 'development',
    context: appFullPath,
    externals,
    watchOptions: {
      ignored: [
        appResourcesFullPath,
        // Don't watch hidden files
        '**/.*'
      ]
    },
    target: nativescriptTarget,
    entry: entries,
    output: {
      pathinfo: false,
      path: dist,
      sourceMapFilename,
      libraryTarget: 'commonjs2',
      filename: '[name].js',
      globalObject: 'global',
      hashSalt
    },
    resolve: {
      extensions: ['.ts', '.js', '.scss', '.css'],
      // Resolve {N} system modules from @nativescript/core
      modules: [
        resolve(__dirname, 'node_modules/@nativescript/core'),
        resolve(__dirname, 'node_modules'),
        'node_modules/@nativescript/core',
        'node_modules'
      ],
      alias: {
        '~/package.json': resolve(projectRoot, 'package.json'),
        '~': appFullPath,
        "tns-core-modules": "@nativescript/core",
        "nativescript-angular": "@nativescript/angular",
        ...fileReplacements
      },
      symlinks: true,
      // Again typeorm requires stuff not in nativescript
      mainFields: ['browser', 'module', 'main'],
    },
    resolveLoader: {
      symlinks: false
    },
    node: {
      // Disable node shims that conflict with NativeScript
      http: false,
      timers: 'empty',
      setImmediate: false,
      fs: 'empty',
      __dirname: false
    },
    devtool: hiddenSourceMap
      ? 'hidden-source-map'
      : sourceMap
      ? 'inline-source-map'
      : 'none',
    optimization: {
      runtimeChunk: 'single',
      noEmitOnErrors: noEmitOnErrorFromTSConfig,
      splitChunks: {
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: (module, chunks) => {
              const moduleName = module.nameForCondition
                ? module.nameForCondition()
                : '';
              return (
                /[\\/]node_modules[\\/]/.test(moduleName) ||
                appComponents.some(comp => comp === moduleName)
              );
            },
            enforce: true
          }
        }
      },
      minimize: !!uglify,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          cache: !ci,
          sourceMap: isAnySourceMapEnabled,
          terserOptions: {
            output: {
              comments: false,
              semicolons: !isAnySourceMapEnabled
            },
            compress: {
              // The Android SBG has problems parsing the output
              // when these options are enabled
              collapse_vars: platform !== 'android',
              sequences: platform !== 'android',
              // custom
              drop_console: true,
              drop_debugger: true,
              ecma: 6,
              keep_infinity: platform === 'android', // for Chrome/V8
              reduce_funcs: platform !== 'android', // for Chrome/V8
              global_defs: {
                __UGLIFIED__: true
              }
            },
            // custom
            ecma: 6,
            safari10: platform !== 'android'
          }
        })
      ]
    },
    module: {
      rules: [
        {
          include: join(appFullPath, entryPath),
          use: [
            // Require all Android app components
            platform === 'android' && {
              loader: '@nativescript/webpack/helpers/android-app-components-loader',
              options: { modules: appComponents }
            },

            {
              loader: '@nativescript/webpack/bundle-config-loader',
              options: {
                angular: true,
                loadCss: !snapshot, // load the application css if in debug mode
                unitTesting,
                appFullPath,
                projectRoot,
                ignoredFiles: nsWebpack.getUserDefinedEntries(entries, platform)
              }
            }
          ].filter(loader => !!loader)
        },

        { test: /\.html$|\.xml$/, use: 'raw-loader' },

        {
          test: /[\/|\\]app\.css$/,
          use: [
              '@nativescript/webpack/helpers/style-hot-loader',
              {
                  loader: "@nativescript/webpack/helpers/css2json-loader",
                  options: { useForImports: true }
              },
          ],
        },
        {
          test: /[\/|\\]app\.scss$/,
          use: [
              '@nativescript/webpack/helpers/style-hot-loader',
              {
                  loader: "@nativescript/webpack/helpers/css2json-loader",
                  options: { useForImports: true }
              },
              'sass-loader',
          ],
        },

        // Angular components reference css files and their imports using raw-loader
        { test: /\.css$/, exclude: /[\/|\\]app\.css$/, use: 'raw-loader' },
        {
          test: /\.scss$/,
          exclude: /[\/|\\]app\.scss$/,
          use: ['raw-loader', 'resolve-url-loader', 'sass-loader']
        },

        {
          test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
          use: [
            '@nativescript/webpack/helpers/moduleid-compat-loader',
            '@nativescript/webpack/helpers/lazy-ngmodule-hot-loader',
            '@ngtools/webpack'
          ]
        },

        // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
        // Removing this will cause deprecation warnings to appear.
        {
          test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
          parser: { system: true }
        }
      ]
    },
    plugins: [
      // Define useful constants like TNS_WEBPACK
      new webpack.DefinePlugin({
        'global.TNS_WEBPACK': 'true',
        'global.isAndroid': platform === 'android',
        'global.isIOS': platform === 'ios',
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      }),
      // Remove all files from the out dir.
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: itemsToClean,
        verbose: !!verbose
      }),
      // Copy assets
      new CopyWebpackPlugin([
        ...copyTargets,
        { from: { glob: '**/*.jpg', dot: false } },
        { from: { glob: '**/*.png', dot: false } },
      ], copyIgnore),
      new nsWebpack.GenerateNativeScriptEntryPointsPlugin('bundle'),
      // For instructions on how to set up workers with webpack
      // check out https://github.com/nativescript/worker-loader
      new NativeScriptWorkerPlugin(),
      ngCompilerPlugin,
      // Does IPC communication with the {N} CLI to notify events when running in watch mode.
      new nsWebpack.WatchStateLoggerPlugin()
    ],
    stats: {
      warningsFilter: [/critical dependency:/i],
    },
  };

  if (report) {
    // Generate report files for bundles content
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        generateStatsFile: true,
        reportFilename: resolve(projectRoot, 'report', `report.html`),
        statsFilename: resolve(projectRoot, 'report', `stats.json`)
      })
    );
  }

  if (snapshot) {
    config.plugins.push(
      new nsWebpack.NativeScriptSnapshotPlugin({
        chunk: 'vendor',
        angular: true,
        requireModules: [
          'reflect-metadata',
          '@angular/platform-browser',
          '@angular/core',
          '@angular/common',
          '@angular/router',
          '@nativescript/angular'
        ],
        projectRoot,
        webpackConfig: config,
        snapshotInDocker,
        skipSnapshotTools,
        useLibs
      })
    );
  }

  if (!production && hmr) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return config;
};
```
