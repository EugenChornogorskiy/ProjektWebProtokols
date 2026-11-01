# Monopoly Online: a multiplayer game built on web protocols(demo)

A two-player, Monopoly-style board game that runs in the browser. The game is the demo; the real goal of the project is to combine several web protocols in one working application and to see what each of them is best at.

## Protocols used

| Protocol | Where it is used |
|----------|------------------|
| **HTTPS / TLS** | The Next.js server and the Socket.IO server both run over HTTPS with a certificate |
| **REST (HTTP)** | Next.js route handlers: users, rooms, game data, comments, game history |
| **SRP** (Secure Remote Password) | Login without sending the password over the network |
| **JWT** | Session tokens, checked by the REST API and when a WebSocket connects |
| **WebSocket (Socket.IO)** | Real-time game: joining rooms, dice, buying, trades, chat |
| **MQTT** | Game events are published to a broker; spectators subscribe to watch live, and an observer writes the events to a log file |

## Features

- Registration and login with SRP, session handling with JWT
- Rooms with a join code, a searchable room list and a two-player limit
- 10×10 board with 36 playable cells along the edge: 27 businesses in 9 groups, plus random-event cells
- Dice rolls, buying businesses, rent paid to the owner, income when passing Start and a bonus for owning a whole group
- Random events: taxes, fines, lottery wins and more
- Trade offers between players (businesses and money) that the other player can accept or decline
- In-game chat
- **Spectator mode** that follows a live game through MQTT
- Game state saved in the database, so a player can reconnect and continue
- Game history and user profile editing
- Reviews with star ratings

## Architecture

```
 Browser (React / Next.js)
    │  HTTPS  (REST + SRP + JWT)         ┌───────────────────────┐
    ├───────────────────────────────────▶│ Next.js server :3000  │──┐
    │                                    └───────────────────────┘  │
    │  WSS  (Socket.IO, JWT in handshake) ┌──────────────────────┐  ├──▶ SQLite
    ├───────────────────────────────────▶│ Socket.IO server :3001│──┘
    │                                    └──────────┬───────────┘
    │  MQTT over WebSocket (spectator)              │ publish game/<room>/events
    └──────────────────────────────▶ MQTT broker ◀──┘
                                           ▲
                                           └── observer ──▶ game.log
```

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Express · Socket.IO · MQTT.js · `secure-remote-password` · `jsonwebtoken` · better-sqlite3 · Formik + Yup

## Project structure

```
.
├── server.js                    # HTTPS server that runs Next.js
├── src/
│   ├── app/
│   │   ├── api/                 # REST endpoints (auth, users, room, game, comment, game_history)
│   │   ├── auth/[type]/         # login and registration pages
│   │   ├── game/                # game page
│   │   └── edit/[id]/           # profile editing
│   ├── components/              # game UI, trade, reviews, toasts
│   ├── contexts/                # login context
│   ├── lib/
│   │   ├── database.js          # SQLite schema (created on first start)
│   │   ├── socket-server.js     # game logic and real-time events
│   │   ├── mqtt.js              # event publisher
│   │   └── mqtt-observer.js     # event logger
│   └── utils/validation.js
└── package.json
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Generate a self-signed certificate

Both servers read `kluczBez.key` and `certyfikat.crt` from the project root.

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout kluczBez.key -out certyfikat.crt \
  -days 365 -subj "/CN=localhost"
```

### 3. Start everything

```bash
npm run dev
```

This runs three processes in parallel:

- the web app on <https://localhost:3000>
- the Socket.IO game server on <https://localhost:3001>
- the MQTT observer, which appends game events to `game.log`

The SQLite database (`database.db`) is created automatically on first start.

> Because the certificate is self-signed, open <https://localhost:3001> once in the browser and accept the warning. Otherwise the WebSocket connection will be blocked.

### 4. Play

1. Register two accounts (for example in two different browsers).
2. Create a room with one account and join it with the code from the other.
3. The game starts when the second player joins. Roll the dice on your turn.
4. Open a third session and use spectator mode to follow the game live.

## Author

Yewhenii Chornohorskyi, Applied Computer Science, University of Gdańsk.