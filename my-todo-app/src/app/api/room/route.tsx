import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function POST(request: Request) { 
  try {
    const { token } = await request.json();   
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
    const code = generateUniqueRoomCode(db)
    const activeRoom = db.prepare(`
      INSERT INTO rooms (name, owner_id, game_state, room_code )
      VALUES (?,?,?,? )
    `).run("monopoly", userId, "initialization", code );  
    db.prepare(`
      INSERT INTO game_players (user_id, room_id)
      VALUES (?, ?)
    `).run(userId, activeRoom.lastInsertRowid);
    if (activeRoom) {
      return NextResponse.json({
        hasActiveRoom: true,
        roomCode: code
      });
    } else {
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
    ) 
  }
}
function generateUniqueRoomCode(db:any) {
  let code 
  let isUnique = false 
  let attempts = 0 
  
  while (!isUnique && attempts < 10) {
    code = generateRoomCode() 
    
    const existing = db.prepare(`
      SELECT id FROM rooms WHERE room_code = ?
    `).get(code) 
    
    if (!existing) {
      isUnique = true 
    }
    attempts++ 
  }
  
  if (!isUnique) {
    throw new Error('Could not generate unique room code') 
  }
  
  return code 
}
function generateRoomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ' 
  const numbers = '23456789' 
  let code = '' 
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length)) 
  }
  for (let i = 0; i < 2; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length)) 
  }
  
  return code 
} 
export async function GET(request: Request) { 
  try {
    const token :any = await request.headers.get('Authorization');   
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
    `).all( );   
    return NextResponse.json(activeRooms);   
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    ) 
  }
} 