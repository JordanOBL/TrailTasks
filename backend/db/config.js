import pkg from 'pg';
const {Pool} = pkg;
const PGUSER = 'jordan';
//onst PGHOST = '192.168.76.16';
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

export default pool;
