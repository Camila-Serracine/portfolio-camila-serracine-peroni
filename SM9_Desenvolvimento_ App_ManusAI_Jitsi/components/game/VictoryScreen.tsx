// ============================================================
// EscapeCall — VictoryScreen
// Tela de vitória ao completar todos os puzzles
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
import { GAME_DURATION_SECONDS } from '@/lib/domain/puzzles';

interface Props {
  session: GameSession;
  onRestart: () => void;
  onExit: () => void;
}

export function VictoryScreen({ session, onRestart, onExit }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const elapsed = getElapsedSeconds(session);
  const remaining = session.timeRemainingSeconds;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        {/* Trophy */}
        <Text style={styles.trophy}>🏆</Text>

        {/* Title */}
        <Text style={styles.title}>MISSÃO CONCLUÍDA!</Text>
        <Text style={styles.subtitle}>Sala 404 desbloqueada com sucesso</Text>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
              <Text style={styles.statLabel}>TEMPO USADO</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, styles.statGreen]}>
                {formatTime(remaining)}
              </Text>
              <Text style={styles.statLabel}>TEMPO RESTANTE</Text>
            </View>
          </View>

          <View style={styles.statDividerH} />

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, styles.statPurple]}>
                {session.totalPuzzles}/{session.totalPuzzles}
              </Text>
              <Text style={styles.statLabel}>PUZZLES RESOLVIDOS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{session.player.name}</Text>
              <Text style={styles.statLabel}>JOGADOR</Text>
            </View>
          </View>
        </View>

        {/* Final code display */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>CÓDIGO MESTRE DESBLOQUEADO</Text>
          <Text style={styles.codeValue}>7A3F9K3219</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.8}>
            <Text style={styles.restartBtnText}>↺  JOGAR NOVAMENTE</Text>
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
  trophy: {
    fontSize: 72,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#22C55E',
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
    borderColor: '#22C55E33',
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
  statGreen: { color: '#22C55E' },
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
  codeCard: {
    width: '100%',
    backgroundColor: '#052e16',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22C55E',
    gap: 8,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 2,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#22C55E',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 6,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  restartBtn: {
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
  restartBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0E1A',
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
