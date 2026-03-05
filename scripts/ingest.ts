import fs from 'fs';
import path from 'path';

const KB_DIR = path.join(process.cwd(), 'knowledge-base');
const OUTPUT_FILE = path.join(process.cwd(), 'knowledge-base/knowledge.json');

async function ingest() {
  const files = fs.readdirSync(KB_DIR);
  const data = [];

  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(KB_DIR, file), 'utf8');
      const title = content.split('\n')[0].replace('# ', '').trim();
      data.push({
        title,
        content,
        source: file
      });
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`Ingested ${data.length} files into ${OUTPUT_FILE}`);
}

ingest().catch(console.error);
