const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Database setup
const db = new sqlite3.Database('./kredit_data.db');

// Initialize database
db.serialize(() => {
  // Create main table
  db.run(`CREATE TABLE IF NOT EXISTS kredit_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution TEXT,
    country TEXT,
    completed_subject TEXT,
    corvinus_subject_name TEXT,
    corvinus_subject_code TEXT,
    academic_year TEXT,
    upload_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add missing columns if they don't exist
  db.run(`ALTER TABLE kredit_records ADD COLUMN upload_id TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('upload_id column already exists or error:', err.message);
    }
  });
  
  db.run(`ALTER TABLE kredit_records ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('created_at column already exists or error:', err.message);
    }
  });

  // Create uploads table for tracking
  db.run(`CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    filename TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    record_count INTEGER
  )`);
});

// API Routes

// Get all unique values for filters
app.get('/api/filters', (req, res) => {
  const { country, institution, subject, academicYear } = req.query;
  
  const results = {};
  
  // For countries - filter by other fields but not country itself
  const countryConditions = [];
  const countryParams = [];
  if (institution) {
    countryConditions.push('"intézmény" = ?');
    countryParams.push(institution);
  }
  if (subject) {
    countryConditions.push('"teljesített tantárgy" = ?');
    countryParams.push(subject);
  }
  if (academicYear) {
    countryConditions.push('"tanév" = ?');
    countryParams.push(academicYear);
  }
  const countryWhere = countryConditions.length > 0 ? 'WHERE ' + countryConditions.join(' AND ') + ' AND "ország" IS NOT NULL' : 'WHERE "ország" IS NOT NULL';
  
  // For institutions - filter by other fields but not institution itself
  const institutionConditions = [];
  const institutionParams = [];
  if (country) {
    institutionConditions.push('"ország" = ?');
    institutionParams.push(country);
  }
  if (subject) {
    institutionConditions.push('"teljesített tantárgy" = ?');
    institutionParams.push(subject);
  }
  if (academicYear) {
    institutionConditions.push('"tanév" = ?');
    institutionParams.push(academicYear);
  }
  const institutionWhere = institutionConditions.length > 0 ? 'WHERE ' + institutionConditions.join(' AND ') + ' AND "intézmény" IS NOT NULL' : 'WHERE "intézmény" IS NOT NULL';
  
  // For subjects - filter by other fields but not subject itself
  const subjectConditions = [];
  const subjectParams = [];
  if (country) {
    subjectConditions.push('"ország" = ?');
    subjectParams.push(country);
  }
  if (institution) {
    subjectConditions.push('"intézmény" = ?');
    subjectParams.push(institution);
  }
  if (academicYear) {
    subjectConditions.push('"tanév" = ?');
    subjectParams.push(academicYear);
  }
  const subjectWhere = subjectConditions.length > 0 ? 'WHERE ' + subjectConditions.join(' AND ') + ' AND "teljesített tantárgy" IS NOT NULL' : 'WHERE "teljesített tantárgy" IS NOT NULL';
  
  // For academic years - filter by other fields but not academicYear itself
  const academicYearConditions = [];
  const academicYearParams = [];
  if (country) {
    academicYearConditions.push('"ország" = ?');
    academicYearParams.push(country);
  }
  if (institution) {
    academicYearConditions.push('"intézmény" = ?');
    academicYearParams.push(institution);
  }
  if (subject) {
    academicYearConditions.push('"teljesített tantárgy" = ?');
    academicYearParams.push(subject);
  }
  const academicYearWhere = academicYearConditions.length > 0 ? 'WHERE ' + academicYearConditions.join(' AND ') + ' AND "tanév" IS NOT NULL' : 'WHERE "tanév" IS NOT NULL';
  
  const queries = [
    { key: 'countries', query: `SELECT DISTINCT "ország" FROM kredit_records ${countryWhere} ORDER BY "ország"`, params: countryParams },
    { key: 'institutions', query: `SELECT DISTINCT "intézmény" FROM kredit_records ${institutionWhere} ORDER BY "intézmény"`, params: institutionParams },
    { key: 'subjects', query: `SELECT DISTINCT "teljesített tantárgy" FROM kredit_records ${subjectWhere} ORDER BY "teljesített tantárgy"`, params: subjectParams },
    { key: 'academic_years', query: `SELECT DISTINCT "tanév" FROM kredit_records ${academicYearWhere} ORDER BY "tanév"`, params: academicYearParams }
  ];
  
  Promise.all(queries.map(({ key, query, params }) => {
    return new Promise((resolve) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          results[key] = [];
        } else {
          results[key] = rows.map(row => Object.values(row)[0]);
        }
        resolve();
      });
    });
  })).then(() => {
    res.json(results);
  });
});

// Get filtered records
app.get('/api/records', (req, res) => {
  const { country, institution, subject, academicYear, page = 1, limit = 50 } = req.query;
  
  let query = 'SELECT * FROM kredit_records WHERE 1=1';
  const params = [];
  
  if (country) {
    query += ' AND "ország" = ?';
    params.push(country);
  }
  if (institution) {
    query += ' AND "intézmény" = ?';
    params.push(institution);
  }
  if (subject) {
    query += ' AND "teljesített tantárgy" = ?';
    params.push(subject);
  }
  if (academicYear) {
    query += ' AND "tanév" = ?';
    params.push(academicYear);
  }
  
  // Add pagination
  const offset = (page - 1) * limit;
  query += ' ORDER BY rowid DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Get total count
      const countQuery = query.replace('SELECT * FROM', 'SELECT COUNT(*) FROM').replace('ORDER BY rowid DESC LIMIT ? OFFSET ?', '');
      db.get(countQuery, params.slice(0, -2), (err, countResult) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({
            records: rows,
            total: countResult['COUNT(*)'],
            page: parseInt(page),
            totalPages: Math.ceil(countResult['COUNT(*)'] / limit)
          });
        }
      });
    }
  });
});

// Upload Excel file
app.post('/api/upload', upload.single('excel'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const uploadId = uuidv4();
    let insertedCount = 0;

    // Process each row
    data.forEach(row => {
      const stmt = db.prepare(`INSERT INTO kredit_records 
        ("intézmény", "ország", "teljesített tantárgy", "Corvinusos  (elfogadtatni kívánt) tantárgy neve", "Corvinusos  (elfogadtatni kívánt) tantárgy kódja", "tanév", upload_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`);
      
      stmt.run([
        row['intézmény'] || row['intézmény'] || '',
        row['ország'] || '',
        row['teljesített tantárgy'] || '',
        row['Corvinusos  (elfogadtatni kívánt) tantárgy neve'] || '',
        row['Corvinusos  (elfogadtatni kívánt) tantárgy kódja'] || '',
        row['tanév'] || '',
        uploadId
      ], (err) => {
        if (!err) insertedCount++;
      });
      
      stmt.finalize();
    });

    // Track upload
    db.run('INSERT INTO uploads (id, filename, record_count) VALUES (?, ?, ?)', 
      [uploadId, req.file.originalname, data.length]);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ 
      message: 'File uploaded successfully', 
      uploadId,
      recordsProcessed: data.length,
      recordsInserted: insertedCount
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upload history
app.get('/api/uploads', (req, res) => {
  db.all('SELECT * FROM uploads ORDER BY upload_date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Delete upload and its records
app.delete('/api/uploads/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  
  db.run('DELETE FROM kredit_records WHERE upload_id = ?', [uploadId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      db.run('DELETE FROM uploads WHERE id = ?', [uploadId], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ message: 'Upload deleted successfully' });
        }
      });
    }
  });
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
