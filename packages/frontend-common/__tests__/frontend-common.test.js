'use strict';

const frontendCommon = require('..');
const assert = require('assert').strict;

assert.strictEqual(frontendCommon(), 'Hello from frontendCommon');
console.info("frontendCommon tests passed");
