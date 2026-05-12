import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import { sequelize } from "../config/database";

export const cleanDatabase = async () => {
  try {
    console.log('🧹 Cleaning database...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Disable foreign key constraints temporarily
    await sequelize.query('SET session_replication_role = replica;');
    
    // Truncate all tables
    const tables = [
      'messages', 'jobs', 'connections', 'posts', 'profiles',
      'role_permissions', 'user_roles', 'users', 'roles', 'permissions', 'refresh_tokens'
    ];

    for (const table of tables) {
      await sequelize.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
      console.log(`🗑️ Truncated table: ${table}`);
    }

    // Re-enable foreign key constraints
    await sequelize.query('SET session_replication_role = DEFAULT;');

    console.log('✅ Database cleaned successfully');
    console.log('🔄 Database is now fresh and ready for seeding');

  } catch (error) {
    console.error('❌ Failed to clean database:', error);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  cleanDatabase();
}
