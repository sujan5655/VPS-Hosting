import { User } from "./User.js";
import { Role } from "./Role.js";
import { UserRole } from "./UserRole.js";

// Define all model associations here to avoid circular imports
User.belongsToMany(Role, { through: UserRole, as: "roles" });
Role.belongsToMany(User, { through: UserRole, as: "users" });
