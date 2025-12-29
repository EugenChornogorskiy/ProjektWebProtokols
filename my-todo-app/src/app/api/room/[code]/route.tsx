import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function PUT(request: Request,{ params }: any) { 
  try {
    const { code } = await params;
    const { token, name } = await request.json();  
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
    const activeRoom = db.prepare(`
      SELECT * FROM rooms
      WHERE room_code = ?
    `).get(code);  
    if (!activeRoom) {
      return NextResponse.json( 
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const user = db.prepare(`
      SELECT * FROM users
      WHERE id = ?
    `).get(userId );
    if (!user) {
      return NextResponse.json( 
        { error: "User not found" },
        { status: 404 }
      );
    }
    if (!name) {
      return NextResponse.json( 
        { error: "Incorrect name" },
        { status: 400 }
      );
    }
    if (activeRoom.owner_id != user.id) {
      return NextResponse.json( 
        { error: "User not a creator" },
        { status: 401 }
      ); 
    } else {
      db.prepare(`
        UPDATE rooms
        SET name = ?
        WHERE room_code = ?
      `).run(name,code);  
      const newRoom = db.prepare(`
        SELECT * FROM rooms 
        WHERE room_code = ?
      `).get(code); 
      return NextResponse.json(newRoom);
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
export async function DELETE(request: Request,{ params }: any) { 
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
        { error: "Room not found" },
        { status: 404 }
      );
    } 
    console.log(activeRoom.owner_id,existingUser.id);
    
    if (activeRoom.owner_id != existingUser.id) {
      return NextResponse.json( 
        { error: "Permission denied" },
        { status: 403 }
      );
    }
    else{
      db.prepare(`
        DELETE FROM rooms 
        WHERE room_code = ?
      `).run( code);  
      return NextResponse.json({
        succes: true
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
    if (activeRoom) {
      return NextResponse.json(activeRoom); 
    }
    else{
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      ) 
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