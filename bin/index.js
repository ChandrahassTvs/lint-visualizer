#!/usr/bin/env node

const chalk = require("chalk");
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;
const yargs = require("yargs");
const fileSystem = require('fs');
var parser = require('xml2json');

const options = yargs
  .usage("Usage: lint-visualizer -p <project> [options]")
  .option("p", {
    alias: "project",
    describe: "Project Name",
    type: "string",
    demandOption: true,
  }).option("configuration", {
    alias: "c",
    describe: "Specify the configuration to use",
    type: "string",
    demandOption: false,
  }).option("tslint-config", {
    alias: "tc",
    describe: "The name of the TSLint configuration file",
    type: "string",
    demandOption: false,
  }).argv;

const red = chalk.keyword("red");
const yellow = chalk.keyword("yellow");
const orange = chalk.keyword("orange");
const green = chalk.green;
const blue = chalk.blue;
var warnings = [];
var errors = [];

executeLintCommand();


function executeLintCommand() {
  console.log(blue.bold("Please wait while we scan your project for lint issues"));
  const command = spawn('ng', getArgs());
  var output = "";
  command.stdout.on('data', (data) => {
    output += data;
  });

  command.stderr.on('data', (data) => {
    console.log(yellow(data));
  });

  command.on('error', (error) => {
    console.log(red(error));
  });

  command.on('close', (code) => {
    if (!code) {
      console.log(green.bold("\nScan completed successfully!\n"));
      processLintOutput(xmlToJson(JSON.parse(parser.toJson(output))));
    }
  });
}

function getArgs() {
  const cmdArgs = ['lint', options.p || "", '--format', 'checkstyle'];
  if (options.c) {
    cmdArgs.push(['--configuration', options.c])
  }
  if (options.tc) {
    cmdArgs.push(['--tslint-config', options.tc])
  }
  return cmdArgs;
}

function xmlToJson(output) {
  var array = [];
  output.checkstyle.file.forEach(item => {
    item.error = item.error.map(el => {
      el.name = item.name;
      el.source = (el.source || '').split('.')[2];
      return el;
    })
    array = array.concat(item.error);
  });
  return array;
}

function processLintOutput(output) {
  output = output.filter((item, index) => output.findIndex(element =>
    element.column === item.column
    && element.line === item.line
    && element.column === item.column
    && element.line === item.line
    && element.message === item.message
    && element.name === item.name
    && element.source === item.source
    && element.severity === item.severity
    ) === index && (item.id = index + 1));
  
  
  if (output.length) {
    warnings = output.filter(item=> item.severity.toLowerCase() === "warning");
    errors = output.filter(item => item.severity.toLowerCase() === "error");
  
    if (errors.length) {
      console.log(red("Error(s): " + errors.length));
    }
  
    if (warnings.length) {
      console.log(orange("Warning(s): " + warnings.length));
    }
    showOutput();
  }
}

function showOutput() {
  let data = JSON.stringify({projectName: options.project, errors, warnings});
  fileSystem.writeFileSync(`${__dirname}/public/data.json`, data);
  process.chdir(__dirname);
  exec('http-server -c-1');
  console.log('\nResults avaibale at:');
  console.log(`  http://localhost:${green(8080)}`);
  console.log(`  http://127.0.0.1:${green(8080)}`);
}
