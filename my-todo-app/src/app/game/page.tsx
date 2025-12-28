'use client' 
import { useState,useEffect } from "react";
import { useLogin } from "@/src/contexts/Login";
import { useRouter } from 'next/navigation';
import { ChooseForm } from "@/src/components/ChooseForm";
import { GameForm } from "@/src/components/GameForm";
import { ToastContainer } from "@/src/components/ToastContainer";
import Link from "next/link";
const axios = require('axios').default;
export default function Page( ) {      
  return <App />; 
}   
function App( ){     
    const {login,loaded,roomCode,token,fetched,addRoom}:any = useLogin()
    const router = useRouter(); 
    const [gameStarted, setGameStarted] = useState<boolean>(false) 
    const [roomList, setRoomList] = useState<any[]>([])  
    const [toastList, setToastList] = useState<any[]>( []);   
    useEffect(() => { 
        if (fetched) {  
            if (token) { 
                
                axios.get('http://localhost:3000/api/room/verify',{
                    headers: { Authorization:  token }
                } )
                .then(function (response:any) {
                    console.log(response.data );
                    if (response.data.hasActiveRoom) { 
                        addRoom(response.data.roomCode)
                        setGameStarted(true)
                    }
                    else{
                        addRoom("")
                        setGameStarted(false)
                    } 
                })
                .catch(function (error:any) {
                    console.log(error ); 
                });
            } 
            else{
                console.log("error "); 
                router.push('/auth/login')
            }
        }
    },[fetched,token])
    useEffect(() => {
        if (token) { 
            setInterval(() => {
                axios.get('http://localhost:3000/api/room/',{
                    headers: { Authorization:  token }
                })
                .then(function (response:any) {
                    setRoomList(response.data)
                })
                .catch(function (error:any) {
                    console.log(error );  
                });
            }, 10000)
        }
    },[]) 
    return (   
        <div id="create-background" style={{display: "flex",flexDirection:"column"}}>   
            <div id="header-login">
                <header >
                    <div id="nav-items">
                        <Link href={"/"}><img src="/logoB3.png" alt="" /></Link>
                        <div id="nav-btns">
                        <div id="navbar-toggle" data-toggle="offcanvas-wrap" >
                            <span id="icon-bar upper"></span>
                            <span id="icon-bar middle" ></span>    
                            <span id="icon-bar bottom"></span> 
                        </div>
                        </div>
                    </div> 
                </header>
            </div>
                {gameStarted ? <GameForm addToast={(type:string,value:string) => setToastList((prev:any) => [...prev, {type,id:Date.now(),value}])}/> :  <ChooseForm setGameStarted={setGameStarted} roomList={roomList}/> } 
                {toastList.length > 0 && <ToastContainer data={toastList} removeToast={ (id:any) => setToastList(toastList.filter((p:any) => p.id != id)) }/> }

        </div> 
    );
}  
