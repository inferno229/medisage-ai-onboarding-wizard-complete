const fs = require('fs');
const path = require('path');

const KB_DIR = path.join(__dirname, '../knowledge-base');
const OUTPUT_FILE = path.join(__dirname, '../knowledge-base/knowledge.json');

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
