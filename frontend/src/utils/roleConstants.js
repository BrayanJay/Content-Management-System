export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    users: ['create', 'read', 'update', 'delete'],
    content: ['create', 'read', 'update', 'delete'],
    system: ['read', 'update'],
    logs: ['read', 'delete'],
    files: ['upload', 'delete', 'read'],
    branches: ['create', 'read', 'update', 'delete'],
    products: ['create', 'read', 'update', 'delete'],
    profiles: ['create', 'read', 'update', 'delete']
  },
  [USER_ROLES.EDITOR]: {
    users: ['read'],
    content: ['create', 'read', 'update', 'delete'],
    system: [],
    logs: ['read'],
    files: ['upload', 'delete', 'read'],
    branches: ['create', 'read', 'update', 'delete'],
    products: ['create', 'read', 'update', 'delete'],
    profiles: ['create', 'read', 'update', 'delete']
  },
  [USER_ROLES.CONTRIBUTOR]: {
    users: [],
    content: ['create', 'read', 'update'],
    system: [],
    logs: [],
    files: ['upload', 'read'],
    branches: ['create', 'read', 'update'],
    products: ['create', 'read', 'update'],
    profiles: ['create', 'read', 'update']
  },
  [USER_ROLES.VIEWER]: {
    users: [],
    content: ['read'],
    system: [],
    logs: [],
    files: ['read'],
    branches: ['read'],
    products: ['read'],
    profiles: ['read']
  }
};
