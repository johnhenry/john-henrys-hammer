'use strict';

//imports
const fs    = require(`fs`);
const path  = require(`path`);
const exec  = require(`child_process`).execSync;
const yargs = require(`yargs`);
const co    = require(`co`);
const inquisitor = require(`inquisitor`);
//local imports
const rmdir = require(`./lib/rmdir`);

//constants
const cwd = process.cwd();
const resolveCWD = target => path.resolve(cwd, target);
const resolveLocal = target => path.resolve(__dirname, target);
const packageObj = require(resolveLocal(`./package.json`));
const name = 'jhh';
const version = packageObj.version;
const packageName = packageObj.name;
const defaultDirectory = name;
const configBase = `nailfile`;
const argv = yargs
  .usage(`npm run build -- [options]`)
  .help(`help`)
  .option(`help`, {
    alias: `h`
  })
  .option(`add`, {
    alias: `a`,
    type:`string`,
    describe: `add command`,
    default: ``
  })
  .option(`tag`, {
    alias: `t`,
    type:`array`,
    describe: `run only tagged build steps`,
    default: []
  })
  .option(`skip`, {
    alias: `k`,
    type:`array`,
    describe: `run only tagged build steps`,
    default: []
  })
  .option(configBase, {
    alias: configBase[0],
    describe: `specify configuration file`,
    default:``
  })
  .option(`purge`, {
    alias: `u`,
    describe: `purge client folder before building`,
    default: undefined
  })
  .option(`log-level`, {
    alias: `l`,
    type:`number`,
    describe: `verbosity`,
    default: 1
  })
  .option(`verbose`, {
    alias: `v`,
    type: `boolean`,
    describe: `log verbosely`
  })
  .option(`silent`, {
    alias: `s`,
    type: `boolean`,
    describe: `log silently`
  })
  .option(`version`, {
    type: `boolean`,
    describe: `show version`
  })
  .argv;
if(argv[`version`]){
  return console.log(version);
}
const action = argv._[0] || ``;
const tags = argv[`tag`];
const purge = argv[`purge`];
//Logging
const logLevel = argv[`verbose`] ? 2
  : argv[`silent`] ? -1
  : argv[`log-level`];
