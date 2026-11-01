import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken'; 
export async function POST(request: Request) { 
  try {
    const { login, password } = await request.json(); 

    const user = db.prepare(`
      SELECT * FROM users 
      WHERE email = ? OR nickname = ?
    `).get(login, login);
    
    if (!user) {
      return NextResponse.json(
        { error: "Incorrect login or password" },
        { status: 401 }
      );
    }  
    if (user.password != password) {
      return NextResponse.json(   
        { error: "Incorrect password" },
        { status: 401 })
    }
    const ses = db.prepare(`
      SELECT * FROM sessions 
      WHERE user_id = ? 
    `).get(user.id );
    if (ses) {
      return NextResponse.json({token:ses.token , user: {id: user.id, nickname: user.nickname, email:user.email, name:user.name,surname:user.surname }})
    }
    const token = jwt.sign(
      { userId: user.id , email: user.email },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );

    const session = db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?,?,?)
    `).run(token, user.id, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); 
    return NextResponse.json({token:session.token , user: {id: user.id,nickname: user.nickname, email:user.email, name:user.name,surname:user.surname }}) 
  }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
