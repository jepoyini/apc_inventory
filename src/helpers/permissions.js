// ================================================================
// FILE: src/helpers/permissions.js
// ================================================================

// Example user.permissions structure:
//
// {
//   users: { add: true, edit: true, delete: false },
//   inventory: { add: true, edit: false, delete: false },
//   qr: true,
//   reports: false
// }

export const hasPermission = (user, section, action = null) => {
  if (!user || !user.permissions) return false;

  // ✅ Handle simple boolean permissions (qr, reports, etc.)
  if (action === null) {
    return !!user.permissions[section];
  }

  // ✅ Handle nested permissions (users.add, inventory.edit, etc.)
  return !!(user.permissions[section] && user.permissions[section][action]);
};
