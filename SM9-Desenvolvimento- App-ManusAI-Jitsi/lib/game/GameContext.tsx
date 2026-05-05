// ============================================================
// EscapeCall — GameContext
// Contexto global do jogo — Provider + hooks
// ============================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import { GameSession, GameAction, GameStatus, Player } from '../domain/types';
import { gameReducer, createInitialSession } from './GameManager';
import { PuzzleEngine } from './PuzzleEngine';

// ─── Contexto ─────────────────────────────────────────────────
interface GameContextValue {
  session: GameSession;
  dispatch: React.Dispatch<GameAction>;
  engine: PuzzleEngine;
  startGame: () => void;
  submitAnswer: (answer: string) => void;
  openPuzzle: () => void;
  closePuzzle: () => void;
  useHint: () => void;
  restart: () => void;
  currentHint: string | null;
  isTimerCritical: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────
interface GameProviderProps {
  player: Player;
  children: React.ReactNode;
}

const engineInstance = new PuzzleEngine();

export function GameProvider({ player, children }: GameProviderProps) {
  const [session, dispatch] = useReducer(
    gameReducer,
    player,
    createInitialSession
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Timer ────────────────────────────────────────────────
  useEffect(() => {
    const isActive =
      session.status === GameStatus.PLAYING ||
      session.status === GameStatus.PUZZLE;

    if (isActive && !timerRef.current) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }

    if (!isActive && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session.status]);

  // ─── Actions ──────────────────────────────────────────────
  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const openPuzzle = useCallback(() => dispatch({ type: 'OPEN_PUZZLE' }), []);
  const closePuzzle = useCallback(() => dispatch({ type: 'CLOSE_PUZZLE' }), []);
  const useHint = useCallback(() => dispatch({ type: 'USE_HINT' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  const submitAnswer = useCallback((answer: string) => {
    dispatch({ type: 'SUBMIT_ANSWER', payload: { answer } });
  }, []);

  // ─── Derived State ────────────────────────────────────────
  const currentPuzzle = engineInstance.getPuzzleByIndex(session.currentPuzzleIndex);
  const currentHint = currentPuzzle
    ? engineInstance.getHint(currentPuzzle, session.currentHintIndex)
    : null;

  const isTimerCritical = session.timeRemainingSeconds <= 120; // < 2 min

  return (
    <GameContext.Provider
      value={{
        session,
        dispatch,
        engine: engineInstance,
        startGame,
        submitAnswer,
        openPuzzle,
        closePuzzle,
        useHint,
        restart,
        currentHint,
        isTimerCritical,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
