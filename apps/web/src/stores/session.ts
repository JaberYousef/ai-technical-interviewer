import { create } from 'zustand';

interface SessionState {
  isActive: boolean;
  startTime: Date | null;
  duration: number; // in minutes
  currentPhase: string;
  startSession: () => void;
  stopSession: () => void;
  updateDuration: (duration: number) => void;
  setCurrentPhase: (phase: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isActive: false,
  startTime: null,
  duration: 25, // default 25 minutes
  currentPhase: 'setup',
  
  startSession: () => set({ 
    isActive: true, 
    startTime: new Date(),
    currentPhase: 'active'
  }),
  
  stopSession: () => set({ 
    isActive: false, 
    startTime: null,
    currentPhase: 'completed'
  }),
  
  updateDuration: (duration) => set({ duration }),
  
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
}));
