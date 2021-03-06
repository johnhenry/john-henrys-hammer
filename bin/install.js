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
  .usage(`Usage run '${name}' from within your project folder.`)
  .help(`help`)
  .option(`help`, {
    alias: `h`
  })
  .option(`version`, {
    type: `boolean`,
    alias: `v`,
    describe: `Show version`
  })
  .argv;
if(argv[`version`]){
  return console.log(version);
}
const packageFilePath = resolveCWD(`package.json`);
const initialize = (pack) => {
  log(`installing ${packageName} locally...`);
  log(`npm install ${packageName}@${version}`);
  exec(`npm install ${packageName}@${version}`, {stdio:[0, 1, 2]});
  log(`${packageName} installed!`);
  log(`installing npm script...`);
  pack.scripts = pack.scripts || {};
  pack.scripts['build']= `node ./node_modules/${packageName}`;
  log(`script installed as 'npm run build'!`);
  log(`IMPORTANT: run 'npm install --save ${packageName}@${version}' to save local version.`);
  fs.writeFileSync(packageFilePath, JSON.stringify(pack, undefined, `  `));
};
const getNPM = ()=>{
  let pack;
  try{
    pack = JSON.parse(fs.readFileSync(packageFilePath));
  }catch(error){
    logError(new Error(`valid 'package.json' file required: ${error}`));
    exec(`npm init`, {stdio:[0, 1, 2]});
    pack = JSON.parse(fs.readFileSync(packageFilePath));
  }
  return initialize(pack);
};
//run
getNPM();
