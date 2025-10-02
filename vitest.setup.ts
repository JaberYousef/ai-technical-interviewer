/**
 * Vitest setup file
 * Global test configuration and mocks
 */

import { vi } from 'vitest';

// Mock Chrome APIs for extension tests
Object.assign(global, {
  chrome: {
    runtime: {
      sendMessage: vi.fn(),
      onMessage: {
        addListener: vi.fn()
      },
      onInstalled: {
        addListener: vi.fn()
      }
    },
    tabs: {
      query: vi.fn(),
      create: vi.fn(),
      sendMessage: vi.fn()
    },
    storage: {
      local: {
        set: vi.fn(),
        get: vi.fn()
      }
    }
  }
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};
