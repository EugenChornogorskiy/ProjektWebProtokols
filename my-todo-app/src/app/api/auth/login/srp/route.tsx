import { NextResponse } from "next/server" 
import { readdirSync } from "fs" 
import db from '@/src/lib/database' 
import path from "path"  
import jwt from 'jsonwebtoken'  
const srp = require('secure-remote-password/server')
export async function POST(request: Request) { 
  try {
    const { login, A } = await request.json();  
    if (! A || A === "" || A === " "){
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
        { status: 401 }
      );
    } 
    console.log("SRP LOGIN - User data:", {
      id: user.id,
      saltLength: user.salt?.length,
      verifierLength: user.verifier?.length,
      saltFirst20: user.salt?.substring(0, 20),
      verifierFirst20: user.verifier?.substring(0, 20),
      A: A?.substring(0, 20)
    });
    const b = srp.generateEphemeral( user.verifier ) 
    const B = b.public.toString("hex")
    const bSecret = b.secret.toString("hex")
    const exisSession = db.prepare(`
      SELECT * FROM srp_sessions
      WHERE user_id = ?
    `).get(user.id ) 
    if (exisSession) {
      db.prepare(`
        DELETE FROM srp_sessions
        WHERE user_id = ?
      `).run(user.id);
    }
    db.prepare(`
      INSERT INTO srp_sessions (user_id, b_number, B, A)
      VALUES (?, ?, ?, ?)
    `).run(user.id, bSecret , B , A) 
    return NextResponse.json({
      salt: user.salt,
      B: B.toString("hex"),
      login: user.nickname
    }); 
   }
  catch(error){
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
