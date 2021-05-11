---
title:  NativeScript, Databases, and You
date:   2021-05-11 19∶14∶45 +0300
tags: nativescript sql sqlite typeorm typescript
---

![Library - this is related to databases, right?](https://images.unsplash.com/photo-1483736762161-1d107f3c78e1)

Or how to get recent versions of [typeorm](https://www.npmjs.com/package/typeorm) and NativeScript to play nicely together.

By recent, I mean the latest version of typeorm as of this writing and NativeScript 7.
NativeScript 8 has been released recently, but since they overhauled the website for this version,
the documentation is incomplete and not exhaustive. Also, most plugins haven't been updated for version 8 yet.

Whether you're upgrading or starting a new project, you're likely to run into some issues.
Leaving your code aside, typeorm version 0.2.26 and later doesn't play nice with webpack in NativeScript projects.
There are several related issues in the official repository of typeorm, but the author of typeorm doesn't consider
them a problem as evidenced by several versions with no fixes and closing of related bugs without resolution.

<!--more-->

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

```shell
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

```shell
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
