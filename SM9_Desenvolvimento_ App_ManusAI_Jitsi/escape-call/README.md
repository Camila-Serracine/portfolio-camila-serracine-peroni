# EscapeCall

> **Escape Game Digital multiplayer baseado em videoconferência com Jitsi Meet**

---

## Descrição

EscapeCall é um aplicativo de Escape Room Digital onde grupos de jogadores se reúnem em uma chamada de vídeo (via Jitsi Meet) e resolvem puzzles colaborativos contra o relógio. O jogo apresenta a missão **"Sala 404 – Conexão Perdida"**, com 4 puzzles sequenciais e um timer de 15 minutos.

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- pnpm 9+
- Expo Go (iOS/Android) ou emulador

### Instalação

```bash
# Clonar e instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Escanear QR code com Expo Go para testar no dispositivo
pnpm qr
```

### Testes

```bash
pnpm test
```

Todos os 32 testes unitários devem passar, cobrindo:
- PuzzleEngine (validação de respostas, dicas)
- GameManager/Reducer (estados, transições, timer)
- Integridade dos dados dos puzzles

---

## Fluxo Principal

```
Lobby (nome + código da sala)
    ↓
GameScreen
  ├── Jitsi Meet (chamada de vídeo embutida)
  ├── Timer regressivo (15:00)
  └── Botão "INICIAR JOGO"
        ↓
  Puzzle 1: Código Fragmentado (7A3F9K)
        ↓
  Puzzle 2: Padrão Visual (32)
        ↓
  Puzzle 3: Sinal de Rádio/Áudio (19)
        ↓
  Puzzle 4: Código Mestre Final (7A3F9K3219)
        ↓
  VictoryScreen ✅  ou  GameOverScreen ❌ (timeout)
```

---

## Arquitetura

O projeto segue **Clean Architecture** adaptada ao stack React Native/Expo:

```
lib/
  domain/          ← Entidades e regras de negócio
    types.ts       ← Tipos: Puzzle, GameSession, GameStatus, GameAction
    puzzles.ts     ← Definição dos 4 puzzles da Sala 404
  game/            ← Lógica do jogo (Game Engine)
    PuzzleEngine.ts  ← Validação de respostas, dicas
    GameManager.ts   ← Reducer puro (gameReducer) + helpers
    GameContext.tsx  ← Provider React + hooks (useGame)
  _core/           ← Infraestrutura (tema, runtime)

app/
  (tabs)/
    index.tsx      ← LobbyScreen (entrada)
  game/
    index.tsx      ← GameScreen (jogo principal)

components/
  game/
    JitsiView.tsx           ← WebView com Jitsi Meet
    PuzzleModal.tsx         ← Modal de puzzle (input + feedback)
    VisualPuzzleComponent   ← Grade visual (Puzzle 2)
    AudioPuzzleComponent    ← Sinal Morse (Puzzle 3)
    VictoryScreen.tsx       ← Tela de vitória
    GameOverScreen.tsx      ← Tela de derrota

tests/
  game.test.ts     ← 32 testes unitários
```

### Padrão MVVM

| Camada | Responsabilidade |
|--------|-----------------|
| **Model** | `lib/domain/types.ts`, `lib/domain/puzzles.ts` |
| **ViewModel** | `lib/game/GameContext.tsx` (useReducer + actions) |
| **View** | `app/`, `components/game/` |

### Gerenciamento de Estado

```
GameStatus:
  WAITING → PLAYING → PUZZLE → PLAYING → ... → VICTORY
                                              ↘ GAME_OVER (timeout)
```

O estado é gerenciado por `useReducer` com o `gameReducer` puro (sem side effects).
O timer é implementado via `setInterval` no `GameContext`, cancelado automaticamente ao sair dos estados ativos.

---

## Puzzles — Sala 404

| # | Tipo | Resposta | Descrição |
|---|------|----------|-----------|
| 1 | Código Fragmentado | `7A3F9K` | Cada jogador recebe uma parte do código |
| 2 | Padrão Visual | `32` | Grade 3×3 com sequência de potências de 2 |
| 3 | Sinal de Rádio | `19` | Sequência Morse animada visualmente |
| 4 | Código Mestre | `7A3F9K3219` | Combinação de todos os códigos anteriores |

---

## Integração Jitsi Meet

A chamada de vídeo é implementada via `WebView` com a **Jitsi Meet External API**:

- Sala criada automaticamente com base no código inserido pelo jogador
- Nome do jogador passado como `displayName`
- Interface simplificada (apenas microfone, câmera e desligar)
- Fallback para web: link direto para `meet.jit.si`

---

## Edge Cases Implementados

- **Resposta errada:** animação de shake + feedback visual vermelho + contador de tentativas
- **Timeout:** transição automática para `GameOverScreen` quando timer chega a 0
- **Timer crítico:** timer pisca em vermelho quando restam menos de 2 minutos
- **Reinício:** botão "Jogar Novamente" reseta estado completo via `RESTART` action
- **Saída:** confirmação antes de sair do jogo ativo
- **Tela ativa:** `useKeepAwake` impede que a tela apague durante o jogo
- **Validação de entrada:** nome e código obrigatórios no Lobby

---

## Dependências Principais

| Pacote | Uso |
|--------|-----|
| `expo-router` | Navegação (Stack) |
| `react-native-webview` | Jitsi Meet embutido |
| `expo-haptics` | Feedback tátil |
| `expo-keep-awake` | Tela ativa durante o jogo |
| `expo-audio` | Suporte a áudio (puzzle 3) |
| `nativewind` | Estilização com Tailwind CSS |
| `vitest` | Testes unitários |
