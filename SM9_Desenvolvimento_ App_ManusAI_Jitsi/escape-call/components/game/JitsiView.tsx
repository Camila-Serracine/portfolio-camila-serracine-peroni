// ============================================================
// EscapeCall — JitsiView
// Integração com Jitsi Meet via WebView
// ============================================================

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface JitsiViewProps {
  roomCode: string;
  playerName: string;
}

// HTML que embute o Jitsi Meet External API
const buildJitsiHTML = (roomCode: string, playerName: string) => {
  const safeRoom = roomCode.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  const safeName = playerName.replace(/['"<>]/g, '').substring(0, 20);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #0A0E1A; overflow: hidden; }
    #jitsi-container { width: 100%; height: 100%; }
    #loading {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: #0A0E1A; color: #00D4FF;
      font-family: monospace; gap: 16px;
      z-index: 10;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid #1E293B;
      border-top-color: #00D4FF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .room-label { font-size: 12px; color: #64748B; letter-spacing: 2px; }
    .room-code { font-size: 20px; font-weight: bold; color: #7C3AED; letter-spacing: 4px; }
  </style>
</head>
<body>
  <div id="loading">
    <div class="spinner"></div>
    <div class="room-label">CONECTANDO À SALA</div>
    <div class="room-code">${safeRoom}</div>
  </div>
  <div id="jitsi-container"></div>
  <script src="https://meet.jit.si/external_api.js"></script>
  <script>
    const domain = 'meet.jit.si';
    const options = {
      roomName: 'EscapeCall_${safeRoom}',
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: { displayName: '${safeName}' },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        toolbarButtons: ['microphone', 'camera', 'hangup'],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_ALWAYS_VISIBLE: true,
        DEFAULT_BACKGROUND: '#0A0E1A',
        MOBILE_APP_PROMO: false,
      },
    };

    try {
      const api = new JitsiMeetExternalAPI(domain, options);
      api.addEventListener('videoConferenceJoined', () => {
        document.getElementById('loading').style.display = 'none';
      });
    } catch(e) {
      document.getElementById('loading').innerHTML =
        '<div style="color:#FF4444;font-family:monospace;text-align:center;padding:20px">' +
        '⚠ Erro ao conectar ao Jitsi.<br><small style="color:#64748B">Verifique sua conexão.</small></div>';
    }
  </script>
</body>
</html>
  `;
};

export function JitsiView({ roomCode, playerName }: JitsiViewProps) {
  const webViewRef = useRef<WebView>(null);

  // No web, mostrar link direto
  if (Platform.OS === 'web') {
    const safeRoom = roomCode.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
    const jitsiUrl = `https://meet.jit.si/EscapeCall_${safeRoom}`;

    return (
      <View style={styles.webFallback}>
        <Text style={styles.webFallbackIcon}>🎥</Text>
        <Text style={styles.webFallbackTitle}>Chamada de Vídeo</Text>
        <Text style={styles.webFallbackSub}>
          Sala: <Text style={styles.webFallbackRoom}>{safeRoom}</Text>
        </Text>
        <TouchableOpacity
          style={styles.webFallbackBtn}
          onPress={() => Linking.openURL(jitsiUrl)}
        >
          <Text style={styles.webFallbackBtnText}>Abrir Jitsi Meet</Text>
        </TouchableOpacity>
        <Text style={styles.webFallbackNote}>
          Abrirá em nova aba. Volte aqui para os puzzles.
        </Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ html: buildJitsiHTML(roomCode, playerName) }}
      style={styles.webview}
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      mixedContentMode="always"
      onError={(e) => console.warn('JitsiView error:', e.nativeEvent)}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0E1A',
    gap: 12,
    padding: 24,
  },
  webFallbackIcon: {
    fontSize: 48,
  },
  webFallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  webFallbackSub: {
    fontSize: 14,
    color: '#64748B',
  },
  webFallbackRoom: {
    color: '#7C3AED',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    letterSpacing: 3,
  },
  webFallbackBtn: {
    backgroundColor: '#00D4FF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  webFallbackBtnText: {
    color: '#0A0E1A',
    fontWeight: '700',
    fontSize: 15,
  },
  webFallbackNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
