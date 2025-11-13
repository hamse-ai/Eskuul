import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config()

// Neon Database connection using connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("connect", ()=> {
    console.log("connected to Neon database")
})

pool.on("error", (error)=> {
    console.error("unexpected error on idle client", error);
})

export default pool;