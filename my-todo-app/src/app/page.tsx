'use client'
import { useRouter } from 'next/navigation';
import { useState,useEffect } from "react";
import Link from 'next/link';
import { useLogin } from '../contexts/Login';
import { DashboardModal } from '../components/DashboardModal';
export default function Home() {
  const [dashBoard,setDashBoard] = useState<boolean>(false)
  const router = useRouter(); 
  const { token }:any = useLogin()
  return ( 
    <div id="container">  
      <header >
        <div id="nav-items">
          <img src="/logoB3.png" alt="" />
          <div id="nav-btns">
            <Link href={"/auth/register"}> <button id="sing-up">Sing up</button></Link> 
            <Link href={"/auth/login"}><button id="sing-in">Log in</button></Link> 
            <div id="navbar-toggle" data-toggle="offcanvas-wrap" onClick={() => setDashBoard(true)}>
              <span id="icon-bar upper"></span>
              <span id="icon-bar middle" ></span>    
              <span id="icon-bar bottom"></span> 
            </div>
          </div>
        </div> 
      </header>
      <div id="main">
        <div id="content">
          <div id="info">
            <p id="monopoly">Monopoly</p>
            <p id="invite">Invite your friends and play monopoly</p>
            <Link href={token ? "/game" : "/auth/login"}><button id="start">Start game</button></Link>
          </div>
        </div>
      </div>
      <footer></footer>
      {dashBoard && <DashboardModal onClose={() => setDashBoard(false)}/> }
    </div>
  );
}
