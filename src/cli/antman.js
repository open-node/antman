#!/usr/bin/env node

const util = require("util");
const actions = require("./actions/");

const action = process.argv[2];
const args = process.argv.slice(3);

const fn = actions[action];
if (!util.isFunction(fn)) throw Error(`Not found action: ${action}`);
fn(...args);
