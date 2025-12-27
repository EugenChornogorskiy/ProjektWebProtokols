import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import db from '@/src/lib/database';
import path from "path"; 
import jwt from 'jsonwebtoken';  
export async function GET(request: Request,{ params }: any) { 
  try {   
    const { id } = params;
    const userId = Number(id)
    const existingUser = db.prepare(`
      SELECT id, email, nickname, name, surname FROM users
      WHERE id = ?
    `).get(userId);
    
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
    const { id } = params;
    const userId = Number(id)
    const password = await request.headers.get('Password');  
    const existingUser = db.prepare(`
      SELECT * FROM users
      WHERE id = ?
    `).get(userId);
    if (existingUser.password != password) {
      return NextResponse.json( 
        { error: "Incorrect password" },
        { status: 401 }
      )
    }
    const email = await request.headers.get('Email'); 
    const nickname = await request.headers.get('Nickname'); 
    const  
    
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
