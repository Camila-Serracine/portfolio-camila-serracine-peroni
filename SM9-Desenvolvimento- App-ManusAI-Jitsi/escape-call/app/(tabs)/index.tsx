// ============================================================
// EscapeCall — LobbyScreen (Home)
// Tela de entrada: nome do jogador + código da sala
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';

export default function LobbyScreen() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleEnterRoom = () => {
    const trimmedName = playerName.trim();
    const trimmedCode = roomCode.trim().toUpperCase();

    if (!trimmedName) {
      Alert.alert('Campo obrigatório', 'Por favor, insira seu nome de jogador.');
      return;
    }
    if (!trimmedCode) {
      Alert.alert('Campo obrigatório', 'Por favor, insira o código da sala.');
      return;
    }
    if (trimmedCode.length < 3) {
      Alert.alert('Código inválido', 'O código da sala deve ter pelo menos 3 caracteres.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    router.push({
      pathname: '/game',
      params: { playerName: trimmedName, roomCode: trimmedCode },
    });
  };

  return (
    <ScreenContainer containerClassName="bg-background" safeAreaClassName="bg-background">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo & Título ─────────────────────────────── */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: '/manus-storage/icon_7c85f19e.png' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appTitle}>EscapeCall</Text>
            <Text style={styles.appSubtitle}>Escape juntos. Resolvam o impossível.</Text>
          </View>

          {/* ── Info da Missão ─────────────────────────────── */}
          <View style={styles.missionCard}>
            <Text style={styles.missionTitle}>🔐 Sala 404 – Conexão Perdida</Text>
            <View style={styles.missionRow}>
              <View style={styles.missionItem}>
                <Text style={styles.missionValue}>15</Text>
                <Text style={styles.missionLabel}>minutos</Text>
              </View>
              <View style={styles.missionDivider} />
              <View style={styles.missionItem}>
                <Text style={styles.missionValue}>4</Text>
                <Text style={styles.missionLabel}>puzzles</Text>
              </View>
              <View style={styles.missionDivider} />
              <View style={styles.missionItem}>
                <Text style={styles.missionValue}>∞</Text>
                <Text style={styles.missionLabel}>jogadores</Text>
              </View>
            </View>
          </View>

          {/* ── Formulário ─────────────────────────────────── */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOME DO JOGADOR</Text>
              <TextInput
                style={styles.input}
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="Ex: Agente_X"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CÓDIGO DA SALA</Text>
              <TextInput
                style={[styles.input, styles.inputMono]}
                value={roomCode}
                onChangeText={(t) => setRoomCode(t.toUpperCase())}
                placeholder="Ex: SALA404"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                returnKeyType="done"
                onSubmitEditing={handleEnterRoom}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.enterButton,
                (!playerName.trim() || !roomCode.trim()) && styles.enterButtonDisabled,
              ]}
              onPress={handleEnterRoom}
              activeOpacity={0.8}
            >
              <Text style={styles.enterButtonText}>▶  ENTRAR NA SALA</Text>
            </TouchableOpacity>
          </View>

          {/* ── Instruções ─────────────────────────────────── */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Como jogar</Text>
            <Text style={styles.instructionsText}>
              1. Entre na sala com o mesmo código que seus colegas{'\n'}
              2. A chamada de vídeo inicia automaticamente{'\n'}
              3. Resolvam os puzzles juntos antes do tempo acabar{'\n'}
              4. Cada jogador pode ter pistas diferentes!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 8,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#00D4FF',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748B',
    letterSpacing: 1,
    textAlign: 'center',
  },
  // Mission card
  missionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 16,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  missionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  missionItem: {
    alignItems: 'center',
    gap: 2,
  },
  missionValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00D4FF',
  },
  missionLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  missionDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1E293B',
  },
  // Form
  formSection: {
    gap: 16,
  },
  inputGroup: {
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
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#E2E8F0',
  },
  inputMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 3,
    fontSize: 18,
    color: '#00D4FF',
  },
  enterButton: {
    backgroundColor: '#00D4FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  enterButtonDisabled: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    elevation: 0,
  },
  enterButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0E1A',
    letterSpacing: 2,
  },
  // Instructions
  instructionsCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  instructionsText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
});
