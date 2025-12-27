import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function GET(request: Request) { 
  try {
    const token = await request.headers.get('Authorization'); 
    console.log(token);
    if (!token) { 
      return NextResponse.json( 
        { error: "No token" },
        { status: 401 }
      );
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    } catch (jwtError) {
      db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
      return NextResponse.json( 
        { error: "Token expired or invalid" },
        { status: 401 }
      );
    }
    const existingSession = db.prepare(`
      SELECT s.*, u.email, u.nickname
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(token);
    
    if (existingSession) {
      return NextResponse.json("Session exist") 
    } 
    return NextResponse.json( 
      { error: "Session not found" },
      { status: 401 }
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
