// TRACED:TEST-WEB-ACTIONS — Tests for server actions
import {
  createDashboard,
  deleteDashboard,
  createDataSource,
  createWidget,
  deleteWidget,
  updateDashboard,
  updateDataSource,
  loginAction,
  registerAction,
  createDashboardAction,
  createDataSourceAction,
  createWidgetAction,
} from '../lib/actions';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('Server Actions', () => {
  // VERIFY:AE-WEB-ACT-T001
  it('createDashboard returns error when name is missing', async () => {
    const formData = new FormData();
    formData.set('name', '');
    formData.set('token', 'test-token');

    const result = await createDashboard(formData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // VERIFY:AE-WEB-ACT-T002
  it('createDashboard sends POST on valid input', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', name: 'Test' }),
    });

    const formData = new FormData();
    formData.set('name', 'Test Dashboard');
    formData.set('token', 'test-token');

    const result = await createDashboard(formData);
    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // VERIFY:AE-WEB-ACT-T003
  it('deleteDashboard returns error for empty id', async () => {
    const result = await deleteDashboard('', 'test-token');
    expect(result.success).toBe(false);
  });

  // VERIFY:AE-WEB-ACT-T004
  it('createDataSource returns error when fields missing', async () => {
    const formData = new FormData();
    formData.set('name', '');
    formData.set('type', '');
    formData.set('connectionString', '');
    formData.set('token', 'test-token');

    const result = await createDataSource(formData);
    expect(result.success).toBe(false);
  });

  // VERIFY:AE-WEB-ACT-T005
  it('createWidget returns error when fields missing', async () => {
    const formData = new FormData();
    formData.set('title', '');
    formData.set('type', '');
    formData.set('dashboardId', '');
    formData.set('token', 'test-token');

    const result = await createWidget(formData);
    expect(result.success).toBe(false);
  });

  // VERIFY:AE-WEB-ACT-T006
  it('updateDashboard returns error for empty id', async () => {
    const formData = new FormData();
    formData.set('id', '');
    formData.set('name', 'Updated');
    formData.set('token', 'test-token');

    const result = await updateDashboard(formData);
    expect(result.success).toBe(false);
  });

  // VERIFY:AE-WEB-ACT-T007
  it('deleteWidget returns error for empty id', async () => {
    const result = await deleteWidget('', 'test-token');
    expect(result.success).toBe(false);
  });

  // VERIFY:AE-WEB-ACT-T008
  it('updateDataSource returns error for empty id', async () => {
    const formData = new FormData();
    formData.set('id', '');
    formData.set('name', 'Updated');
    formData.set('token', 'test-token');

    const result = await updateDataSource(formData);
    expect(result.success).toBe(false);
  });

  it('handles fetch network error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const formData = new FormData();
    formData.set('name', 'Test');
    formData.set('token', 'test-token');

    const result = await createDashboard(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('handles non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    const formData = new FormData();
    formData.set('name', 'Test');
    formData.set('token', 'test-token');

    const result = await createDashboard(formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Server error');
  });

  // Alias exports
  it('should export loginAction', () => {
    expect(typeof loginAction).toBe('function');
  });

  it('should export registerAction', () => {
    expect(typeof registerAction).toBe('function');
  });

  it('should export createDashboardAction', () => {
    expect(typeof createDashboardAction).toBe('function');
  });

  it('should export createDataSourceAction', () => {
    expect(typeof createDataSourceAction).toBe('function');
  });

  it('should export createWidgetAction', () => {
    expect(typeof createWidgetAction).toBe('function');
  });
});
