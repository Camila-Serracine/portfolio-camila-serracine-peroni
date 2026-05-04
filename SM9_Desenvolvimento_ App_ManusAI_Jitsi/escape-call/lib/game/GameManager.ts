// ============================================================
// EscapeCall — GameManager
// Reducer puro que gerencia o estado global do jogo
// ============================================================

import { GameSession, GameAction, GameStatus, Player } from '../domain/types';
import { GAME_DURATION_SECONDS, TOTAL_PUZZLES } from '../domain/puzzles';
import { PuzzleEngine } from './PuzzleEngine';

const engine = new PuzzleEngine();

// ─── Estado Inicial ───────────────────────────────────────────
export function createInitialSession(player: Player): GameSession {
  return {
    player,
    status: GameStatus.WAITING,
    currentPuzzleIndex: 0,
    totalPuzzles: TOTAL_PUZZLES,
    timeRemainingSeconds: GAME_DURATION_SECONDS,
    startedAt: null,
    completedAt: null,
    solvedPuzzleIds: [],
    currentHintIndex: 0,
    wrongAttempts: 0,
  };
}

// ─── Reducer ──────────────────────────────────────────────────
export function gameReducer(state: GameSession, action: GameAction): GameSession {
  switch (action.type) {

    case 'START_GAME':
      return {
        ...state,
        status: GameStatus.PLAYING,
        startedAt: Date.now(),
        timeRemainingSeconds: GAME_DURATION_SECONDS,
      };

    case 'TICK': {
      const newTime = state.timeRemainingSeconds - 1;
      if (newTime <= 0) {
        return {
          ...state,
          timeRemainingSeconds: 0,
          status: GameStatus.GAME_OVER,
          completedAt: Date.now(),
        };
      }
      return { ...state, timeRemainingSeconds: newTime };
    }

    case 'OPEN_PUZZLE':
      if (state.status !== GameStatus.PLAYING) return state;
      return {
        ...state,
        status: GameStatus.PUZZLE,
        currentHintIndex: 0,
        wrongAttempts: 0,
      };

    case 'CLOSE_PUZZLE':
      if (state.status !== GameStatus.PUZZLE) return state;
      return { ...state, status: GameStatus.PLAYING };

    case 'SUBMIT_ANSWER': {
      const puzzle = engine.getPuzzleByIndex(state.currentPuzzleIndex);
      if (!puzzle) return state;

      const result = engine.validateAnswer(puzzle, action.payload.answer);

      if (!result.correct) {
        return {
          ...state,
          wrongAttempts: state.wrongAttempts + 1,
        };
      }

      // Resposta correta
      const newSolved = [...state.solvedPuzzleIds, puzzle.id];

      if (result.isLastPuzzle) {
        return {
          ...state,
          status: GameStatus.VICTORY,
          solvedPuzzleIds: newSolved,
          completedAt: Date.now(),
        };
      }

      return {
        ...state,
        status: GameStatus.PLAYING,
        currentPuzzleIndex: state.currentPuzzleIndex + 1,
        solvedPuzzleIds: newSolved,
        currentHintIndex: 0,
        wrongAttempts: 0,
      };
    }

    case 'USE_HINT': {
      const puzzle = engine.getPuzzleByIndex(state.currentPuzzleIndex);
      if (!puzzle) return state;
      const maxHints = engine.getHintCount(puzzle);
      const nextHintIndex = Math.min(state.currentHintIndex + 1, maxHints - 1);
      return { ...state, currentHintIndex: nextHintIndex };
    }

    case 'GAME_OVER':
      return {
        ...state,
        status: GameStatus.GAME_OVER,
        completedAt: Date.now(),
      };

    case 'VICTORY':
      return {
        ...state,
        status: GameStatus.VICTORY,
        completedAt: Date.now(),
      };

    case 'RESTART':
      return createInitialSession(state.player);

    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getElapsedSeconds(session: GameSession): number {
  if (!session.startedAt) return 0;
  const end = session.completedAt ?? Date.now();
  return Math.floor((end - session.startedAt) / 1000);
}
