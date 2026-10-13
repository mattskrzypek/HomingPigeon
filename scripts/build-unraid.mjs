import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';

/** Build the server edition from the shared app, with its own desk mascot and favicon. */
const root = new URL('../', import.meta.url);
const output = new URL('unraid/dist/', root);
const source = await readFile(new URL('dist/index.html', root), 'utf8');
const mascot = await readFile(new URL('unraid/mascot.svg', root), 'utf8');
const pattern = /<svg class="pigeon"[\s\S]*?<\/svg>/g;
if ([...source.matchAll(pattern)].length !== 1) throw new Error('Unraid build requires exactly one pigeon mascot in dist/index.html.');
if (!source.includes('</head>')) throw new Error('Unraid build requires a closing head tag in dist/index.html.');
const page = source.replace(pattern, mascot).replace('</head>', '<link rel="icon" type="image/svg+xml" href="favicon.svg">\n</head>');
await mkdir(output, {recursive:true});
await writeFile(new URL('index.html', output), page, 'utf8');
for (const name of ['app.js','analyzer.js','sample.js','style.css']) await copyFile(new URL('dist/'+name, root), new URL(name, output));
await copyFile(new URL('unraid/favicon.svg', root), new URL('favicon.svg', output));
console.log('Unraid edition built in unraid/dist.');
