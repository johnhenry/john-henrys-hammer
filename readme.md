#John Henry's Hammer

A tool for that fits naturally into your npm workflow.

##Philosophy
Build processes are becoming more and more complicated, but they shouldn't become so complicated as to distract you from your original intentions.
John Henry's Hammer tackles this problem from two angles:

###Unobtrusive Installation
John Henry's Hammer works in conjunction with nmp, which you are likely already using. You only need to run in once from within a project folder. Afterwards, npm takes care of the rest.

###Simple Plugins
Plugins are designed with a dead-simple api so that it's easy to create your own taylored specifically to your project.

##Usage

John Henry's Hammer works by adding portable build scripts to your npm installation. Unlike with [grunt]() or [gulp](), anyone who wants to work on your project does not have to install the global application. All they need is node and npm, which they likely already have.

In addition, all plugins are standard node modules. This means, that if you want to use a plugin, simply specify it's npm-registered name in the configuration file (See 'Nailfile' below.). If the module is not already installed, running 'npm run build' will install it.

###Pre-Requesites

Before using this, you must first install [node and npm](https://nodejs.org).

###Global Installation

From your commandline, type

```bash
npm install --global john-henrys-hammer
```

###Project Installation

In a project directory with a valid [project.json]() file, type

```bash
jhh
```

This will install a build script into your project: *npm run build*.

###Project Usage

Once installed, you use John Henry's Hammer via npm's run-script command.


```
npm run-script <script name>
```

or
```
npm run <script name>
```

####Building
Type

```
npm run build
```

to build your file according to a specified configuration file.

Note, options must be passed after a "--" operator.

```
npm run build -- --help
```

##Nailfile (Configuration)
In order to build your files, you will need to create a 'nailfile'. By default, the build process will search your directory for a file named 'nailfile' or 'nailfile.json', but this can also be configured with the 'nailfile' flag.

```
npm run build -- --nailfile ../some-other-configuration-file.json
```

A nailfile, is a standard json file with the following properties
 - name
 - dir
 - purge
 - nails - An array of plugins (see below)

###name (Optional)
  An arbitrary name for your project.

###dir
  The directory into which to place built files.

###purge
  A boolean value specifying whether or not to purge the build folder before building.
  Defaults to true.

###Nails (plugins)

  The nails array is a list of object defining "nails"
or "plugins" to use with John Henry's Hammer.

  All properties within each object will be passed as the options object into the named plugin.
  The following properties have special meaning:

####Nail Property:"plugin"
  Each plugin or "nail" must have a "plugin" property which points to a node module.
  Strings beginning with a '.' or a '/' will be resolved locally, and otherwise will be downloaded and installed via when run.

####Nail Property:"order"
  Optionally, a "nail" may have an "order" property, an integer, specifying the order to run with relation to others. If a nail lacks this property, it will be run simultaneously along the ones that do. Use this to prevent race-conditions

####Nail Property:"tag"
  When running build, you may specify a list of tags with --tag:

```
npm run build -- --tag <tag name>
```

  This will only run the nails with matching specified tags.
  You can add this optional flag as string or an array of strings.

####Nail Psudeo-Property:"config"
  The configuration file's "name", "dir", and "purge" properties are passed along as a "config" object along with other properties. If you create your own nails, you should not rely on this being customizable.

Any other properties are free to be used as properties of options arguments passed to nails.

##Forgeing Nails

Creating your own nails is easy.

Nails must be standard node modules.
Nails must export exactly one function.
The function must returns a promise. The promise need not be resolved with anything meaningful -- the purpose of the resolution is to signify that processing is complete.
The function must take exactly one argument -- an options object.

###Running Locally

Running local nails locally is easy. Just create them as standard mode modules and point to them relative to your project.

```json
{
  ...
  "nails" : [
    {
      "plugin" : "./path-to-custom-module"
    }
  ]
}
```


##List of Nails
This is a curated list of nails.

If you want your own nail to show up here, publish it to npm and create a pull request for this readme. Make sure to follow the guidelines above in "Forging Nails". Keep in mind, that it should be well tested and have a name that starts with "nail-".

- [nail-copy]() Copy a directory into your build folder.

- [nail-polish]() Remove specific files. (No, the pun doesn't quite work, but it 'kinda' works, and that's all that really matters...)

- [nail-cssedge]() Hammer your stylesheets down to a single file

- [nail-jsedge]() Hammer your scripts down to a single file

- [nail-static-react] () create a static page using React components.

- [nail-static-blog-react]() create a static blog using React components

##Appendix

###Example Nail

```javascript
const fs = require('fs');
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

###Example Nailfile
```json
{
  "name"  : "example-nailfile",
  "dir"   : "www",
  "purge" : true,
  "nails" : [
    {
      "plugin" : "nail-copy",
      "source" : "assets",
    }]
}
```
