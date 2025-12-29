import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function POST(request: Request) { 
  try {
    const { token, rate, value } = await request.json();   
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
    const createdComment = db.prepare(`
      INSERT INTO comments (user_id, rate, value )
      VALUES (?,?,?)
    `).run(userId,rate,value);   
    const comment = db.prepare(`
      SELECT * FROM comments
      WHERE id = ?
    `).run(createdComment.lastInsertRowid);   
    if (comment) {
      return NextResponse.json(comment);
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
    const activeComments = db.prepare(`
      SELECT * FROM comments
    `).all( ); 
    const dane = activeComments.map((r:any) => {
      const user  = db.prepare(`
        SELECT * FROM users
        WHERE room_id = ?
      `).get(r.user_id); 
      return {comment: r, creator: user }
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