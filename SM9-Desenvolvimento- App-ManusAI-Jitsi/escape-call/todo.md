# EscapeCall — TODO

## Branding & Setup
- [x] Gerar logo do app (ícone EscapeCall)
- [x] Configurar tema escuro (cores cyberpunk/escape room)
- [x] Atualizar app.config.ts com nome e logo

## Domain Models
- [x] Criar tipos: Puzzle, GameState, Player, GameSession
- [x] Criar enums: GameStatus (WAITING, PLAYING, PUZZLE, GAME_OVER, VICTORY)
- [x] Criar constantes dos puzzles (Sala 404)

## Game Engine
- [x] Implementar GameManager (orquestra o jogo)
- [x] Implementar PuzzleEngine (valida respostas, avança puzzles)
- [x] Implementar TimerManager (countdown 15 min via useReducer + setInterval)
- [x] Criar GameContext (estado global com useReducer)

## Telas
- [x] LobbyScreen (entrada com nome + código da sala)
- [x] GameScreen (timer + Jitsi WebView + controles)
- [x] PuzzleModal (overlay de puzzle ativo)
- [x] VictoryScreen (celebração + tempo)
- [x] GameOverScreen (derrota + reinício)

## Puzzles
- [x] Puzzle 1: Código Fragmentado (resposta: 7A3F9K) com pistas
- [x] Puzzle 2: Padrão Visual (resposta: 32) com renderização visual
- [x] Puzzle 3: Áudio (resposta: 19) com reprodução de áudio simulado (Morse visual)
- [x] Puzzle 4: Final (resposta: 7A3F9K3219) com código composto

## Integração Jitsi
- [x] Implementar WebView com Jitsi Meet
- [x] Sala baseada no código de entrada do usuário

## Edge Cases
- [x] Resposta errada (shake + feedback)
- [x] Timeout (GameOverScreen automático)
- [x] Reinício do jogo
- [x] Timer visual < 2 min (vermelho)

## Navegação
- [x] Configurar expo-router sem tab bar (stack navigation)
- [x] Fluxo: Lobby → Game → Victory/GameOver

## Polish
- [x] Haptic feedback em ações importantes
- [x] Animações de transição (shake, fade, spring)
- [x] Ícones e tipografia monospace para timer/códigos
