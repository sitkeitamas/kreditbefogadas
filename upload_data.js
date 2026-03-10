const XLSX = require('xlsx');
const fs = require('fs');

function getFirstValue(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }
  return '';
}

// Read the Excel file
const workbook = XLSX.readFile('2025_creditAccList.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Convert to our database format
const records = data.map((row, index) => ({
  id: (index + 1).toString(),
  // Prefer Hungarian headers (as used by server/index.js upload), but accept fallback variants too.
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
  created_at: new Date().toISOString()
}));

// Save to JSON file
fs.writeFileSync('kredit_data.json', JSON.stringify(records, null, 2));

console.log(`Processed ${records.length} records`);
console.log('Database saved to kredit_data.json');

// Upload to NAS (optional)
if (process.env.NAS_SCP_UPLOAD === '1') {
  const { exec } = require('child_process');
  exec('scp kredit_data.json sitkeitamas@dsm.sitkeitamas.hu:/volume1/docker/kreditbefogadas/data/', (error) => {
    if (error) {
      console.error('Upload failed:', error);
    } else {
      console.log('Database uploaded to NAS successfully!');
    }
  });
}
