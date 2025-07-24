const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, './psgc.json');
const fieldsToRemove = [
  'population',
  'cityClass',
  'incomeClass',
  'urbanRural',
  'oldNames',
  'status'
];

function deepClean(obj) {
  if (Array.isArray(obj)) {
    return obj.map(deepClean);
  } else if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const key in obj) {
      if (!fieldsToRemove.includes(key)) {
        cleaned[key] = deepClean(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const cleaned = deepClean(data);
fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf8');
console.log('Fields removed successfully!');