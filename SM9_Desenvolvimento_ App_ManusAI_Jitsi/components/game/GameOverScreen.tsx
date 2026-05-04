// ============================================================
// EscapeCall — GameOverScreen
// Tela de derrota: timeout ou desistência
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { GameSession } from '@/lib/domain/types';
import { formatTime, getElapsedSeconds } from '@/lib/game/GameManager';

interface Props {
  session: GameSession;
  onRestart: () => void;
  onExit: () => void;
}

export function GameOverScreen({ session, onRestart, onExit }: Props) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const elapsed = getElapsedSeconds(session);
  const solvedCount = session.solvedPuzzleIds.length;
  const totalPuzzles = session.totalPuzzles;
  const currentPuzzle = session.currentPuzzleIndex + 1;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Icon */}
        <Text style={styles.icon}>💀</Text>

        {/* Title */}
        <Text style={styles.title}>TEMPO ESGOTADO</Text>
        <Text style={styles.subtitle}>
          A Sala 404 permanece bloqueada...
        </Text>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, styles.statRed]}>
                {formatTime(elapsed)}
              </Text>
              <Text style={styles.statLabel}>TEMPO USADO</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, styles.statPurple]}>
                {solvedCount}/{totalPuzzles}
              </Text>
              <Text style={styles.statLabel}>PUZZLES RESOLVIDOS</Text>
            </View>
          </View>

          <View style={styles.statDividerH} />

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>PROGRESSO</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(solvedCount / totalPuzzles) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Parou no Puzzle {currentPuzzle} de {totalPuzzles}
            </Text>
          </View>
        </View>

        {/* Motivational message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            {solvedCount === 0 && '🔒 A sala resistiu desta vez. Tente uma abordagem diferente!'}
            {solvedCount === 1 && '🔓 Você desbloqueou 1 puzzle! Está no caminho certo.'}
            {solvedCount === 2 && '🔓🔓 Metade do caminho! Você quase conseguiu.'}
            {solvedCount === 3 && '🔓🔓🔓 Tão perto! Só faltou o puzzle final.'}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.retryBtn} onPress={onRestart} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>↺  TENTAR NOVAMENTE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exitBtn} onPress={onExit} activeOpacity={0.8}>
            <Text style={styles.exitBtnText}>← Voltar ao Lobby</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF4444',
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF444433',
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00D4FF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statRed: { color: '#FF4444' },
  statPurple: { color: '#9B5DE5' },
  statLabel: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1E293B',
  },
  statDividerH: {
    height: 1,
    backgroundColor: '#1E293B',
  },
  progressSection: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  messageCard: {
    width: '100%',
    backgroundColor: '#1a0000',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  messageText: {
    fontSize: 14,
    color: '#FCA5A5',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  retryBtn: {
    backgroundColor: '#FF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  exitBtn: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  exitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