const log = logLevel > 0 ? console.log.bind(console) : function(){};
const logError = logLevel > -1 ? console.error.bind(console) : function(){};
const logVerbose = logLevel > 1 ? console.log.bind(console) : function(){};
log(`[log level ${logLevel}: ${[`errors only`,`info`,`verbose`][logLevel]}]`);
const packageFilePath = resolveCWD(`package.json`);
//Funcions
const getconfig = (path) => {
  var configpath = path ? resolveCWD(path) :
    argv[configBase] ? resolveCWD(argv[configBase]):
    configpath = resolveCWD(`${configBase}.json`);
  if(!fs.existsSync(configpath)) configpath = resolveCWD(configBase);
  if(!fs.existsSync(configpath))
    return logError(new Error(`missing ${configBase}: ${configpath}`));
  log(`loading config file : ${configpath}`);
  return JSON.parse(fs.readFileSync(configpath));
};
const build = function * (config){
  if(!config) return logError(new Error(`valid ${configBase} required to build`));
  logVerbose(
`building with:
${JSON.stringify(config, undefined, ` `)}`);
  config.dir = config.dir || defaultDirectory;
  if(purge === true){
    log(`forceing purge ${resolveCWD(config.dir)}...`);
    rmdir(resolveCWD(config.dir));
    return log(`purged!`);
  }
  else if(config.purge === true && purge !== false){
    //Purge previous build
    log(`purging ${resolveCWD(config.dir)}...`);
    rmdir(resolveCWD(config.dir));
    log(`purged!`);
  }
  //Create directory for build
  try{
    fs.mkdirSync(resolveCWD(config.dir));
  }catch(error){
    if(error.code !== "EEXIST")
      return logError(new Error(`Error creating directory: ${error}`));
    else
      log(`${config.dir} already exists`)
  }
  log(`building files...`);
  if(tags.length)
    log(`running steps tagged with: ${tags.join(`,`)}`);
  const unordered = (config.nails || [])
    .filter($=>$.order === undefined);
  const ordered = (config.nails || [])
      .filter($=>$.order !== undefined)
      .sort((a,b)=>a.order - b.order);
  //Unordered
  for(var step of unordered){
    if(tags.length){
      let tagged = true;
      const stepTags = typeof step.tag === 'object' ? step.tag : [step.tag];
      for(let i = 0; i < tags.length; i++)
        if(stepTags.indexOf(tags[i]) === -1) {
          tagged = false;
          break;
        }
      if(!tagged) continue;
    }
    let run;
    if(!step.plugin){
      log(`skipping buildstep with missing plugin.`);
      logVerbose(step);
      continue;
    }
    step.config = {
      name : config.name,
      dir : config.dir,
      purge : config.purge,
      'log-level' : logLevel
    };
    if([`.`, `/`].indexOf(step.plugin[0]) >= 0){
      run = require(resolveCWD(step.plugin));
    }
    else{

      try{
        run = require(step.plugin);
      }catch(error){
        if (error.code === 'MODULE_NOT_FOUND'){
          logVerbose(`installing module ${step.plugin}`);
          exec(`npm install ${step.plugin}`,{stdio:[0, 1, 2]});
          run = require(step.plugin);
        }else{
          logError(new Error(`Error loading plugin: ${error}`));
          log(`skipping ${step.plugin}.`);
          continue;
        }
      }
    }

    const unordedId = String(Math.random()).substr(2, 5);
    log(`starting ${step.plugin}... (id:${unordedId})`);
    (function(){
      const endstep = step.plugin;
      const localId = unordedId;
      const startTime = Number(Date.now());
      run(step)
      .then(()=>{
        log(`finished ${endstep}. (id:${localId}) ${(Number(Date.now()) - startTime)/1000} sec`);
      }).catch(logError);
    })()
  }
  //Ordered
  co(function*(){
    for(var step of ordered){
      if(tags.length){
        let tagged = true;
        const stepTags = typeof step.tag === 'object' ? step.tag : [step.tag];
        for(let i = 0; i < tags.length; i++)
          if(stepTags.indexOf(tags[i]) === -1) {
            tagged = false;
            break;
          }
        if(!tagged) continue;
      }
      let run;
      step.config = {
        name : config.name,
        dir : config.dir,
        purge : config.purge,
        'log-level' : logLevel
      };
      if([`.`, `/`].indexOf(step.plugin[0]) >= 0){
        run = require(resolveCWD(step.plugin));
      }
      else{
        try{
          run = require(step.plugin);
        }catch(error){
          if (error.code === 'MODULE_NOT_FOUND'){
            logVerbose(`installing module ${step.plugin}`);
            exec(`npm install ${step.plugin}`,{stdio:[0, 1, 2]});
            run = require(step.plugin);
          }else{
            logError(new Error(`Error loading plugin: ${error}`));
            log(`skipping ${step.plugin}.`);
            continue;
          }
        }
      }
      log(`starting ${step.plugin}... [order:${step.order}] `);
      const startTime = Number(Date.now());
      try{
        yield run(step);
      }catch(error){
        logError(error);
      }
      log(`finished ${step.plugin}. [order:${step.order}] ${(Number(Date.now()) - startTime)/1000} sec`);
    }
  }).catch(logError);
};
const checkConfig = () => {
  const config = getconfig();
  if(!config) (new inquisitor({
    config: {
      type: `input`,
      message: `Create ${configBase}?`,
      default: `y`
    },
    dir: {
      type: 'input',
      message: `Define output directory?`,
      default: defaultDirectory
    },
  }))
    .ask([`config`, `dir`])
      .then(answers => {
        if(answers.config[0].trim().toLowerCase() !== 'y') return getconfig();
        const config = {};
        if(answers.dir) config.dir = answers.dir;
        fs.writeFileSync(resolveCWD(configBase),
        JSON.stringify(config, undefined, `  `));
        return config;
      })
      .then(config=>co(build(config))).catch(logError);
  else co(build(config)).catch(logError);
};
//Do not exectue, but rather add script
if(argv.add){
  const command = process.argv.slice(2).join(' ')
    .replace(/\-{1,2}a(?:dd){0,1}\s{0,}=?\s{0,}[A-z][A-z0-9\-]{0,}/, ``)
  let pack;
  try{
    pack = JSON.parse(fs.readFileSync(packageFilePath));
    log(`installing npm script...`);
    pack.scripts = pack.scripts || {};
    pack.scripts[argv.add]= `node ./node_modules/${packageName} ${command}`;
    log(`script installed as 'npm run ${argv.add}'!`);
    return fs.writeFileSync(packageFilePath, JSON.stringify(pack, undefined, `  `));
  }catch(error){
    return logError(new Error(`valid 'package.json' file required: ${error}`));
  }
}
//Do not exectue, but rather purge folder
if(argv.purge){
  try{
    return rmdir(resolveCWD(getconfig().dir || defaultDirectory));
  }catch(error){
    return logError(new Error(`valid ${configBase} required to purge: ${error}`));
  }
}
return checkConfig();
