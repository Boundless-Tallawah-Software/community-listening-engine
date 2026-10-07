import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'dist');
const staticDirectory = path.join(outputDirectory, 'static');
const cssDirectory = path.join(staticDirectory, 'css');

const removeDirectory = (directory) => {
  for (const entry of readdirSync(directory)) {
    const entryPath = path.join(directory, entry);
    if (statSync(entryPath).isDirectory()) {
      removeDirectory(entryPath);
    } else {
      unlinkSync(entryPath);
    }
  }
  rmdirSync(directory);
};

const copyDirectory = (source, destination) => {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source)) {
    const sourcePath = path.join(source, entry);
    const destinationPath = path.join(destination, entry);
    if (statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      copyFileSync(sourcePath, destinationPath);
    }
  }
};

try {
  removeDirectory(outputDirectory);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
copyDirectory(path.join(projectRoot, 'web'), outputDirectory);
copyDirectory(path.join(projectRoot, 'api/static'), staticDirectory);
mkdirSync(staticDirectory, { recursive: true });
mkdirSync(cssDirectory, { recursive: true });
copyFileSync(
  path.join(projectRoot, 'web/prospect/styles.css'),
  path.join(cssDirectory, 'prospect.css')
);
copyFileSync(
  path.join(projectRoot, 'web/styles.css'),
  path.join(cssDirectory, 'dashboard.css')
);
copyFileSync(
  path.join(projectRoot, 'web/prospect/app.js'),
  path.join(staticDirectory, 'app.js')
);
writeFileSync(
  path.join(outputDirectory, '_redirects'),
  [
    '/ /prospect 302',
    '/prospect /prospect/index.html 200',
    '/dashboard /dashboard/index.html 200',
    '/thank-you /thank-you/index.html 200',
  ].join('\n') + '\n'
);