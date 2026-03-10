const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Data directory: XLS forrás(ok) és a generált "db" (kredit_data.json) helye.
// Lokálisan és Docker build/run után is ide kerül az adat.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFirstValue(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }
  return '';
}

// Input: XLS a data könyvtárból (env vagy első .xlsx a data/-ban, vagy alapértelmezett név)
let inputPath = process.env.INPUT_XLS;
if (!inputPath) {
  const files = fs.readdirSync(DATA_DIR, { withFileTypes: true }).filter(f => f.isFile() && /\.xlsx?$/i.test(f.name));
  if (files.length) {
    inputPath = path.join(DATA_DIR, files[0].name);
  } else {
    inputPath = path.join(DATA_DIR, '2025_creditAccList.xlsx');
  }
} else if (!path.isAbsolute(inputPath)) {
  inputPath = path.join(DATA_DIR, inputPath);
}

if (!fs.existsSync(inputPath)) {
  console.error('Excel file not found:', inputPath);
  console.error('Place your .xlsx file in the data/ directory (e.g. data/2025_creditAccList.xlsx) and run again.');
  process.exit(1);
}

const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

const outputPath = path.join(DATA_DIR, 'kredit_data.json');

const reinit = process.argv.includes('--reinit') || process.env.REINIT === '1';

// Load existing records only if not reinit (then we rebuild db from Excel only)
let existingRecords = [];
let maxExistingId = 0;
if (!reinit && fs.existsSync(outputPath)) {
  try {
    existingRecords = JSON.parse(fs.readFileSync(outputPath, 'utf8')) || [];
    existingRecords.forEach(r => {
      const n = Number(r.id);
      if (!Number.isNaN(n) && n > maxExistingId) maxExistingId = n;
    });
  } catch (e) {
    console.error('Warning: could not read existing kredit_data.json, starting fresh:', e.message);
    existingRecords = [];
    maxExistingId = 0;
  }
}

if (reinit) {
  console.log('Reinit: building db from Excel only (existing data ignored).');
}

// Convert Excel rows to our database format (ID sequence: reinit => 1,2,... else continue)
const newRecords = data.map((row, index) => ({
  id: (reinit ? index + 1 : maxExistingId + index + 1).toString(),
  institution: getFirstValue(row, ['intézmény', 'institution', 'Institution']),
  country: getFirstValue(row, ['ország', 'country', 'Country']),
  completed_subject: getFirstValue(row, ['teljesített tantárgy', 'completed subject', 'completed_subject', 'Completed subject']),
  corvinus_subject_name: getFirstValue(row, [
    'Corvinusos (elfogadtatni kívánt) tantárgy neve',
    'Corvinusos  (elfogadtatni kívánt) tantárgy neve',
    'corvinus subject name',
    'corvinus_subject_name'
  ]),
  corvinus_subject_code: getFirstValue(row, [
    'Corvinusos (elfogadtatni kívánt) tantárgy kódja',
    'Corvinusos  (elfogadtatni kívánt) tantárgy kódja',
    'corvinus subject code',
    'corvinus_subject_code'
  ]),
  academic_year: getFirstValue(row, ['tanév', 'academic_year', 'academic year', 'Academic year']),
  comment: getFirstValue(row, ['megjegyzés', 'megjegyzes', 'comment', 'Comment']),
  created_at: new Date().toISOString()
}));

const allRecords = reinit ? newRecords : existingRecords.concat(newRecords);
fs.writeFileSync(outputPath, JSON.stringify(allRecords, null, 2));

console.log('Input:', inputPath);
console.log('Output:', outputPath);
console.log(reinit ? 'Reinit: wrote' : 'Processed', newRecords.length, reinit ? 'records (db replaced).' : 'new records');
console.log('Total records in kredit_data.json:', allRecords.length);

// Upload to NAS (optional)
if (process.env.NAS_SCP_UPLOAD === '1') {
  const { exec } = require('child_process');
  const dest = 'sitkeitamas@dsm.sitkeitamas.hu:/volume1/docker/kreditbefogadas/data/';
  exec(`scp "${outputPath}" ${dest}`, (error) => {
    if (error) {
      console.error('Upload failed:', error);
    } else {
      console.log('Database uploaded to NAS successfully!');
    }
  });
}
