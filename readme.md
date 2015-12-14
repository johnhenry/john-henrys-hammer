#John Henry's Hammer

A tool for that fits naturally into your npm workflow.

##<a name="philosophy"></a>Philosophy
Build processes are becoming more and more complicated, but they shouldn't become so complicated as to distract you from your original intentions.
John Henry's Hammer tackles this problem from two angles:

###<a name="philosophy-installation"></a>Unobtrusive Installation
John Henry's Hammer works in conjunction with nmp, which you are likely already using. You only need to run in once from within a project folder. Afterwards, npm takes care of the rest.

###<a name="philosophy-pligins"></a>Simple Plugins
Plugins are designed with a dead-simple api so that it's easy to create your own taylored specifically to your project.

##<a name="usage"></a>Usage

John Henry's Hammer works by adding portable build scripts to your npm installation. Unlike with [grunt]() or [gulp](), anyone who wants to work on your project does not have to install the global application. All they need is node and npm, which they likely already have.

In addition, all plugins are standard node modules. This means, that if you want to use a plugin, simply specify it's npm-registered name in the configuration file (see '[Nailfile](#nailfile)' below.). If the module is not already installed, running 'npm run build' will install it.

###<a name="usage-pre-requisites"></a>Pre-Requesites

Before using this, you must first install [node and npm](https://nodejs.org).

###<a name="usage-global-installation"></a>Global Installation

From your commandline, type

```bash
npm install --global john-henrys-hammer
```
and save local version as instructed.

###<a name="usage-project-installation"></a>Project Installation

In a project directory with a valid [project.json]() file, type

```bash
jhh
```

This will install a build script into your project: *npm run build*.

###<a name="usage-project-usage"></a>Project Usage

Once installed, you use John Henry's Hammer via npm's run-script command.


```
npm run-script <script name>
```

or
```
npm run <script name>
```

####<a name="usage-project-usage-building"></a>Building
Type

```
npm run build
```

to build your file according to a specified configuration file.

Note, options must be passed after a "--" operator.

```
npm run build -- --help
```

##<a name="nailfile"></a>Nailfile (Configuration)
In order to build your files, you will need to create a 'nailfile'. By default, the build process will search your directory for a file named 'nailfile' or 'nailfile.json', but this can also be configured with the 'nailfile' flag.

```
npm run build -- --nailfile ../some-other-configuration-file.json
```

A nailfile, is a standard json file with the following properties
 - name
 - dir
 - purge
 - nails - An array of plugins (see [Nails](#nails) below)

###<a name="nailfile-name"></a>name (Optional)
  An arbitrary name for your project.

###<a name="nailfile-dir"></a>dir
  The directory into which to place built files.

###<a name="nailfile-purge"></a>purge
  A boolean value specifying whether or not to purge the build folder before building.
  Defaults to true.

###<a name="nails"></a>Nails (plugins)

  The nails array is a list of object defining "nails"
or "plugins" to use with John Henry's Hammer.

  All properties within each object will be passed as the options object into the named plugin.
  The following properties have special meaning:

####<a name="nails-property-plugin"></a>Nail Property:"plugin"
  Each plugin or "nail" must have a "plugin" property which points to a node module.
  Strings beginning with a '.' or a '/' will be resolved locally, and otherwise will be downloaded via when run. Nails should still be installed manually using 'npm install' to ensure that they are carried along with the project.

####<a name="nails-property-order"></a>Nail Property:"order"
  Optionally, a "nail" may have an "order" property, an integer, specifying the order to run with relation to others. If a nail lacks this property, it will be run simultaneously along the ones that do. Use this to prevent race-conditions

####<a name="nails-propety-tag"></a>Nail Property:"tag"
  When running build, you may specify a list of tags with --tag:

```
npm run build -- --tag <tag name>
```

  This will only run the nails with matching specified tags.
  You can add this optional flag as string or an array of strings.

####<a name="nails-propety-config"></a>Nail Psudeo-Property:"config"
  The configuration file's "name", "dir", and "purge" properties are passed along as a "config" object along with other properties. If you create your own nails, you should not rely on this being customizable.

Any other properties are free to be used as properties of options arguments passed to nails.

##<a name="forging-nails"></a>Forging Nails

Creating your own nails is easy.

Nails must be standard node modules.
Nails must export exactly one function.
The function must returns a promise. The promise need not be resolved with anything meaningful -- the purpose of the resolution is to signify that processing is complete.
The function must take exactly one argument -- an options object.

###<a name="forging-nails-using"></a>Using Forged Nails

Using your own local nails locally is easy. Just create them as standard mode modules and point to them relative to your project.

```json
{
  "..."   : "...",
  "nails" : [
    {
      "plugin" : "./path-to-custom-module"
    }
  ]
}
```


##<a name="list"></a>List of Nails
This is a curated list of nails.

If you want your own nail to show up here, publish it to npm and create a pull request for this readme. Make sure to follow the guidelines above in "Forging Nails". Keep in mind, that it should be well tested and have a name that starts with "nail-".

- [nail-copy](https://github.com/johnhenry/nail-copy) Copy a directory into your build folder.

- [nail-polish](https://github.com/johnhenry/nail-polish) Remove specific files. (No, the pun doesn't quite work, but it 'kinda' works, and that's all that really matters...)

- [nail-css-edge](https://github.com/johnhenry/nail-css-edge) Hammer your stylesheets down to a single file

- [nail-js-edge](https://github.com/johnhenry/nail-js-edge) Hammer your scripts down to a single file

- [nail-static-react] (https://github.com/johnhenry/nail-static-react) create a static pages using React components.

- [nail-shell-opal] (https://github.com/johnhenry/nail-shell-opal) Hammer your ruby code into to a javascript file. Requires installation of [opal](http://opalang.org/).

##<a name="appendix"></a>Appendix


###<a name="appendix-example-nailfile"></a>I. Example Nailfile
```json
{
  "name"  : "example-nailfile",
  "dir"   : "www",
  "purge" : true,
  "nails" : [
    {
      "plugin" : "nail-example",
      "source" : "assets",
      "custom" : "custom"
    }]
}
```

###<a name="appendix-example-nail"></a>II. Example Nail

```javascript
//file:nail-example/index.js
module.exports = ({plugin, order, tag, config, custom })=> new Promise((resolve) => {
  console.log(plugin);
  console.log(order);
  console.log(tag);
  console.log(config);
  //...preform action and
  console.log(custom);
  //...resolve once done
  resolve(custom);
})
```
