const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('2025_creditAccList.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Convert to our database format
const records = data.map((row, index) => ({
  id: (index + 1).toString(),
  institution: row.institution || '',
  country: row.country || '',
  completed_subject: row['completed subject'] || '',
  corvinus_subject_name: row['corvinus subject name'] || '',
  corvinus_subject_code: row['corvinus subject code'] || '',
  academic_year: row.academic_year || '',
  created_at: new Date().toISOString()
}));

// Save to JSON file
fs.writeFileSync('kredit_data.json', JSON.stringify(records, null, 2));

console.log(`Processed ${records.length} records`);
console.log('Database saved to kredit_data.json');

// Upload to NAS
const { exec } = require('child_process');
exec('scp kredit_data.json sitkeitamas@dsm.sitkeitamas.hu:/volume1/docker/kreditbefogadas/data/', (error, stdout, stderr) => {
  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Database uploaded to NAS successfully!');
  }
});
