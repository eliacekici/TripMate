import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.DB_PASSWORD) {
    // This will throw an error if the password is undefined
    console.error("FATAL ERROR: DB_PASSWORD is not set in environment variables.");
    process.exit(1); 
}


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tripmate_signup_db',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

export default pool;
