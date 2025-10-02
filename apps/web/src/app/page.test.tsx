import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

// Mock the session store
vi.mock('@/stores/session', () => ({
  useSessionStore: () => ({
    isActive: false,
    duration: 25,
    startSession: vi.fn(),
    stopSession: vi.fn(),
    updateDuration: vi.fn(),
    currentPhase: 'setup'
  })
}));

// Mock fetch
global.fetch = vi.fn();

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({
        project: 'AI Interview Coach',
        owner: 'Yousef Jaber',
        goals: ['Test goal 1', 'Test goal 2'],
        features: [
          { id: 'F1', name: 'Test Feature 1' },
          { id: 'F2', name: 'Test Feature 2' }
        ],
        roadmap: [
          { phase: 1, title: 'Test Phase 1' },
          { phase: 2, title: 'Test Phase 2' }
        ]
      })
    });
  });

  it('should render the main heading', () => {
    render(<HomePage />);
    
    expect(screen.getByText('AI Interview Coach')).toBeInTheDocument();
  });

  it('should display session controls', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Start Session')).toBeInTheDocument();
  });

  it('should show timer display', () => {
    render(<HomePage />);
    
    // Timer should show 25:00 by default
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('should display settings link', () => {
    render(<HomePage />);
    
    expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
  });

  it('should display PRD JSON link', () => {
    render(<HomePage />);
    
    expect(screen.getByRole('link', { name: /View PRD JSON/i })).toBeInTheDocument();
  });
});
