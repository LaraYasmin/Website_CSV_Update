import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParser from 'csv-parser';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const app = express();
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');

app.use(express.json());
app.use(cors());

let db: Database;

async function initDatabase() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      city TEXT,
      country TEXT,
      favorite_sport TEXT
    )
  `);
}

initDatabase();

app.post('/api/files', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const filePath = req.file.path;
    const results: any[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser({ separator: ',' }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve());
    });

    await db.run('BEGIN');
    for (const row of results) {
      await db.run(
        'INSERT INTO users (name, city, country, favorite_sport) VALUES (?, ?, ?, ?)',
        [row.name, row.city, row.country, row.favorite_sport]
      );
    }
    await db.run('COMMIT');

    res.status(200).json({ message: 'The file was uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string;

    if (!searchTerm) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    const query = `
      SELECT * FROM users 
      WHERE LOWER(name) LIKE '%' || LOWER(?) || '%' 
      OR LOWER(city) LIKE '%' || LOWER(?) || '%' 
      OR LOWER(country) LIKE '%' || LOWER(?) || '%' 
      OR LOWER(favorite_sport) LIKE '%' || LOWER(?) || '%'
    `;

    const rows = await db.all(query, [searchTerm, searchTerm, searchTerm, searchTerm]);

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users', error });
  }
});

export default app;