import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { loadPRD, loadTechStack } from './loader';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn()
}));

// Mock path module
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/'))
}));

describe('Configuration Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadPRD', () => {
    it('should load and parse PRD JSON successfully', () => {
      const mockPRD = {
        project: 'AI Interview Coach',
        owner: 'Yousef Jaber',
        features: [{ id: 'F1', name: 'Test Feature' }],
        roadmap: [{ phase: 1, title: 'Test Phase' }]
      };

      (readFileSync as any).mockReturnValue(JSON.stringify(mockPRD));

      const result = loadPRD();

      expect(result).toEqual(mockPRD);
      expect(readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('docs/prd.json'),
        'utf-8'
      );
    });

    it('should throw error when PRD file cannot be read', () => {
      (readFileSync as any).mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => loadPRD()).toThrow('PRD loading failed: File not found');
    });

    it('should throw error when PRD JSON is invalid', () => {
      (readFileSync as any).mockReturnValue('invalid json');

      expect(() => loadPRD()).toThrow();
    });
  });

  describe('loadTechStack', () => {
    it('should load and parse tech stack JSON successfully', () => {
      const mockTechStack = {
        project: 'AI Interview Coach',
        monorepo: { enabled: true, package_manager: 'pnpm' },
        frontend: { framework: 'Next.js' },
        phases: [{ phase: 1, scope: ['web'] }]
      };

      (readFileSync as any).mockReturnValue(JSON.stringify(mockTechStack));

      const result = loadTechStack();

      expect(result).toEqual(mockTechStack);
      expect(readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('docs/techstack.json'),
        'utf-8'
      );
    });

    it('should throw error when tech stack file cannot be read', () => {
      (readFileSync as any).mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => loadTechStack()).toThrow('Tech Stack loading failed: File not found');
    });
  });
});
