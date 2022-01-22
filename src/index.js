const nodeVersion = process.versions.node;
const semver = nodeVersion.split('.');
const major = semver[0];

if (major < 14) {
  console.error(
    'You are running Node ' +
      nodeVersion +
      '.\n' +
      'This application requires Node 14 or higher. \n' +
      'Please update your version of Node.'
  );
  process.exit(1);
}

import { init } from './CreateApp.js';

init();