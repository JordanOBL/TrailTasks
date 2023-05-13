import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
// import pool from './db/config.js';
import pkg from 'pg';
const {Pool} = pkg;
const PGUSER = 'jordan';
//const PGHOST = '192.168.76.16';
const PGHOST = 'localhost';
const PGDBNAME = 'trailtasks';
const PGPORT = 5433;
const PGPASSWORD = '4046';

const pool = new Pool({
  user: PGUSER,
  host: PGHOST,
  database: PGDBNAME,
  password: PGPASSWORD,
  port: PGPORT,
});

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(cors());

app.get('/api/tables', (req, res) => {
  const query = `SELECT * FROM trails;`;
  pool.query(query, [], (err, results) => {
    if (err) {
      console.error('error', err);
      return;
    }
    console.log(results.rows);
    res.json(results);
  });
});

const connect = async () => {
  try {
    pool.connect(err => {
      if (err) {
        throw err;
      }
      console.log('connected to Postgres database trailtasks!');
    });

    app.listen(5500, () => {
      console.log('connected to express server trailtasks!');
    });
  } catch (err) {
    console.log(err);
  }
};

connect();
