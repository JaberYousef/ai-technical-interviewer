import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('should serve PRD JSON from /api/prd', async ({ request }) => {
    const response = await request.get('/api/prd');
    
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    
    const prd = await response.json();
    
    // Check required PRD fields
    expect(prd).toHaveProperty('project');
    expect(prd).toHaveProperty('features');
    expect(prd).toHaveProperty('roadmap');
    expect(prd).toHaveProperty('goals');
    
    // Check that features is an array
    expect(Array.isArray(prd.features)).toBe(true);
    expect(prd.features.length).toBeGreaterThan(0);
  });

  test('should generate report from /api/report', async ({ request }) => {
    const sampleSessionData = {
      sessionId: 'test-session-123',
      duration: 25,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      problemStatement: 'Two Sum Problem',
      codeAttempts: ['function twoSum(nums, target) { ... }']
    };

    const response = await request.post('/api/report', {
      data: sampleSessionData
    });
    
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/markdown');
    
    const report = await response.text();
    
    // Check that report contains expected sections
    expect(report).toContain('# AI Interview Coach - Feedback Report');
    expect(report).toContain('Session Summary');
    expect(report).toContain('Rubric Assessment');
    expect(report).toContain('test-session-123');
  });

  test('should handle invalid report data gracefully', async ({ request }) => {
    const response = await request.post('/api/report', {
      data: { invalid: 'data' }
    });
    
    // Should still return 200 but with default/fallback data
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/markdown');
  });
});
