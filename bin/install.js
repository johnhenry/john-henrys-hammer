#! /usr/bin/env node
'use strict';

const fs    = require(`fs`);
const path  = require(`path`);
const exec  = require(`child_process`).execSync;
const execAsync  = require(`child_process`).exec;
const yargs = require(`yargs`);
const cwd   = process.cwd();
const resolveCWD = target => path.resolve(cwd, target);
const resolveLocal = target => path.resolve(__dirname, target);
const packageObj = require(resolveLocal(`../package.json`));
const name = 'jhh';
const version = packageObj.version;
const packageName = packageObj.name;
const log = console.log.bind(console);
const logError = console.error.bind(console);

const argv = yargs
  .usage(`${name}`)
  .help(`help`)
  .option(`help`, {
    alias: `h`
  })
  .option(`version`, {
    type: `boolean`,
    describe: `show version`
  })
  .argv;
if(argv[`version`]){
  return console.log(version);
}
const packageFilePath = resolveCWD(`package.json`);
const initialize = (pack) => {
  log(`installing ${packageName} locally...`);
  log(`npm install --save ${packageName}@${version}`);
  exec(`npm install --save ${packageName}@${version}`);
  log(`${packageName} installed!`);
  log(`installing npm script...`);
  pack.scripts = pack.scripts || {};
  pack.scripts['build']= `./node_modules/${packageName}/bin/run.js`;
  log(`script installed as 'npm run build'!`);
  fs.writeFileSync(packageFilePath, JSON.stringify(pack, undefined, `  `));
};
const getNPM = ()=>{
  let pack;
  try{
    pack = JSON.parse(fs.readFileSync(packageFilePath));
  }catch(error){
    logError(new Error(`valid 'package.json' file required: ${error}`));
    return log(`try running 'npm init' first.`);
  }
  return initialize(pack);
};
//run
getNPM();
