import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function POST(request: Request) { 
  try {
    const { token, rate, value,image } = await request.json();   
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
      INSERT INTO comments (user_id, rate, value, content )
      VALUES (?,?,?,?)
    `).run(userId,rate,value,image);   
    const comment = db.prepare(`
      SELECT * FROM comments
      WHERE id = ?
    `).get(createdComment.lastInsertRowid);   
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
    const activeComments = db.prepare(`
      SELECT * FROM comments
    `).all( ); 
    const dane = activeComments.map((r:any) => {
      const user  = db.prepare(`
        SELECT * FROM users
        WHERE id = ?
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