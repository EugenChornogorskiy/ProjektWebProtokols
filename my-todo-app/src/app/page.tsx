'use client'
import { useRouter } from 'next/navigation';
import { useState,useEffect } from "react";
import Link from 'next/link';
export default function Home() {
  const [table,setTable] = useState<any[]>([])
  const router = useRouter(); 
  
  useEffect(() =>{  
  },[] )
  return ( 
    <div id="container">  
      <header >
        <div id="nav-items">
          <img src="/logoB3.png" alt="" />
          <div id="nav-btns">
            <Link href={"/auth/register"}> <button id="sing-up">Sing up</button></Link> 
            <Link href={"/auth/login"}><button id="sing-in">Log in</button></Link> 
          </div>
        </div> 
      </header>
      <div id="main">
        <div id="content">
          <div id="info">
            <p id="monopoly">Monopoly</p>
            <p id="invite">Invite your friends and play monopoly</p>
            <Link href={"/auth/login"}><button id="start">Start game</button></Link>
          </div>
        </div>
      </div>
      <footer></footer>
    </div>
  );
}
