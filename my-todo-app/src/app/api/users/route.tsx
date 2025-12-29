import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken';  
export async function POST(request: Request) { 
  try {
    const { email, nickname, salt, verifier, name, surname } = await request.json(); 
    const existingUser = db.prepare(`
      SELECT id FROM users WHERE email = ? OR nickname = ?
    `).get(email, nickname);
    
    if (existingUser) {
      return NextResponse.json(
        { error: "user exists" },
        { status: 400 }
      ) 
    }

    const user = db.prepare(`
      INSERT INTO users (email, nickname, salt, verifier, name, surname)
      VALUES (?,?,?,?,?,?)
    `).run(email, nickname, salt , verifier , name, surname);  

    const token = jwt.sign(
      { userId: user.lastInsertRowid , email: email },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );
    await new Promise(resolve => setTimeout(resolve, 100));
    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?,?,?)
    `).run(token, user.lastInsertRowid, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());  

    return NextResponse.json({
      success: true,
      token: token,
      user: {
        id: user.lastInsertRowid,
        email: email,
        nickname: nickname,
        name: name,
        surname: surname
      }
    })
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
} 
