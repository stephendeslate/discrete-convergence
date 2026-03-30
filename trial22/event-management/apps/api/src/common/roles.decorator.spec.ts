import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles Decorator', () => {
  it('should export ROLES_KEY constant', () => {
    expect(ROLES_KEY).toBe('roles');
    expect(typeof ROLES_KEY).toBe('string');
  });

  it('should export Roles as a function', () => {
    expect(Roles).toBeDefined();
    expect(typeof Roles).toBe('function');
  });
});
