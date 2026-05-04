# EscapeCall — Design Document

## Brand Identity

- **Nome:** EscapeCall
- **Tagline:** "Escape juntos. Resolvam o impossível."
- **Paleta de cores:**
  - Background: `#0A0E1A` (azul-escuro profundo, estilo "sala escura")
  - Surface: `#111827` (cinza-escuro)
  - Primary: `#00D4FF` (ciano elétrico — tecnologia, urgência)
  - Secondary: `#7C3AED` (roxo — mistério)
  - Accent: `#FF4444` (vermelho — perigo, timer)
  - Success: `#22C55E`
  - Warning: `#F59E0B`
  - Text: `#E2E8F0`
  - Muted: `#64748B`

---

## Screen List

1. **LobbyScreen** — Tela inicial de entrada na sala
2. **GameScreen** — Tela principal do jogo (timer + Jitsi + puzzles)
3. **PuzzleModal** — Overlay de puzzle atual (texto, input, feedback)
4. **VictoryScreen** — Tela de vitória ao completar todos os puzzles
5. **GameOverScreen** — Tela de derrota (timeout ou desistência)

---

## Primary Content & Functionality

### LobbyScreen
- Logo do app centralizado
- Campo de texto: "Nome do jogador"
- Campo de texto: "Código da sala"
- Botão primário: "Entrar na Sala"
- Subtítulo com regras rápidas (15 min, 4 puzzles)

### GameScreen
- **Header:** Timer regressivo (MM:SS) em destaque vermelho quando < 2 min
- **Seção Jitsi:** WebView embutida com a chamada de vídeo Jitsi Meet
- **Footer:** Botão "Ver Puzzle Atual" + indicador de progresso (puzzle X/4)
- Badge de status: AGUARDANDO / JOGANDO / VITÓRIA / DERROTA

### PuzzleModal (Bottom Sheet / Modal)
- Título do puzzle (ex: "Puzzle 1: Código Fragmentado")
- Descrição do desafio
- Componente visual específico por tipo (texto, grid, áudio)
- Campo de input para resposta
- Botão "Enviar Resposta"
- Feedback visual: correto (verde) / errado (vermelho + shake)
- Dica disponível (botão secundário)

### VictoryScreen
- Animação de celebração
- Tempo total gasto
- Botão "Jogar Novamente"

### GameOverScreen
- Mensagem de derrota
- Puzzle em que parou
- Botão "Tentar Novamente"

---

## Key User Flows

### Fluxo Principal
1. Usuário abre o app → LobbyScreen
2. Digita nome e código da sala → toca "Entrar na Sala"
3. GameScreen abre → Jitsi inicia automaticamente
4. Timer começa (15:00)
5. Puzzle 1 aparece → usuário resolve → avança
6. Puzzles 2, 3 aparecem em sequência
7. Puzzle 4 (Final) com código composto
8. Vitória → VictoryScreen
9. (Alternativo) Timer expira → GameOverScreen

### Fluxo de Erro
- Resposta errada → shake animation + mensagem "Tente novamente"
- Timer < 2 min → timer pisca em vermelho + haptic
- Timer expira → GameOverScreen automático

---

## Layout Principles

- **Orientação:** Portrait (9:16)
- **Tema:** Escuro por padrão (estilo "sala de fuga digital")
- **Tipografia:** Monospace para códigos e timer (sensação de terminal)
- **Animações:** Sutis (fade, slide), nada exagerado
- **Acessibilidade:** Contraste alto, fontes legíveis, botões grandes (min 48px)
