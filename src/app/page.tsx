'use client'
import { useRouter } from 'next/navigation';
import { useState,useEffect } from "react";
import Link from 'next/link';
import { useLogin } from '../contexts/Login';
import { DashboardModal } from '../components/DashboardModal';
import { ReviewInformation } from '../components/Reviews/ReviewInformation';
import { ReviewModal } from '../components/Reviews/ReviewModal';
import { ReviewEditModal } from '../components/Reviews/ReviewEditModal'; 
const axios = require('axios').default;
export default function Home() {
  const [dashBoard,setDashBoard] = useState<boolean>(false)
  const router = useRouter(); 
  const { token,addLogin,addId,addToken }:any = useLogin()
  const [createReview,setCreateReview] = useState<boolean>(false) 
  const [editReview,setEditReview] = useState<any>(null) 
  const [addedReview,setAddedReview] = useState<boolean>(true) 
  const logOut = () => {
    axios.get(`https://localhost:3000/api/auth/logout`,{ headers: { Authorization:  token } } )
    .then(function (response:any) {    
      addLogin('')
      addToken('')
      addId(null)
    })
    .catch(function (error:any) {
      console.log(error ); 
    }); 
  }
  return ( 
    <div id="container">  
      <header >
        <div id="nav-items">
          <img src="/logoB3.png" alt="" />
          <div id="nav-btns">
            {!token && <Link href={"/auth/register"}> <button id="sing-up">Sing up</button></Link>} 
            {!token && <Link href={"/auth/login"}><button id="sing-in">Log in</button></Link> }
            {token && <button id="sing-up" onClick={() => logOut()}>Log out</button> }
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
      <div id="comments">
        <ReviewInformation addedReview={addedReview} setAddedReview={setAddedReview} setCreateReview={setCreateReview} setEditReview={setEditReview}/>
      </div>
      <footer>

      </footer>
      {dashBoard && <DashboardModal onClose={() => setDashBoard(false)}/> }
      {createReview && <ReviewModal onClose={() => setCreateReview(false)} setAddedReview={setAddedReview}/>}
      {editReview && <ReviewEditModal review={editReview} onClose={() => setEditReview(null)} setAddedReview={setAddedReview}/>}
    </div>
  );
}
