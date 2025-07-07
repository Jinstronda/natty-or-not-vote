import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://nutgdqowaqjnxtedascw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGdkcW93YXFqbnh0ZWRhc2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTI4NDIsImV4cCI6MjA2NTA2ODg0Mn0.qMp-opvv1lDphYUYtRGL9XhFlexaEBHtpcSViW3p5_Y";

// For migration, we need the service role key, but let's try with RPC first
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyMigration() {
    try {
        console.log('🚀 Starting migration application...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250707000000-review-reply-system.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📖 Migration file read successfully');
        console.log('📝 Migration contains:');
        console.log('- Creating review_replies table');
        console.log('- Creating reply_reactions table');
        console.log('- Setting up RLS policies');
        console.log('- Creating indexes and functions');
        
        // Split SQL by statements (rough approach)
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt && !stmt.startsWith('--'));
        
        console.log(`\n🔄 Executing ${statements.length} SQL statements...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement) continue;
            
            try {
                console.log(`Executing statement ${i + 1}/${statements.length}...`);
                const { error } = await supabase.rpc('exec_sql', { sql: statement });
                
                if (error) {
                    console.error(`❌ Error in statement ${i + 1}: ${error.message}`);
                    errorCount++;
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Exception in statement ${i + 1}: ${err.message}`);
                errorCount++;
            }
        }
        
        console.log(`\n📊 Migration Results:`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        
        if (errorCount === 0) {
            console.log('🎉 Migration completed successfully!');
        } else {
            console.log('⚠️  Migration completed with some errors');
        }
        
    } catch (error) {
        console.error('❌ Failed to apply migration:', error.message);
        process.exit(1);
    }
}

applyMigration();