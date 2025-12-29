import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken';    
export async function PUT(request: Request,{ params }: any) { 
  try {   
    const { id } = await params; 
    const { token,rate,value } = await request.json();
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
    const existingComment = db.prepare(`
      SELECT * FROM comments
      WHERE id = ?
    `).get(Number(id));
    if (!existingComment) {
      return NextResponse.json( 
        { error: "Comment not found" },
        { status: 404 }
      )
    } 
    if ( existingComment.user_id != userId) {
      return NextResponse.json( 
        { error: "Permision denied" },
        { status: 403 }
      )
    } 

    if (value) {
      db.prepare(`
        UPDATE comments
        SET value = ?
        WHERE id = ?
      `).run(value,id);
    } 
    if (rate) {
      db.prepare(`
        UPDATE comments
        SET rate = ?
        WHERE id = ?
      `).run(rate,id);
    }  
    const updatedComment = db.prepare(`
      SELECT * FROM comments
      WHERE id = ?
    `).get(id);
    return NextResponse.json(  updatedComment )
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
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
        { error: "Incorrect id" },
        { status: 404 }
      )
    }
    const existingComment = db.prepare(`
      SELECT * FROM comments
      WHERE id = ?
    `).get(Number(id));
    if (!existingComment) {
      return NextResponse.json( 
        { error: "Comment not found" },
        { status: 404 }
      )
    } 
    if ( existingComment.user_id != userId) {
      return NextResponse.json( 
        { error: "Permision denied" },
        { status: 403 }
      )
    } 
    db.prepare(`
      DELETE FROM comments
      WHERE id = ?
    `).run(id);
    return NextResponse.json( 
      { message: "Comment deleted" },
      { status: 200 } )
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}