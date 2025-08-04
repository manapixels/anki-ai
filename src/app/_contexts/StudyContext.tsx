'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

interface StudyState {
  currentDeck: string | null;
  currentCard: string | null;
  sessionStartTime: Date | null;
  cardsStudied: number;
  sessionType: 'new' | 'review' | 'mixed';
  isSessionActive: boolean;
}

interface StudyAction {
  type: 'START_SESSION' | 'END_SESSION' | 'NEXT_CARD' | 'STUDY_CARD' | 'SET_DECK';
  payload?: any;
}

const initialState: StudyState = {
  currentDeck: null,
  currentCard: null,
  sessionStartTime: null,
  cardsStudied: 0,
  sessionType: 'mixed',
  isSessionActive: false,
};

function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        sessionStartTime: new Date(),
        isSessionActive: true,
        cardsStudied: 0,
        currentDeck: action.payload.deckId,
        sessionType: action.payload.sessionType,
      };
    case 'END_SESSION':
      return {
        ...state,
        isSessionActive: false,
        sessionStartTime: null,
        currentCard: null,
      };
    case 'NEXT_CARD':
      return {
        ...state,
        currentCard: action.payload.cardId,
      };
    case 'STUDY_CARD':
      return {
        ...state,
        cardsStudied: state.cardsStudied + 1,
      };
    case 'SET_DECK':
      return {
        ...state,
        currentDeck: action.payload.deckId,
      };
    default:
      return state;
  }
}

interface StudyContextType {
  state: StudyState;
  startSession: (deckId: string, sessionType: StudyState['sessionType']) => void;
  endSession: () => void;
  nextCard: (cardId: string) => void;
  studyCard: () => void;
  setCurrentDeck: (deckId: string) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(studyReducer, initialState);

  const startSession = useCallback((deckId: string, sessionType: StudyState['sessionType']) => {
    dispatch({ type: 'START_SESSION', payload: { deckId, sessionType } });
  }, []);

  const endSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
  }, []);

  const nextCard = useCallback((cardId: string) => {
    dispatch({ type: 'NEXT_CARD', payload: { cardId } });
  }, []);

  const studyCard = useCallback(() => {
    dispatch({ type: 'STUDY_CARD' });
  }, []);

  const setCurrentDeck = useCallback((deckId: string) => {
    dispatch({ type: 'SET_DECK', payload: { deckId } });
  }, []);

  const value = {
    state,
    startSession,
    endSession,
    nextCard,
    studyCard,
    setCurrentDeck,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}