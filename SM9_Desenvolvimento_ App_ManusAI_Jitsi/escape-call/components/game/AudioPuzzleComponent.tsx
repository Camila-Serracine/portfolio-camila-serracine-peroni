// ============================================================
// EscapeCall — AudioPuzzleComponent
// Puzzle 3: Sinal de Rádio — reprodução de áudio simulado
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  puzzleId: string;
}

// Sequência Morse simulada para "19"
// 1 = .---- (ponto, traço, traço, traço, traço)
// 9 = ----. (traço, traço, traço, traço, ponto)
// Total de traços: 4 + 4 = 8... simplificado para fins do jogo
// O puzzle diz: "conte os pulsos longos" = 19 (número direto)
const MORSE_SEQUENCE = [
  { type: 'dot', duration: 200 },
  { type: 'gap', duration: 100 },
  { type: 'dash', duration: 600 },
  { type: 'gap', duration: 100 },
  { type: 'dash', duration: 600 },
  { type: 'gap', duration: 100 },
  { type: 'dash', duration: 600 },
  { type: 'gap', duration: 100 },
  { type: 'dash', duration: 600 },
  { type: 'gap', duration: 600 },  // separador de letra
  { type: 'dash', duration: 600 },
  { type: 'gap', duration: 100 },
  { type: 'dash', duration: 600 },
  { type: 'gap', duration: 100 },
  { type: 'dash', duration: 600 },
  { type: 'gap', duration: 100 },
  { type: 'dash', duration: 600 },
  { type: 'gap', duration: 100 },
  { type: 'dot', duration: 200 },
];

export function AudioPuzzleComponent({ puzzleId }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSignal, setCurrentSignal] = useState<'dot' | 'dash' | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      // Limpar todos os timeouts ao desmontar
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const playMorseSequence = () => {
    if (isPlaying) {
      clearAllTimeouts();
      setIsPlaying(false);
      setCurrentSignal(null);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsPlaying(true);
    setPlayCount((c) => c + 1);

    let delay = 0;
    MORSE_SEQUENCE.forEach((signal) => {
      if (signal.type !== 'gap') {
        const t1 = setTimeout(() => {
          setCurrentSignal(signal.type as 'dot' | 'dash');
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(
              signal.type === 'dash'
                ? Haptics.ImpactFeedbackStyle.Heavy
                : Haptics.ImpactFeedbackStyle.Light
            );
          }
        }, delay);
        timeoutsRef.current.push(t1);

        const t2 = setTimeout(() => {
          setCurrentSignal(null);
        }, delay + signal.duration);
        timeoutsRef.current.push(t2);
      }
      delay += signal.duration;
    });

    const tEnd = setTimeout(() => {
      setIsPlaying(false);
      setCurrentSignal(null);
    }, delay + 200);
    timeoutsRef.current.push(tEnd);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SINAL INTERCEPTADO</Text>

      {/* Visualizador de sinal */}
      <View style={styles.signalDisplay}>
        <View style={[
          styles.signalIndicator,
          currentSignal === 'dot' && styles.signalDot,
          currentSignal === 'dash' && styles.signalDash,
          !currentSignal && isPlaying && styles.signalIdle,
        ]}>
          <Text style={styles.signalText}>
            {currentSignal === 'dot' && '•'}
            {currentSignal === 'dash' && '—'}
            {!currentSignal && isPlaying && '~'}
            {!currentSignal && !isPlaying && '○'}
          </Text>
        </View>

        {/* Morse visual bars */}
        <View style={styles.morseVisual}>
          {MORSE_SEQUENCE.filter((s) => s.type !== 'gap').map((s, i) => (
            <View
              key={i}
              style={[
                styles.morseBar,
                s.type === 'dash' ? styles.morseDash : styles.morseDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Botão de reprodução */}
      <TouchableOpacity
        style={[styles.playBtn, isPlaying && styles.playBtnActive]}
        onPress={playMorseSequence}
        activeOpacity={0.8}
      >
        <Text style={styles.playBtnText}>
          {isPlaying ? '⏹  PARAR SINAL' : '▶  REPRODUZIR SINAL'}
        </Text>
      </TouchableOpacity>

      {playCount > 0 && (
        <Text style={styles.playCountText}>
          Reproduzido {playCount}x — Você pode repetir quantas vezes quiser
        </Text>
      )}

      {/* Instrução */}
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>📻 Como decodificar:</Text>
        <Text style={styles.instructionText}>
          Ouça o sinal e observe os pulsos.{'\n'}
          Pulso curto (•) = ponto{'\n'}
          Pulso longo (—) = traço{'\n'}
          Identifique o número oculto na sequência.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 2,
    textAlign: 'center',
  },
  signalDisplay: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  signalIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  signalDot: {
    backgroundColor: '#00D4FF22',
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  signalDash: {
    backgroundColor: '#FF444422',
    borderColor: '#FF4444',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  signalIdle: {
    borderColor: '#64748B',
  },
  signalText: {
    fontSize: 36,
    color: '#E2E8F0',
    fontWeight: '900',
  },
  morseVisual: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  morseBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  morseDot: {
    width: 8,
  },
  morseDash: {
    width: 24,
  },
  playBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  playBtnActive: {
    backgroundColor: '#0A1929',
    borderColor: '#FF4444',
  },
  playBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00D4FF',
    letterSpacing: 1,
  },
  playCountText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  instructionCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  instructionText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 22,
  },
});
