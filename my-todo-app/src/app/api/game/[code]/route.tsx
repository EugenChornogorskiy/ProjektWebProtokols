import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken';  
export async function GET(request: Request,{ params }: any) { 
  try { 
    const { code } = await params;
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
    const activeRoom = db.prepare(`
      SELECT * FROM rooms
      WHERE room_code = ?
    `).get(code);   
    if (!activeRoom) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      ) 
    }
    const activeGame = db.prepare(`
      SELECT * FROM game
      WHERE room_id = ?
    `).get(activeRoom.id); 
    const players = [JSON.parse(activeGame.player1_info), JSON.parse(activeGame.player2_info)]
    return NextResponse.json({board : activeGame.game_board,players:players})
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    ) 
  }
} 