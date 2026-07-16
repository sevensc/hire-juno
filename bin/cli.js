#!/usr/bin/env node
import { run } from '../src/install.js';

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
