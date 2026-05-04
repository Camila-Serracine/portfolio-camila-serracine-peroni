// ============================================================
// EscapeCall — GameScreen
// Tela principal do jogo: Timer + Jitsi + Controles
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { GameProvider, useGame } from '@/lib/game/GameContext';
import { useGameScreen } from '@/hooks/use-game-screen';
import { GameStatus } from '@/lib/domain/types';
import { formatTime } from '@/lib/game/GameManager';
import { PuzzleModal } from '@/components/game/PuzzleModal';
import { JitsiView } from '@/components/game/JitsiView';
import { VictoryScreen } from '@/components/game/VictoryScreen';
import { GameOverScreen } from '@/components/game/GameOverScreen';

// ─── Inner component (needs GameContext) ──────────────────────
function GameContent() {
  const router = useRouter();
  const { session, startGame, openPuzzle, restart, isTimerCritical } = useGame();
  useGameScreen(); // Mantém tela ativa durante o jogo
  const [showPuzzle, setShowPuzzle] = useState(false);

  const currentPuzzleNumber = session.currentPuzzleIndex + 1;
  const isPlaying =
    session.status === GameStatus.PLAYING ||
    session.status === GameStatus.PUZZLE;

  const handleOpenPuzzle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    openPuzzle();
    setShowPuzzle(true);
  };

  const handleClosePuzzle = () => {
    setShowPuzzle(false);
  };

  const handleRestart = () => {
    restart();
  };

  const handleExit = () => {
    Alert.alert(
      'Sair do jogo',
      'Tem certeza? O progresso será perdido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  // ── Victory ───────────────────────────────────────────────
  if (session.status === GameStatus.VICTORY) {
    return <VictoryScreen session={session} onRestart={handleRestart} onExit={() => router.back()} />;
  }

  // ── Game Over ─────────────────────────────────────────────
  if (session.status === GameStatus.GAME_OVER) {
    return <GameOverScreen session={session} onRestart={handleRestart} onExit={() => router.back()} />;
  }

  return (
    <ScreenContainer containerClassName="bg-background" safeAreaClassName="bg-background" edges={['top', 'left', 'right']}>
      {/* ── Header: Timer + Status ─────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
          <Text style={styles.exitBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, isTimerCritical && styles.timerCritical]}>
            {formatTime(session.timeRemainingSeconds)}
          </Text>
          {isTimerCritical && (
            <Text style={styles.timerWarning}>⚠ TEMPO CRÍTICO</Text>
          )}
        </View>

        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {session.solvedPuzzleIds.length}/{session.totalPuzzles}
          </Text>
          <Text style={styles.progressLabel}>puzzles</Text>
        </View>
      </View>

      {/* ── Status Bar ────────────────────────────────────── */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, isPlaying ? styles.statusDotActive : styles.statusDotWaiting]} />
        <Text style={styles.statusText}>
          {session.status === GameStatus.WAITING && 'Aguardando início...'}
          {session.status === GameStatus.PLAYING && `Puzzle ${currentPuzzleNumber} disponível`}
          {session.status === GameStatus.PUZZLE && `Resolvendo Puzzle ${currentPuzzleNumber}...`}
        </Text>
      </View>

      {/* ── Jitsi Video Call ──────────────────────────────── */}
      <View style={styles.jitsiContainer}>
        <JitsiView roomCode={session.player.roomCode} playerName={session.player.name} />
      </View>

      {/* ── Bottom Controls ───────────────────────────────── */}
      <View style={styles.bottomControls}>
        {session.status === GameStatus.WAITING ? (
          <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>▶  INICIAR JOGO</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.puzzleButton, !isPlaying && styles.puzzleButtonDisabled]}
            onPress={handleOpenPuzzle}
            disabled={!isPlaying}
            activeOpacity={0.8}
          >
            <Text style={styles.puzzleButtonText}>
              🧩  PUZZLE {currentPuzzleNumber} — RESOLVER
            </Text>
          </TouchableOpacity>
        )}

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {Array.from({ length: session.totalPuzzles }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < session.solvedPuzzleIds.length && styles.dotSolved,
                i === session.currentPuzzleIndex && isPlaying && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* ── Puzzle Modal ──────────────────────────────────── */}
      <PuzzleModal
        visible={showPuzzle}
        onClose={handleClosePuzzle}
      />
    </ScreenContainer>
  );
}

// ─── Outer component: provides GameContext ────────────────────
export default function GameScreen() {
  const params = useLocalSearchParams<{ playerName: string; roomCode: string }>();
  const router = useRouter();

  const playerName = params.playerName ?? 'Jogador';
  const roomCode = params.roomCode ?? 'SALA404';

  const player = {
    id: `player-${Date.now()}`,
    name: playerName,
    roomCode,
  };

  return (
    <GameProvider player={player}>
      <GameContent />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  exitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBtnText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
  timerContainer: {
    alignItems: 'center',
    gap: 2,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00D4FF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 4,
  },
  timerCritical: {
    color: '#FF4444',
  },
  timerWarning: {
    fontSize: 10,
    color: '#FF4444',
    fontWeight: '700',
    letterSpacing: 1,
  },
  progressBadge: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 0,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7C3AED',
  },
  progressLabel: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Status bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0A0E1A',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotWaiting: { backgroundColor: '#64748B' },
  statusDotActive: { backgroundColor: '#22C55E' },
  statusText: {
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  // Jitsi
  jitsiContainer: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  // Bottom controls
  bottomControls: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 12,
  },
  startButton: {
    backgroundColor: '#22C55E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0E1A',
    letterSpacing: 2,
  },
  puzzleButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  puzzleButtonDisabled: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    elevation: 0,
  },
  puzzleButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dotSolved: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  dotActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#9B5DE5',
  },
});
