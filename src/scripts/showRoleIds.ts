import { Role } from "../models/Role.js";
import { sequelize } from "../config/database.js";

async function showRoleIds() {
  try {
    console.log("📋 E-Commerce Role IDs:\n");

    const roles = await Role.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description'],
      order: [['name', 'ASC']]
    });

    roles.forEach(role => {
      const icon = getRoleIcon(role.name);
      console.log(`${icon} ${role.name.toUpperCase()}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Description: ${role.description}`);
      console.log('');
    });

    console.log("💡 Usage Examples:");
    console.log("```javascript");
    console.log("// Role assignment payload");
    console.log("{");
    console.log('  "userId": "user-uuid-here",');
    console.log('  "newRoleId": "2acaddee-b342-434d-9c69-a58ba9f90812" // Admin role ID');
    console.log("}");
    console.log("```");

    await sequelize.close();
  } catch (error) {
    console.error("Error fetching roles:", error);
    process.exit(1);
  }
}

function getRoleIcon(roleName: string): string {
  const icons: { [key: string]: string } = {
    'admin': '🔧',
    'manager': '👔',
    'seller': '🛍️',
    'staff': '👥',
    'user': '🛒'
  };
  return icons[roleName] || '👤';
}

showRoleIds();
