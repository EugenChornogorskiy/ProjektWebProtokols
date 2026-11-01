import { NextResponse } from "next/server" 
import { readdirSync } from "fs" 
import db from '@/src/lib/database' 
import path from "path"  
import jwt from 'jsonwebtoken'  
const srp = require('secure-remote-password/server')
export async function POST(request: Request) { 
  try {
    const { login, M } = await request.json(); 
    if (! M || M === "" || M === " "){
      return NextResponse.json(
        { error: "Incorrect login or password" },
        { status: 401 }
      );
    }
    const user = db.prepare(`
      SELECT * FROM users
      WHERE email = ? OR nickname = ?
    `).get(login, login);
    
    if (!user) {
      return NextResponse.json(
        { error: "Incorrect login or password" },
        { status: 404 }
      );
    } 
    const srpSession = db.prepare(`
      SELECT * FROM srp_sessions
      WHERE user_id = ?
    `).get(user.id);
    if (!user) {
      return NextResponse.json(
        { error: "Incorrect login or password" },
        { status: 404 }
      );
    } 
    if (!srpSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    } 
    const serverSession = srp.deriveSession( srpSession.b_number , srpSession.A,  user.salt, user.nickname, user.verifier , M ) 
    db.prepare(`
      DELETE FROM srp_sessions
      WHERE user_id = ?
    `).run(user.id);
    const ses = db.prepare(`
      SELECT * FROM sessions 
      WHERE user_id = ? 
    `).get(user.id );
    console.log(ses)
    if (ses) {
      return NextResponse.json({serverSession: serverSession.proof,token:ses.token , user: {id: user.id, nickname: user.nickname, email:user.email, name:user.name,surname:user.surname }})
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
    console.log(session)
    return NextResponse.json({serverSession: serverSession.proof,token:token , user: {id: user.id,nickname: user.nickname, email:user.email, name:user.name,surname:user.surname }}) 
   }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
