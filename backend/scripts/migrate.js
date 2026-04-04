require('dotenv/config')

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const databaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim()

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be configured')
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
})

const migrationsDir = path.join(__dirname, '..', 'migrations')

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT filename FROM schema_migrations')
  return new Set(result.rows.map((row) => row.filename))
}

async function applyMigration(client, filename) {
  const filePath = path.join(migrationsDir, filename)
  const sql = fs.readFileSync(filePath, 'utf8')

  await client.query('BEGIN')
  try {
    await client.query(sql)
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename])
    await client.query('COMMIT')
    process.stdout.write(`Applied ${filename}\n`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

async function main() {
  const client = await pool.connect()

  try {
    await ensureMigrationsTable(client)
    const appliedMigrations = await getAppliedMigrations(client)
    const filenames = fs.readdirSync(migrationsDir)
      .filter((filename) => filename.endsWith('.sql'))
      .sort()

    for (const filename of filenames) {
      if (!appliedMigrations.has(filename)) {
        await applyMigration(client, filename)
      }
    }

    process.stdout.write('Migrations up to date\n')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`)
  process.exit(1)
})
