#!/usr/bin/env node

const chalk = require("chalk");
const exec = require("child_process").exec;
const yargs = require("yargs");
const fileSystem = require('fs');

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
var warnings = [];
var errors = [];

executeLintCommand();

function executeLintCommand() {
  console.log(green.bold("Please wait while we scan your project for lint issue"));
  exec(
    `ng lint ${options.project || ""} --format=json`,
    (error, stdout, stderr) => {
      if (!stdout && error) {
        console.log(red(error));
        return;
      }
      if (stderr) {
        console.log(yellow(stderr));
      }
      processLintOutput(stdout);
    }
  );
}

function processLintOutput(output) {
  output = JSON.parse(output);
  output = output.filter((item, index) => output.findIndex(element =>
    element.endPosition.character === item.endPosition.character
    && element.endPosition.line === item.endPosition.line
    && element.endPosition.position === item.endPosition.position
    && element.startPosition.character === item.startPosition.character
    && element.startPosition.line === item.startPosition.line
    && element.startPosition.position === item.startPosition.position
    && element.failure === item.failure
    && element.name === item.name
    && element.ruleName === item.ruleName
    && element.ruleSeverity === item.ruleSeverity
    ) === index && (item.id = index + 1));
  
  
  if (output.length) {
    warnings = output.filter(item=> item.ruleSeverity.toLowerCase() === "warning");
    errors = output.filter(item => item.ruleSeverity.toLowerCase() === "error");
  
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
