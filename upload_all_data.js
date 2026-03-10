const fs = require('fs');
const { exec } = require('child_process');

// Read the CSV file
const csv = fs.readFileSync('2025_creditAccList.csv', 'utf8');
const lines = csv.split('\n');
const headers = lines[0].split(',').map(h => h.trim());

// Convert CSV to JSON
const records = [];
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',').map(v => v.trim());
  if (values.length >= headers.length && values[0]) {
    const record = {
      id: (i).toString(),
      institution: values[0] || '',
      country: values[1] || '',
      completed_subject: values[2] || '',
      corvinus_subject_name: values[3] || '',
      corvinus_subject_code: values[4] || '',
      academic_year: values[5] || '',
      created_at: new Date().toISOString()
    };
    records.push(record);
  }
}

// Save to JSON
fs.writeFileSync('kredit_data_full.json', JSON.stringify(records, null, 2));
console.log(`Processed ${records.length} records`);

// Copy to NAS via SSH (manual step needed)
console.log('Manual upload required:');
console.log('1. Copy kredit_data_full.json to NAS');
console.log('2. SSH: ssh sitkeitamas@dsm.sitkeitamas.hu');
console.log('3. Paste: cat > /volume1/docker/kreditbefogadas/data/kredit_data.json');
console.log('4. Paste JSON content');
console.log('5. Press Ctrl+D');
