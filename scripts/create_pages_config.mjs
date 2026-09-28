import { writeFileSync } from 'fs';
import path from 'path';

const [outputPath] = process.argv.slice(2);
const projectName = process.env.CLOUDFLARE_PAGES_PROJECT_NAME;
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;

if (!outputPath || !projectName || !databaseId) {
  throw new Error('Usage requires output path, CLOUDFLARE_PAGES_PROJECT_NAME, and CLOUDFLARE_D1_DATABASE_ID.');
}

const config = {
  name: projectName,
  pages_build_output_dir: './dist',
  compatibility_date: '2026-09-28',
  d1_databases: [
    {
      binding: 'DB',
      database_name: 'listen_engine_db',
      database_id: databaseId,
    },
  ],
  ...(process.env.CLOUDFLARE_INFORMATION_MESSAGE
    ? { vars: { INFORMATION_MESSAGE: process.env.CLOUDFLARE_INFORMATION_MESSAGE } }
    : {}),
};

writeFileSync(path.resolve(outputPath), `${JSON.stringify(config, null, 2)}\n`);