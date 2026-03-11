export function getPermissions(user) {
  return user?.perms || []
}

export function hasPermission(user, permission) {
  const perms = getPermissions(user)

  if (perms.includes("*")) return true
  return perms.includes(permission)
}

export function hasAnyPermission(user, permissions = []) {
  const perms = getPermissions(user)

  if (perms.includes("*")) return true
  return permissions.some((p) => perms.includes(p))
}