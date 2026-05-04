// ============================================================
// EscapeCall — useGameScreen
// Hook utilitário para telas de jogo
// ============================================================

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

/**
 * Hook para telas de jogo:
 * - Mantém a tela ativa (sem sleep) durante o jogo
 */
export function useGameScreen() {
  // Mantém a tela ativa durante o jogo
  useKeepAwake();
}
