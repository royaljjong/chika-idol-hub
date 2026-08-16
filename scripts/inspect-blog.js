const fs = require('fs');
const path = 'C:\\Users\\royal\\.gemini\\antigravity-cli\\brain\\3362e0b8-e95e-48da-a986-edebd57eb58a\\.system_generated\\steps\\1073\\content.md';
const content = fs.readFileSync(path, 'utf-8');
const regex = />([^<]{2,40})<\/a>/g;
let match;
const set = new Set();
while ((match = regex.exec(content)) !== null) {
  const text = match[1].trim();
  if (text && !text.includes('http') && !text.includes('WordPress') && !text.includes('Cookie')) {
    set.add(text);
  }
}
console.log(Array.from(set).slice(0, 80));
