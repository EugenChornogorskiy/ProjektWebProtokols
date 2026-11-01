import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function GET(request: Request) { 
  try {
    const token :any = await request.headers.get('Authorization'); 

    const decoded = jwt.verify(token, 'secret123') as any;
    const userId = decoded.userId;
    const rooms = db.prepare(`
      SELECT * FROM rooms
    `).all();
    const users = db.prepare(`
      SELECT * FROM users
    `).all();
    const players = db.prepare(`
      SELECT * FROM game_players
    `).all();
    console.log(rooms);
    console.log(users);
    console.log(players);
    const activeRoom = db.prepare(`
      SELECT r.room_code 
      FROM rooms r
      WHERE r.owner_id = ? 
      AND r.is_active = 1 
      LIMIT 1
    `).get(userId);
    const playerInRoom = db.prepare(`
      SELECT * FROM game
      WHERE player1_id = ? OR player2_id = ?
    `).get(userId,userId);
    if (activeRoom) {
      return NextResponse.json({
        hasActiveRoom: true,
        roomCode: activeRoom.room_code
      });
    }
    else if (playerInRoom){
      const room = db.prepare(`
        SELECT * FROM rooms
        WHERE id = ?
      `).get(playerInRoom.room_id);
      if (room) {
        return NextResponse.json({
          hasActiveRoom: true,
          roomCode: room.room_code
        });
      } 
    }
    else {
      return NextResponse.json({
        hasActiveRoom: false
      });
    }
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
