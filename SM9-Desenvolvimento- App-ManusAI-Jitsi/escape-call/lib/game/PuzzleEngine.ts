// ============================================================
// EscapeCall — PuzzleEngine
// Responsável por validar respostas e gerenciar puzzles
// ============================================================

import { Puzzle, PuzzleResult } from '../domain/types';
import { PUZZLES } from '../domain/puzzles';

export class PuzzleEngine {
  private puzzles: Puzzle[];

  constructor() {
    this.puzzles = [...PUZZLES];
  }

  getPuzzleByIndex(index: number): Puzzle | null {
    if (index < 0 || index >= this.puzzles.length) return null;
    return this.puzzles[index];
  }

  getPuzzleById(id: string): Puzzle | null {
    return this.puzzles.find((p) => p.id === id) ?? null;
  }

  getTotalPuzzles(): number {
    return this.puzzles.length;
  }

  /**
   * Valida a resposta do jogador para o puzzle atual.
   * Normaliza para uppercase e remove espaços antes de comparar.
   */
  validateAnswer(puzzle: Puzzle, userAnswer: string): PuzzleResult {
    const normalizedUser = userAnswer.trim().toUpperCase().replace(/\s/g, '');
    const normalizedCorrect = puzzle.answer.trim().toUpperCase().replace(/\s/g, '');
    const correct = normalizedUser === normalizedCorrect;
    const isLastPuzzle = puzzle.order === this.puzzles.length;

    if (correct) {
      return {
        correct: true,
        message: isLastPuzzle
          ? '🎉 Código mestre aceito! Saída desbloqueada!'
          : `✅ Correto! Puzzle ${puzzle.order} resolvido!`,
        isLastPuzzle,
      };
    }

    return {
      correct: false,
      message: '❌ Código incorreto. Tente novamente!',
      isLastPuzzle: false,
    };
  }

  /**
   * Retorna a dica para o índice especificado.
   * Retorna null se não houver mais dicas.
   */
  getHint(puzzle: Puzzle, hintIndex: number): string | null {
    if (hintIndex < 0 || hintIndex >= puzzle.hints.length) return null;
    return puzzle.hints[hintIndex];
  }

  getHintCount(puzzle: Puzzle): number {
    return puzzle.hints.length;
  }
}
