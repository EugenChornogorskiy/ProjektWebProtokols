import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database.db'); 
const db = new Database(dbPath); 
db.exec('PRAGMA foreign_keys = ON');
export function initDatabase() { 
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      nickname TEXT UNIQUE NOT NULL,
      salt TEXT NOT NULL,
      verifier TEXT NOT NULL,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `); 
  db.exec(`
    CREATE TABLE IF NOT EXISTS srp_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      b_number TEXT NOT NULL,
      B TEXT NOT NULL,
      A TEXT NOT NULL, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `); 
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `); 
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner_id INTEGER NOT NULL,
      game_state TEXT,
      room_code TEXT UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id)
    )
  `); 
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
      UNIQUE(user_id, room_id)
    )
  `); 
  db.exec(`
    CREATE TABLE IF NOT EXISTS game (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER NOT NULL,  
      player1_info TEXT,
      player2_info TEXT,
      game_board TEXT,
      game_status TEXT,
      player_turn INTEGER NOT NULL,
      FOREIGN KEY (player1_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (player2_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
      UNIQUE(player1_id, player2_id, room_id)
    )
  `); 
  db.exec(`
    CREATE TABLE IF NOT EXISTS trade_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      recepient_id INTEGER NOT NULL,  
      business_sell TEXT,
      business_buy TEXT,
      price_give TEXT,
      price_get TEXT,
      FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (recepient_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
    )
  `); 
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      rate INTEGER NOT NULL,
      value TEXT NOT NULL, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `); 
}
initDatabase()
export default db;