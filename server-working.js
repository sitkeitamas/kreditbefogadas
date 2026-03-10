const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 5000;

// Try to load full dataset from JSON file (e.g. /app/data/kredit_data.json in Docker, ./kredit_data.json locally)
let records = [];
try {
  const candidatePaths = [
    process.env.KREDIT_DATA_PATH,
    path.join(__dirname, 'data', 'kredit_data.json'),
    path.join(__dirname, 'kredit_data.json')
  ].filter(Boolean);

  for (const dataPath of candidatePaths) {
    if (!fs.existsSync(dataPath)) continue;
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(fileContent);
    if (Array.isArray(parsed)) {
      records = parsed;
      console.log(`Loaded ${records.length} records from ${dataPath}`);
      break;
    } else {
      console.error(`Data file at ${dataPath} does not contain an array, trying next candidate...`);
    }
  }

  if (records.length === 0) {
    throw new Error('No valid kredit_data.json found in any candidate path');
  }
} catch (err) {
  console.error('Could not load kredit_data.json, falling back to built-in demo data:', err.message);
  records = [
    {id:'1',institution:'Aalto University',country:'Finland',completed_subject:'Integrated Marketing Communications',corvinus_subject_name:'Marketing',corvinus_subject_code:'293NMARK370B',academic_year:'2023/24'},
    {id:'2',institution:'Aalto University',country:'Finland',completed_subject:'Managing Organizational Behaviour',corvinus_subject_name:'Organizational Theory and Behavior',corvinus_subject_code:'293NMANK481B',academic_year:'2023/24'},
    {id:'3',institution:'University of Oxford',country:'United Kingdom',completed_subject:'Computer Science',corvinus_subject_name:'Programming Fundamentals',corvinus_subject_code:'CS101',academic_year:'2023/24'},
    {id:'4',institution:'University of Cambridge',country:'United Kingdom',completed_subject:'Economics',corvinus_subject_name:'Microeconomics',corvinus_subject_code:'ECON201',academic_year:'2023/24'},
    {id:'5',institution:'Stanford University',country:'United States',completed_subject:'Business Administration',corvinus_subject_name:'Management',corvinus_subject_code:'BUS101',academic_year:'2022/23'},
    {id:'6',institution:'Eötvös Loránd Tudományegyetem',country:'Hungary',completed_subject:'Matematika',corvinus_subject_name:'Mathematical Analysis',corvinus_subject_code:'MATH101',academic_year:'2024/25'},
    {id:'7',institution:'Budapesti Műszaki és Gazdaságtudományi Egyetem',country:'Hungary',completed_subject:'Physics',corvinus_subject_name:'Classical Mechanics',corvinus_subject_code:'PHYS101',academic_year:'2024/25'},
    {id:'8',institution:'University of Amsterdam',country:'Netherlands',completed_subject:'Data Science',corvinus_subject_name:'Machine Learning',corvinus_subject_code:'DS301',academic_year:'2023/24'},
    {id:'9',institution:'Technical University of Munich',country:'Germany',completed_subject:'Engineering',corvinus_subject_name:'Mechanical Engineering',corvinus_subject_code:'ENG201',academic_year:'2023/24'},
    {id:'10',institution:'University of Copenhagen',country:'Denmark',completed_subject:'Biology',corvinus_subject_name:'Molecular Biology',corvinus_subject_code:'BIO301',academic_year:'2023/24'}
  ];
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kreditbefogadás</title><style>body{font-family:Arial,sans-serif;margin:20px}.container{max-width:800px;margin:0 auto}.section{background:white;padding:20px;margin-bottom:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.btn{background:#3498db;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;margin:5px 0}.btn:hover{background:#2980b9}select{width:100%;padding:8px;margin:5px 0;border:1px solid #ddd;border-radius:4px}table{width:100%;border-collapse:collapse}th,td{padding:10px;text-align:left;border-bottom:1px solid #ddd}th{background:#f5f5f5}.stats{background:#f8f9fa;padding:15px;border-radius:4px;margin-bottom:20px}.stats h3{margin-top:0;color:#333}</style></head><body><div class="container"><h1>Kreditbefogadás</h1><div class="stats"><h3>Statisztika</h3><p>Összes rekord: <span id="totalRecords">' + records.length + '</span></p><p>Egyedi országok: <span id="totalCountries">' + [...new Set(records.map(r => r.country))].length + '</span></p><p>Egyedi intézmények: <span id="totalInstitutions">' + [...new Set(records.map(r => r.institution))].length + '</span></p></div><div class="section"><h2>Szűrők</h2><select id="countryFilter" onchange="loadData()"><option value="">Minden ország</option></select><select id="institutionFilter" onchange="loadData()"><option value="">Minden intézmény</option></select><select id="subjectFilter" onchange="loadData()"><option value="">Minden tantárgy</option></select><select id="academicYearFilter" onchange="loadData()"><option value="">Minden tanév</option></select><button class="btn" onclick="clearFilters()">Szűrők törlése</button></div><div class="section"><h2>Adatok</h2><table id="dataTable"><thead><tr><th>Intézmény</th><th>Ország</th><th>Teljesített tantárgy</th><th>Corvinusos tantárgy neve</th><th>Corvinusos tantárgy kódja</th><th>Tanév</th></tr></thead><tbody id="tableBody"></tbody></table></div></div><script>let allRecords = ' + JSON.stringify(records) + '; function loadData(){updateFilters();updateTable();} function updateFilters(){const countrySelect = document.getElementById("countryFilter");const institutionSelect = document.getElementById("institutionFilter");const subjectSelect = document.getElementById("subjectFilter");const academicYearSelect = document.getElementById("academicYearFilter");const selectedCountry = countrySelect.value;const selectedInstitution = institutionSelect.value;const selectedSubject = subjectSelect.value;const selectedYear = academicYearSelect.value;const base = allRecords;const countries = [...new Set(base.filter(r => (!selectedInstitution || r.institution === selectedInstitution) && (!selectedSubject || r.completed_subject === selectedSubject) && (!selectedYear || r.academic_year === selectedYear)).map(r => r.country).filter(Boolean))];const institutions = [...new Set(base.filter(r => (!selectedCountry || r.country === selectedCountry) && (!selectedSubject || r.completed_subject === selectedSubject) && (!selectedYear || r.academic_year === selectedYear)).map(r => r.institution).filter(Boolean))];const subjects = [...new Set(base.filter(r => (!selectedCountry || r.country === selectedCountry) && (!selectedInstitution || r.institution === selectedInstitution) && (!selectedYear || r.academic_year === selectedYear)).map(r => r.completed_subject).filter(Boolean))];const academicYears = [...new Set(base.filter(r => (!selectedCountry || r.country === selectedCountry) && (!selectedInstitution || r.institution === selectedInstitution) && (!selectedSubject || r.completed_subject === selectedSubject)).map(r => r.academic_year).filter(Boolean))];countrySelect.innerHTML = "<option value=\\"\\">Minden ország</option>";countries.forEach(country => {countrySelect.innerHTML += "<option value=\\"" + country + "\\">" + country + "</option>";});if (selectedCountry && countries.includes(selectedCountry)) {countrySelect.value = selectedCountry;}institutionSelect.innerHTML = "<option value=\\"\\">Minden intézmény</option>";institutions.forEach(institution => {institutionSelect.innerHTML += "<option value=\\"" + institution + "\\">" + institution + "</option>";});if (selectedInstitution && institutions.includes(selectedInstitution)) {institutionSelect.value = selectedInstitution;}subjectSelect.innerHTML = "<option value=\\"\\">Minden tantárgy</option>";subjects.forEach(subject => {subjectSelect.innerHTML += "<option value=\\"" + subject + "\\">" + subject + "</option>";});if (selectedSubject && subjects.includes(selectedSubject)) {subjectSelect.value = selectedSubject;}academicYearSelect.innerHTML = "<option value=\\"\\">Minden tanév</option>";academicYears.forEach(year => {academicYearSelect.innerHTML += "<option value=\\"" + year + "\\">" + year + "</option>";});if (selectedYear && academicYears.includes(selectedYear)) {academicYearSelect.value = selectedYear;}document.getElementById("totalRecords").textContent = allRecords.length;document.getElementById("totalCountries").textContent = new Set(base.map(r => r.country).filter(Boolean)).size;document.getElementById("totalInstitutions").textContent = new Set(base.map(r => r.institution).filter(Boolean)).size;}function updateTable(){const country = document.getElementById("countryFilter").value;const institution = document.getElementById("institutionFilter").value;const subject = document.getElementById("subjectFilter").value;const academicYear = document.getElementById("academicYearFilter").value;let filtered = allRecords;if(country)filtered = filtered.filter(r => r.country === country);if(institution)filtered = filtered.filter(r => r.institution === institution);if(subject)filtered = filtered.filter(r => r.completed_subject === subject);if(academicYear)filtered = filtered.filter(r => r.academic_year === academicYear);const tableBody = document.getElementById("tableBody");tableBody.innerHTML = "";if(filtered.length === 0){tableBody.innerHTML = "<tr><td colspan=\\"6\\" style=\\"text-align:center;padding:20px;color:#666\\">Nincs találat</td></tr>";}else{filtered.forEach(record => {const row = tableBody.insertRow();row.innerHTML = "<td>" + (record.institution || "") + "</td><td>" + (record.country || "") + "</td><td>" + (record.completed_subject || "") + "</td><td>" + (record.corvinus_subject_name || "") + "</td><td>" + (record.corvinus_subject_code || "") + "</td><td>" + (record.academic_year || "") + "</td>";});}}function clearFilters(){document.getElementById("countryFilter").value = "";document.getElementById("institutionFilter").value = "";document.getElementById("subjectFilter").value = "";document.getElementById("academicYearFilter").value = "";updateFilters();updateTable();}window.onload = function(){updateFilters();updateTable();};</script></body></html>';
    res.end(html);
  } else if (parsedUrl.pathname === '/api/records') {
    res.writeHead(200);
    res.end(JSON.stringify({ records }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
