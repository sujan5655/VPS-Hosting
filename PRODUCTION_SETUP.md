# 🚀 Production Setup Guide

## 📁 Secure Script Structure

```
src/scripts/
├── setupProduction.ts    ✅ Main production setup
├── createAdmin.ts        ✅ Admin creation (env vars)
├── seedRBAC.ts          ✅ Roles & permissions
├── dev/                 🧪 Development only
│   ├── createTestUsers.ts
│   ├── createEcommerceTestUsers.ts
│   └── updateExistingUserRoles.ts
└── tools/               🔧 Optional tools
    ├── checkUserData.ts
    ├── fixUserRoles.ts
    └── showRoleIds.ts
```

## 🔐 ONE Command Production Setup

```bash
# Set your admin credentials
export ADMIN_EMAIL="admin@yourapp.com"
export ADMIN_PASSWORD="StrongPassword123!"

# Run the complete setup
npm run build && npx tsx src/scripts/setupProduction.ts
```

## 📋 What Happens Step-by-Step

1. **seedRBAC** → Creates roles + permissions (35 permissions across 8 categories)
2. **createAdmin** → Creates first admin user with secure credentials
3. **Done** ✅ Your system is ready!

## 🔐 Security Features

- ✅ **No hardcoded passwords** - Uses environment variables
- ✅ **No auto-execution** - Scripts only run when called
- ✅ **Safe to re-run** - Uses `ignoreDuplicates` in database
- ✅ **Admin-only access** - Test scripts isolated in `/dev`
- ✅ **Production secrets** - `.env` excluded from git

## 🚀 After Setup

**NEVER run scripts again!** Use the API instead:

### Create New Users
```bash
POST /api/auth/register
{
  "name": "New User",
  "email": "user@example.com", 
  "password": "password123"
}
```

### Assign Roles (Admin Only)
```bash
PUT /api/users/role
Authorization: Bearer <admin-token>
{
  "userId": "user-uuid",
  "newRoleId": "role-uuid"
}
```

### Get Available Roles
```bash
GET /api/users/roles
Authorization: Bearer <admin-token>
```

## ⚠️ Security Rules

### ✅ DO IN PRODUCTION
- Run `setupProduction.ts` once
- Use API for all user management
- Keep `.env` file secure
- Use strong admin passwords

### ❌ NEVER IN PRODUCTION
- Run test scripts from `/dev` folder
- Use hardcoded passwords
- Expose script files via API
- Run setup multiple times unnecessarily

## 🧪 Development vs Production

| Development | Production |
|-------------|------------|
| `createTestUsers.ts` | ❌ Remove |
| `admin123` passwords | ❌ Use strong passwords |
| Multiple auto-users | ❌ Manual user creation |
| Script-based management | ✅ API-based management |

## 🔧 Emergency Tools

If you need to fix data issues:

```bash
# Check user data (safe)
npx tsx src/scripts/tools/checkUserData.ts

# Fix missing roles (use carefully)
npx tsx src/scripts/tools/fixUserRoles.ts
```

## 🎯 Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Run production setup:**
   ```bash
   ADMIN_EMAIL="admin@yourapp.com" \
   ADMIN_PASSWORD="StrongPass123!" \
   npx tsx src/scripts/setupProduction.ts
   ```

3. **Start your application:**
   ```bash
   npm start
   ```

4. **Login with your admin credentials and manage users via API!**
