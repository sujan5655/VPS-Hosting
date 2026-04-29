import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { sequelize } from "../config/database.js";

async function checkUserData() {
  try {
    console.log("Checking user data...");

    // Get all users with their roles
    const users = await User.findAll({
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  - roleId: ${user.roleId}`);
      console.log(`  - role: ${user.role ? user.role.name : 'NULL'}`);
      console.log('---');
    });

    // Check available roles
    const roles = await Role.findAll();
    console.log(`\nAvailable roles:`);
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.id}`);
    });

    await sequelize.close();
  } catch (error) {
    console.error("Error checking user data:", error);
    process.exit(1);
  }
}

checkUserData();
