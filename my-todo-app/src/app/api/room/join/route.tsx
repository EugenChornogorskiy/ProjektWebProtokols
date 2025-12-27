import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function GET(request: Request) { 
  try {
    const token :any = await request.headers.get('Authorization'); 
    const room :any = await request.headers.get('Room'); 
    console.log(token);
    
    const decoded = jwt.verify(token, 'secret123') as any;
    const userId = decoded.userId; 
    const existingUser = db.prepare(`
      SELECT * FROM users WHERE id = ? 
    `).get(userId);
    
    if (!existingUser) {
      return NextResponse.json( 
        { error: "user doesnt exist" },
        { status: 401 }  
      ); 
    } 
    const activeRoom = db.prepare(`
      SELECT * FROM rooms WHERE room_code = ? 
    `).get(room);   
    if (!activeRoom) {
      return NextResponse.json( 
        { error: "Incorrect room code" },
        { status: 401 }  
      ); 
    }
    
    const existingPlayer = db.prepare(`
      SELECT * FROM game_players 
      WHERE user_id = ? AND room_id = ?
    `).get(userId, activeRoom.id);

    if (existingPlayer) {
      return NextResponse.json({ 
        joinAllowed: true,
        message: "Player already in room" 
      });
    }
    const players = db.prepare(`
      SELECT * FROM game_players WHERE room_id = ? 
    `).all(activeRoom.id);
    if (!players || players.length >= 2) {
      return NextResponse.json( 
        { error: "Room is full or empty" },
        { status: 401 }  
      ); 
    } 
    else{
      return NextResponse.json( 
        { joinAllowed: true } 
      ); 
    }
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    ) 
  }
} 