// ============================================================
// EscapeCall — Unit Tests
// GameManager, PuzzleEngine, TimerManager
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { PuzzleEngine } from '../lib/game/PuzzleEngine';
import {
  gameReducer,
  createInitialSession,
  formatTime,
  getElapsedSeconds,
} from '../lib/game/GameManager';
import { GameStatus, PuzzleType } from '../lib/domain/types';
import { PUZZLES, GAME_DURATION_SECONDS, TOTAL_PUZZLES } from '../lib/domain/puzzles';

// ─── PuzzleEngine Tests ───────────────────────────────────────
describe('PuzzleEngine', () => {
  let engine: PuzzleEngine;

  beforeEach(() => {
    engine = new PuzzleEngine();
  });

  it('should return the correct total number of puzzles', () => {
    expect(engine.getTotalPuzzles()).toBe(4);
  });

  it('should return puzzle by index', () => {
    const puzzle = engine.getPuzzleByIndex(0);
    expect(puzzle).not.toBeNull();
    expect(puzzle?.id).toBe('puzzle-1-code');
    expect(puzzle?.type).toBe(PuzzleType.CODE);
  });

  it('should return null for out-of-bounds index', () => {
    expect(engine.getPuzzleByIndex(-1)).toBeNull();
    expect(engine.getPuzzleByIndex(99)).toBeNull();
  });

  it('should return puzzle by id', () => {
    const puzzle = engine.getPuzzleById('puzzle-2-visual');
    expect(puzzle).not.toBeNull();
    expect(puzzle?.type).toBe(PuzzleType.VISUAL);
  });

  it('should validate correct answer for Puzzle 1 (case-insensitive)', () => {
    const puzzle = engine.getPuzzleByIndex(0)!;
    expect(engine.validateAnswer(puzzle, '7A3F9K').correct).toBe(true);
    expect(engine.validateAnswer(puzzle, '7a3f9k').correct).toBe(true);
    expect(engine.validateAnswer(puzzle, ' 7A3F9K ').correct).toBe(true);
  });

  it('should reject wrong answer for Puzzle 1', () => {
    const puzzle = engine.getPuzzleByIndex(0)!;
    expect(engine.validateAnswer(puzzle, 'WRONG').correct).toBe(false);
    expect(engine.validateAnswer(puzzle, '').correct).toBe(false);
  });

  it('should validate correct answer for Puzzle 2', () => {
    const puzzle = engine.getPuzzleByIndex(1)!;
    expect(engine.validateAnswer(puzzle, '32').correct).toBe(true);
  });

  it('should validate correct answer for Puzzle 3', () => {
    const puzzle = engine.getPuzzleByIndex(2)!;
    expect(engine.validateAnswer(puzzle, '19').correct).toBe(true);
  });

  it('should validate correct answer for Puzzle 4 (Final)', () => {
    const puzzle = engine.getPuzzleByIndex(3)!;
    const result = engine.validateAnswer(puzzle, '7A3F9K3219');
    expect(result.correct).toBe(true);
    expect(result.isLastPuzzle).toBe(true);
  });

  it('should return hint by index', () => {
    const puzzle = engine.getPuzzleByIndex(0)!;
    const hint = engine.getHint(puzzle, 0);
    expect(hint).not.toBeNull();
    expect(typeof hint).toBe('string');
  });

  it('should return null for out-of-bounds hint index', () => {
    const puzzle = engine.getPuzzleByIndex(0)!;
    expect(engine.getHint(puzzle, 99)).toBeNull();
  });
});

