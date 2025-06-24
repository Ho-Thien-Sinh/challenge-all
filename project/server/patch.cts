// patch.cjs
const fs = require('fs');
const path = require('path');

// Fix for ESM compatibility
const content = `// @ts-check
/// <reference types="node" />

// Note: type annotations allow type checking and IDEs autocompletion

const { withEsbuildOverride } = require('remix-esbuild-override');

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildPath: 'build/index.js',
  server: './server.js',
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [
    /^rehype.*/,
    /^remark.*/,
    /^micromark.*/,
    /^unified.*/,
    /^unist.*/,
    /^hast.*/,
    /^bail.*/,
    /^trough.*/,
    /^mdast.*/,
    /^vfile.*/,
    /^property-information.*/,
    /^space-separated-tokens.*/,
    /^comma-separated-tokens.*/,
    /^web-vitals.*/
  ]
};
`;

// Write the configuration file
fs.writeFileSync(
  path.join(process.cwd(), 'remix.config.js'),
  content,
  'utf-8'
);

console.log('Patch applied successfully!');
