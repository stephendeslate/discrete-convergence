import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles decorator', () => {
  it('should export ROLES_KEY as "roles"', () => {
    expect(ROLES_KEY).toBe('roles');
    expect(typeof ROLES_KEY).toBe('string');
  });

  it('should export Roles as a function', () => {
    expect(Roles).toBeDefined();
    expect(typeof Roles).toBe('function');
  });
});
