// ============================================================
// EscapeCall — Puzzle Definitions
// "Sala 404 – Conexão Perdida"
// ============================================================

import { Puzzle, PuzzleType } from './types';

export const GAME_DURATION_SECONDS = 15 * 60; // 15 minutos
export const GAME_NAME = 'Sala 404 – Conexão Perdida';

export const PUZZLES: Puzzle[] = [
  // ─── Puzzle 1: Código Fragmentado ───────────────────────────
  {
    id: 'puzzle-1-code',
    order: 1,
    type: PuzzleType.CODE,
    title: 'Puzzle 1: Código Fragmentado',
    description:
      'O sistema detectou um fragmento de código corrompido. ' +
      'Cada jogador recebeu uma parte diferente. ' +
      'Combinem as pistas para reconstruir o código de acesso completo.',
    answer: '7A3F9K',
    hints: [
      'Jogador 1 vê: "7A" — começa com sete e a letra A',
      'Jogador 2 vê: "3F" — três seguido da letra F',
      'Jogador 3 vê: "9K" — termina com nove e a letra K',
      'Código completo: combine as três partes em ordem',
    ],
    maxAttempts: 5,
  },

  // ─── Puzzle 2: Padrão Visual ─────────────────────────────────
  {
    id: 'puzzle-2-visual',
    order: 2,
    type: PuzzleType.VISUAL,
    title: 'Puzzle 2: Padrão Visual',
    description:
      'Uma grade de números aparece na tela. ' +
      'Identifique o padrão oculto e calcule o valor que completa a sequência.',
    answer: '32',
    hints: [
      'Observe a diagonal principal da grade',
      'Os números seguem uma progressão: 2, 4, 8, 16...',
      'A sequência é uma potência de 2. Qual vem depois de 16?',
      'Resposta: 2^5 = 32',
    ],
    visualData: {
      grid: [
        [2,  4,  8],
        [4,  8,  16],
        [8,  16, 0],   // 0 = célula a ser descoberta
      ],
      pattern: 'Potências de 2 — cada célula é o dobro da anterior',
      highlightedCells: [8], // índice da célula [2][2]
    },
    maxAttempts: 5,
  },

  // ─── Puzzle 3: Áudio ─────────────────────────────────────────
  {
    id: 'puzzle-3-audio',
    order: 3,
    type: PuzzleType.AUDIO,
    title: 'Puzzle 3: Sinal de Rádio',
    description:
      'Um sinal de rádio criptografado foi interceptado. ' +
      'Ouça com atenção — a mensagem contém um número em código Morse. ' +
      'Quantos pulsos longos você conta?',
    answer: '19',
    hints: [
      'O código Morse usa pontos (.) e traços (—)',
      'Conte apenas os traços (pulsos longos)',
      'A sequência é: 1 traço, 9 traços = "19"',
      'Resposta: 19',
    ],
    audioFile: 'morse_19',
    maxAttempts: 5,
  },

  // ─── Puzzle 4: Final ─────────────────────────────────────────
  {
    id: 'puzzle-4-final',
    order: 4,
    type: PuzzleType.FINAL,
    title: 'Puzzle Final: Código Mestre',
    description:
      'Você chegou ao terminal principal! ' +
      'Para desbloquear a saída, insira o código mestre formado por TODOS os códigos anteriores, ' +
      'na ordem em que foram descobertos: Código + Padrão + Áudio.',
    answer: '7A3F9K3219',
    hints: [
      'Combine os três códigos anteriores em sequência',
      'Puzzle 1: 7A3F9K',
      'Puzzle 2: 32',
      'Puzzle 3: 19',
      'Código mestre: 7A3F9K3219',
    ],
    maxAttempts: 3,
  },
];

export const TOTAL_PUZZLES = PUZZLES.length;
