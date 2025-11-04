import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config()

// PostgreSQL client setup
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.on("connect", ()=> {
    console.log("connected to database")
})

pool.on("error", ()=> {
    console.error("unexpected error or idle client", error);
})

export default pool;