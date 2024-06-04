import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { expect } from 'jest';
import { agent } from 'supertest';
import { after } from 'node:test';

const router = Router();
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');

router.use(express.json());

const corsOptions = {
  origin: 'http://localhost:4000'
};

router.use(cors(corsOptions));
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

describe('Server', () => {
  let server: any;

  beforeEach(() => {
    server = agent(express().use(router));
  });

  afterEach(async () => {
    await db.run('DELETE FROM users');
  });

  after(async () => {
    await db.close();
  });

  it('should upload file', async () => {
    const filePath = './test/test.csv';
    const response = await server.post('/api/files')
      .attach('file', filePath)
      .expect(200);
    expect(response.body.message).to.equal('The file was uploaded successfully');
    const rows = await db.all('SELECT * FROM users');
    expect(rows.length).to.equal(2);
  });

  it('should search users', async () => {
    const searchTerm = 'John';
    await db.run(`
      INSERT INTO users (name, city, country, favorite_sport)
      VALUES ('John Doe', 'New York', 'USA', 'basketball')
    `);
    const response = await server.get(`/api/users?q=${searchTerm}`)
      .expect(200);
    expect(response.body.data.length).to.equal(1);
    expect(response.body.data[0].name).to.equal('John Doe');
  });
});

export default router;