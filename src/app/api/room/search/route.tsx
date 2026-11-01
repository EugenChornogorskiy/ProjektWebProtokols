import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function GET(request: Request) { 
  try { 
    const token :any = await request.headers.get('Authorization');   
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';  
    let decoded: any;
    try {
      decoded = jwt.verify( token, 'secret123'); 
    } catch (err) {  
      return NextResponse.json( 
        { error: "Invalid Token" },
        { status: 401 }
      );
    } 
    const userId = decoded.userId; 
    const existingUser = db.prepare(`
      SELECT * FROM users WHERE id = ? 
    `).get(userId);
    
    if (!existingUser) {
      return NextResponse.json( 
        { error: "user not found" },
        { status: 404 }  
      ); 
    } 
    const activeRooms = db.prepare(`
      SELECT * FROM rooms
      WHERE name LIKE ?
    `).all(`%${name}%`); 
    const dane = activeRooms.map((r:any) => {
      const players = db.prepare(`
        SELECT * FROM game_players
        WHERE room_id = ?
      `).all(r.id);
      const parsedPlayers = players.map(p => {
        const player = db.prepare(`
          SELECT * FROM users
          WHERE id = ?
        `).get(p.user_id);
        return player
      })
      return {room: r, players: parsedPlayers}
    })
    return NextResponse.json(dane);   
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    ) 
  }
} 