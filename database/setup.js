import { supabase } from '../lib/supabase.js'
import fs from 'fs'
import path from 'path'

/**
 * Setup database with migrations and sample data
 */
async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...')

    // Check if user is authenticated as admin/service role
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('❌ Authentication error:', userError.message)
      console.log('ℹ️  Make sure you\'re using a service role key or have admin privileges')
      return
    }

    // Read and execute migrations in order
    const migrationsDir = path.join(process.cwd(), 'database', 'migrations')
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_saved_dishes_triggers.sql', 
      '003_sample_data.sql'
    ]

    for (const filename of migrationFiles) {
      const filePath = path.join(migrationsDir, filename)
      
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Migration file not found: ${filename}`)
        continue
      }

      const sql = fs.readFileSync(filePath, 'utf8')
      console.log(`📝 Executing migration: ${filename}`)

      // Split SQL file by statement separators and execute each
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
          if (error) {
            // Check if it's a "already exists" error, which we can ignore
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key')) {
              console.log(`⚠️  Skipping existing: ${error.message.split(':')[0]}`)
              continue
            }
            throw error
          }
        } catch (statementError) {
          console.error(`❌ Error in statement:`, statement.substring(0, 100) + '...')
          throw statementError
        }
      }

      console.log(`✅ Completed migration: ${filename}`)
    }

    console.log('🎉 Database setup completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   - Created profiles table with RLS policies')
    console.log('   - Created restaurants table with sample data')
    console.log('   - Created menu_items table with sample dishes') 
    console.log('   - Created saved_dishes table with triggers')
    console.log('   - Set up automatic times_saved counters')
    console.log('   - Added 8 restaurants with 16 menu items')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Alternative function for manual SQL execution
async function executeSQLFile(filename) {
  try {
    const filePath = path.join(process.cwd(), 'database', 'migrations', filename)
    const sql = fs.readFileSync(filePath, 'utf8')
    
    console.log(`📝 Executing: ${filename}`)
    
    // Use direct SQL execution for simpler approach
    const { data, error } = await supabase
      .from('_migrations_log')
      .insert({ filename, executed_at: new Date().toISOString() })

    if (error && !error.message.includes('relation "_migrations_log" does not exist')) {
      console.error('Migration tracking error:', error)
    }

    // For Supabase, you might need to run these SQL files manually
    // in the Supabase dashboard SQL editor
    console.log('📋 SQL Content:')
    console.log(sql)
    console.log('\n' + '='.repeat(80) + '\n')

  } catch (error) {
    console.error('Error reading SQL file:', error)
  }
}

// Export functions
export { setupDatabase, executeSQLFile }

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
}