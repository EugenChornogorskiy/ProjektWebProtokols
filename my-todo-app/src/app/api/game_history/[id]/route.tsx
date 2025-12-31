import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken';  
const srp = require('secure-remote-password/server')
 
export async function DELETE(request: Request,{ params }: any) { 
  try {   
    const { id } = await params;
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
      SELECT * FROM users
      WHERE id = ?
    `).get(userId); 
    if (!existingUser) {
      return NextResponse.json( 
        { error: "User not found" },
        { status: 404 }
      )
    } 
    const game = db.prepare(`
      SELECT * FROM game_history
      WHERE id = ?
    `).get(id); 
    if (!game) {
      return NextResponse.json( 
        { error: "Game history not found" },
        { status: 404 }
      )
    } 
    if ( game.user_id != userId) {
      return NextResponse.json( 
        { error: "Permission denied" },
        { status: 401 }
      )
    }  
    db.prepare(`
      DELETE FROM game_history
      WHERE id = ?
    `).run(id); 
    return NextResponse.json( 
      { sucess:true},
      { status: 200 } 
     )
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}