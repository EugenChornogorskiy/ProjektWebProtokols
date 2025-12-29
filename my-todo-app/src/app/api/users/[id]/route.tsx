import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken';  
const srp = require('secure-remote-password/server')
export async function GET(request: Request,{ params }: any) { 
  try {    
    const { id } = await params;
    console.log(id);
    
    const userId = Number(id)
    console.log(userId);
    
    const existingUser = db.prepare(`
      SELECT id, email, nickname, name, surname FROM users
      WHERE id = ?
    `).get(userId);
    console.log(existingUser);
    
    if (existingUser) {
      return NextResponse.json(existingUser) 
    } 
    return NextResponse.json( 
      { error: "User not found" },
      { status: 404 }
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

export async function PUT(request: Request,{ params }: any) { 
  try {   
    const { id } = await params;
    const userId = Number(id)
    const { M , email, nickname, name, surname } = await request.json();
    console.log(M);
    
    if (! M || M === "" || M === " "){
      return NextResponse.json(
        { error: "Incorrect M" },
        { status: 401 }
      );
    }
    const existingUser = db.prepare(`
      SELECT * FROM users
      WHERE id = ?
    `).get(userId);
    const srpSession = db.prepare(`
      SELECT * FROM srp_sessions
      WHERE user_id = ?
    `).get(existingUser.id);
    if (!existingUser) {
      return NextResponse.json( 
        { error: "Incorrect id" },
        { status: 404 }
      )
    } 
    if (!srpSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    } 
    const serverSession = srp.deriveSession( srpSession.b_number , srpSession.A,  existingUser.salt, existingUser.nickname, existingUser.verifier , M ) 
 
    db.prepare(`
      DELETE FROM srp_sessions
      WHERE user_id = ?
    `).run(userId);
    if (email) {
      db.prepare(`
        UPDATE users
        SET email = ?
        WHERE id = ?
      `).run(email,userId);
    } 
    if (nickname) {
      db.prepare(`
        UPDATE users
        SET nickname = ?
        WHERE id = ?
      `).run(nickname,userId);
    } 
    if (name) {
      db.prepare(`
        UPDATE users
        SET name = ?
        WHERE id = ?
      `).run(name,userId);
    } 
    if (surname) {
      db.prepare(`
        UPDATE users
        SET surname = ?
        WHERE id = ?
      `).run(surname,userId);
    } 
    const updatedUser = db.prepare(`
      SELECT id, email, nickname, name, surname FROM users
      WHERE id = ?
    `).get(userId);
    return NextResponse.json(  {updatedUser:updatedUser,serverSession: serverSession.proof} )
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
    const userId = Number(id)
    const data = request.headers.get('Authorization')
    const dane = JSON.parse(data)
    const M = dane.M 
    const existingUser = db.prepare(`
      SELECT * FROM users
      WHERE id = ?
    `).get(userId);
    const srpSession = db.prepare(`
      SELECT * FROM srp_sessions
      WHERE user_id = ?
    `).get(existingUser.id);
    if (!existingUser) {
      return NextResponse.json( 
        { error: "User not found" },
        { status: 404 }
      )
    }
    if (!srpSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    } 
    const serverSession = srp.deriveSession( srpSession.b_number , srpSession.A,  existingUser.salt, existingUser.nickname, existingUser.verifier , M ) 
 
    db.prepare(`
      DELETE FROM srp_sessions
      WHERE user_id = ?
    `).run(userId);
    db.prepare(`
      DELETE FROM users
      WHERE id = ?
    `).run(userId);
    return NextResponse.json( 
      { message: "User deleted",serverSession:serverSession.proof },
      { status: 200 } 
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