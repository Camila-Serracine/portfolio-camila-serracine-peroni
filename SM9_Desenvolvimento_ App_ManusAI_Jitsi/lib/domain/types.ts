// ============================================================
// EscapeCall — Domain Types
// Clean Architecture: Domain Layer
// ============================================================

// ─── Game Status Enum ────────────────────────────────────────
export enum GameStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  PUZZLE = 'PUZZLE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

// ─── Puzzle Types ─────────────────────────────────────────────
export enum PuzzleType {
  CODE = 'CODE',       // Código fragmentado (texto)
  VISUAL = 'VISUAL',   // Padrão visual (grid/imagem)
  AUDIO = 'AUDIO',     // Puzzle de áudio
  FINAL = 'FINAL',     // Puzzle final composto
}

// ─── Puzzle Model ─────────────────────────────────────────────
export interface Puzzle {
  id: string;
  order: number;
  type: PuzzleType;
  title: string;
  description: string;
  answer: string;               // Resposta correta (case-insensitive)
  hints: string[];              // Pistas disponíveis
  audioFile?: string;           // Para puzzles de áudio
  visualData?: VisualPuzzleData; // Para puzzles visuais
  maxAttempts: number;
}

// ─── Visual Puzzle Data ───────────────────────────────────────
export interface VisualPuzzleData {
  grid: number[][];             // Matriz de valores
  pattern: string;              // Descrição do padrão
  highlightedCells: number[];   // Células destacadas (índices)
}

// ─── Player Model ─────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  roomCode: string;
}

// ─── Game Session ─────────────────────────────────────────────
export interface GameSession {
  player: Player;
  status: GameStatus;
  currentPuzzleIndex: number;
  totalPuzzles: number;
  timeRemainingSeconds: number;
  startedAt: number | null;     // timestamp
  completedAt: number | null;   // timestamp
  solvedPuzzleIds: string[];
  currentHintIndex: number;
  wrongAttempts: number;
}

// ─── Game Action (Reducer) ────────────────────────────────────
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'TICK' }
  | { type: 'OPEN_PUZZLE' }
  | { type: 'CLOSE_PUZZLE' }
  | { type: 'SUBMIT_ANSWER'; payload: { answer: string } }
  | { type: 'NEXT_PUZZLE' }
  | { type: 'USE_HINT' }
  | { type: 'GAME_OVER' }
  | { type: 'VICTORY' }
  | { type: 'RESTART' };

// ─── Puzzle Result ────────────────────────────────────────────
export interface PuzzleResult {
  correct: boolean;
  message: string;
  isLastPuzzle: boolean;
}
