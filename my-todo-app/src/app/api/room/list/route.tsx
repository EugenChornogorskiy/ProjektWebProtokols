import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function GET(request: Request) { 
  try {
    const token :any = await request.headers.get('Authorization');  
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