// ─── GameManager (Reducer) Tests ─────────────────────────────
describe('GameManager Reducer', () => {
  const mockPlayer = { id: 'p1', name: 'Tester', roomCode: 'SALA404' };

  it('should create initial session with WAITING status', () => {
    const session = createInitialSession(mockPlayer);
    expect(session.status).toBe(GameStatus.WAITING);
    expect(session.currentPuzzleIndex).toBe(0);
    expect(session.timeRemainingSeconds).toBe(GAME_DURATION_SECONDS);
    expect(session.solvedPuzzleIds).toHaveLength(0);
  });

  it('should transition to PLAYING on START_GAME', () => {
    const session = createInitialSession(mockPlayer);
    const next = gameReducer(session, { type: 'START_GAME' });
    expect(next.status).toBe(GameStatus.PLAYING);
    expect(next.startedAt).not.toBeNull();
  });

  it('should decrement timer on TICK', () => {
    const session = createInitialSession(mockPlayer);
    const playing = gameReducer(session, { type: 'START_GAME' });
    const ticked = gameReducer(playing, { type: 'TICK' });
    expect(ticked.timeRemainingSeconds).toBe(GAME_DURATION_SECONDS - 1);
  });

  it('should transition to GAME_OVER when timer reaches 0', () => {
    const session = createInitialSession(mockPlayer);
    const playing = gameReducer(session, { type: 'START_GAME' });
    const almostDone = { ...playing, timeRemainingSeconds: 1 };
    const gameOver = gameReducer(almostDone, { type: 'TICK' });
    expect(gameOver.status).toBe(GameStatus.GAME_OVER);
    expect(gameOver.timeRemainingSeconds).toBe(0);
  });

  it('should open puzzle and change status to PUZZLE', () => {
    const session = createInitialSession(mockPlayer);
    const playing = gameReducer(session, { type: 'START_GAME' });
    const puzzle = gameReducer(playing, { type: 'OPEN_PUZZLE' });
    expect(puzzle.status).toBe(GameStatus.PUZZLE);
  });

  it('should close puzzle and return to PLAYING', () => {
    const session = createInitialSession(mockPlayer);
    const playing = gameReducer(session, { type: 'START_GAME' });
    const puzzle = gameReducer(playing, { type: 'OPEN_PUZZLE' });
    const back = gameReducer(puzzle, { type: 'CLOSE_PUZZLE' });
    expect(back.status).toBe(GameStatus.PLAYING);
  });

  it('should advance to next puzzle on correct answer', () => {
    const session = createInitialSession(mockPlayer);
    const playing = gameReducer(session, { type: 'START_GAME' });
    const puzzle = gameReducer(playing, { type: 'OPEN_PUZZLE' });
    const next = gameReducer(puzzle, { type: 'SUBMIT_ANSWER', payload: { answer: '7A3F9K' } });
    expect(next.currentPuzzleIndex).toBe(1);
    expect(next.solvedPuzzleIds).toHaveLength(1);
    expect(next.status).toBe(GameStatus.PLAYING);
  });

  it('should increment wrongAttempts on wrong answer', () => {
    const session = createInitialSession(mockPlayer);
    const playing = gameReducer(session, { type: 'START_GAME' });
    const puzzle = gameReducer(playing, { type: 'OPEN_PUZZLE' });
    const wrong = gameReducer(puzzle, { type: 'SUBMIT_ANSWER', payload: { answer: 'WRONG' } });
    expect(wrong.wrongAttempts).toBe(1);
    expect(wrong.status).toBe(GameStatus.PUZZLE);
  });

  it('should reach VICTORY after solving all puzzles', () => {
    let session = createInitialSession(mockPlayer);
    session = gameReducer(session, { type: 'START_GAME' });
    session = gameReducer(session, { type: 'OPEN_PUZZLE' });
    session = gameReducer(session, { type: 'SUBMIT_ANSWER', payload: { answer: '7A3F9K' } });
    session = gameReducer(session, { type: 'OPEN_PUZZLE' });
    session = gameReducer(session, { type: 'SUBMIT_ANSWER', payload: { answer: '32' } });
    session = gameReducer(session, { type: 'OPEN_PUZZLE' });
    session = gameReducer(session, { type: 'SUBMIT_ANSWER', payload: { answer: '19' } });
    session = gameReducer(session, { type: 'OPEN_PUZZLE' });
    session = gameReducer(session, { type: 'SUBMIT_ANSWER', payload: { answer: '7A3F9K3219' } });
    expect(session.status).toBe(GameStatus.VICTORY);
    expect(session.solvedPuzzleIds).toHaveLength(4);
  });

  it('should reset to initial state on RESTART', () => {
    let session = createInitialSession(mockPlayer);
    session = gameReducer(session, { type: 'START_GAME' });
    session = gameReducer(session, { type: 'OPEN_PUZZLE' });
    session = gameReducer(session, { type: 'SUBMIT_ANSWER', payload: { answer: '7A3F9K' } });
    const restarted = gameReducer(session, { type: 'RESTART' });
    expect(restarted.status).toBe(GameStatus.WAITING);
    expect(restarted.currentPuzzleIndex).toBe(0);
    expect(restarted.solvedPuzzleIds).toHaveLength(0);
  });
});

// ─── formatTime Tests ─────────────────────────────────────────
describe('formatTime', () => {
  it('should format 900 seconds as 15:00', () => {
    expect(formatTime(900)).toBe('15:00');
  });

  it('should format 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('should format 65 seconds as 01:05', () => {
    expect(formatTime(65)).toBe('01:05');
  });

  it('should format 119 seconds as 01:59', () => {
    expect(formatTime(119)).toBe('01:59');
  });
});

// ─── Puzzle Data Integrity Tests ──────────────────────────────
describe('Puzzle Data Integrity', () => {
  it('should have exactly 4 puzzles', () => {
    expect(PUZZLES).toHaveLength(4);
  });

  it('should have correct answers for all puzzles', () => {
    expect(PUZZLES[0].answer).toBe('7A3F9K');
    expect(PUZZLES[1].answer).toBe('32');
    expect(PUZZLES[2].answer).toBe('19');
    expect(PUZZLES[3].answer).toBe('7A3F9K3219');
  });

  it('should have hints for all puzzles', () => {
    PUZZLES.forEach((puzzle) => {
      expect(puzzle.hints.length).toBeGreaterThan(0);
    });
  });

  it('should have correct puzzle types', () => {
    expect(PUZZLES[0].type).toBe(PuzzleType.CODE);
    expect(PUZZLES[1].type).toBe(PuzzleType.VISUAL);
    expect(PUZZLES[2].type).toBe(PuzzleType.AUDIO);
    expect(PUZZLES[3].type).toBe(PuzzleType.FINAL);
  });

  it('should have visual data for visual puzzle', () => {
    const visualPuzzle = PUZZLES[1];
    expect(visualPuzzle.visualData).toBeDefined();
    expect(visualPuzzle.visualData?.grid).toHaveLength(3);
  });

  it('should have GAME_DURATION_SECONDS as 900 (15 min)', () => {
    expect(GAME_DURATION_SECONDS).toBe(900);
  });

  it('should have TOTAL_PUZZLES as 4', () => {
    expect(TOTAL_PUZZLES).toBe(4);
  });
});
