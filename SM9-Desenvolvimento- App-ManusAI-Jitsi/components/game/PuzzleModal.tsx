// ============================================================
// EscapeCall — PuzzleModal
// Modal de puzzle: desafio, input, feedback, dicas
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/lib/game/GameContext';
import { PuzzleType } from '@/lib/domain/types';
import { VisualPuzzleComponent } from './VisualPuzzleComponent';
import { AudioPuzzleComponent } from './AudioPuzzleComponent';

interface PuzzleModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PuzzleModal({ visible, onClose }: PuzzleModalProps) {
  const { session, engine, submitAnswer, useHint, closePuzzle, currentHint } = useGame();
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; correct: boolean } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const puzzle = engine.getPuzzleByIndex(session.currentPuzzleIndex);

  // Reset ao abrir novo puzzle
  useEffect(() => {
    if (visible) {
      setAnswer('');
      setFeedback(null);
      setShowHint(false);
    }
  }, [visible, session.currentPuzzleIndex]);

  if (!puzzle) return null;

  const handleSubmit = () => {
    if (!answer.trim()) return;

    const result = engine.validateAnswer(puzzle, answer);

    if (result.correct) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setFeedback({ message: result.message, correct: true });

      // Aguarda feedback visual antes de fechar
      setTimeout(() => {
        submitAnswer(answer);
        setAnswer('');
        setFeedback(null);
        onClose();
      }, 1200);
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setFeedback({ message: result.message, correct: false });
      triggerShake();
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleUseHint = () => {
    useHint();
    setShowHint(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleClose = () => {
    closePuzzle();
    onClose();
  };

  const hintCount = engine.getHintCount(puzzle);
  const hasMoreHints = session.currentHintIndex < hintCount - 1;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.puzzleTypeBadge}>
              <Text style={styles.puzzleTypeText}>
                {puzzle.type === PuzzleType.CODE && '💻 CÓDIGO'}
                {puzzle.type === PuzzleType.VISUAL && '👁 VISUAL'}
                {puzzle.type === PuzzleType.AUDIO && '🔊 ÁUDIO'}
                {puzzle.type === PuzzleType.FINAL && '🔑 FINAL'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Título ──────────────────────────────────────── */}
          <Text style={styles.title}>{puzzle.title}</Text>

          {/* ── Descrição ───────────────────────────────────── */}
          <View style={styles.descriptionCard}>
            <Text style={styles.description}>{puzzle.description}</Text>
          </View>

          {/* ── Componente Visual/Áudio ─────────────────────── */}
          {puzzle.type === PuzzleType.VISUAL && puzzle.visualData && (
            <VisualPuzzleComponent data={puzzle.visualData} />
          )}
          {puzzle.type === PuzzleType.AUDIO && (
            <AudioPuzzleComponent puzzleId={puzzle.id} />
          )}

          {/* ── Dica ────────────────────────────────────────── */}
          {showHint && currentHint && (
            <View style={styles.hintCard}>
              <Text style={styles.hintLabel}>💡 DICA {session.currentHintIndex + 1}/{hintCount}</Text>
              <Text style={styles.hintText}>{currentHint}</Text>
            </View>
          )}

          {/* ── Input de Resposta ───────────────────────────── */}
          <Animated.View style={[styles.inputSection, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.inputLabel}>SUA RESPOSTA</Text>
            <TextInput
              style={[
                styles.input,
                feedback?.correct === true && styles.inputCorrect,
                feedback?.correct === false && styles.inputWrong,
              ]}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Digite o código..."
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </Animated.View>

          {/* ── Feedback ────────────────────────────────────── */}
          {feedback && (
            <View style={[styles.feedbackCard, feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={styles.feedbackText}>{feedback.message}</Text>
            </View>
          )}

          {/* ── Tentativas erradas ──────────────────────────── */}
          {session.wrongAttempts > 0 && !feedback?.correct && (
            <Text style={styles.attemptsText}>
              Tentativas erradas: {session.wrongAttempts}/{puzzle.maxAttempts}
            </Text>
          )}

          {/* ── Botões ──────────────────────────────────────── */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.submitBtn, !answer.trim() && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!answer.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>✓  ENVIAR RESPOSTA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hintBtn, !hasMoreHints && !showHint && styles.hintBtnDisabled]}
              onPress={handleUseHint}
              disabled={!hasMoreHints && showHint}
              activeOpacity={0.8}
            >
              <Text style={styles.hintBtnText}>
                {showHint && hasMoreHints ? '💡 Próxima Dica' : '💡 Ver Dica'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  puzzleTypeBadge: {
    backgroundColor: '#1A2235',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  puzzleTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9B5DE5',
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
  // Title
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  // Description
  descriptionCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  description: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 24,
  },
  // Hint
  hintCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7C3AED',
    gap: 8,
  },
  hintLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 2,
  },
  hintText: {
    fontSize: 14,
    color: '#C4B5FD',
    lineHeight: 22,
  },
  // Input
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 2,
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    color: '#00D4FF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 4,
    textAlign: 'center',
  },
  inputCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#052e16',
  },
  inputWrong: {
    borderColor: '#FF4444',
    backgroundColor: '#1a0000',
  },
  // Feedback
  feedbackCard: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  feedbackWrong: {
    backgroundColor: '#1a0000',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  attemptsText: {
    fontSize: 12,
    color: '#FF4444',
    textAlign: 'center',
  },
  // Buttons
  buttons: {
    gap: 10,
    marginTop: 8,
  },
  submitBtn: {
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
  submitBtnDisabled: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  hintBtn: {
    backgroundColor: '#1A2235',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  hintBtnDisabled: {
    borderColor: '#1E293B',
    opacity: 0.5,
  },
  hintBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9B5DE5',
    letterSpacing: 1,
  },
});
