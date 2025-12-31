'use client' 
import { useState,useEffect } from "react";
import { useLogin } from "@/src/contexts/Login";
import { useRouter } from 'next/navigation';
import { ChooseForm } from "@/src/components/ChooseForm";
import { GameForm } from "@/src/components/GameForm";
import { ToastContainer } from "@/src/components/Toasts/ToastContainer";
import Link from "next/link";
import { SpectateGameForm } from "@/src/components/SpectateGameForm";
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
    const [gameBoard, setGameBoard] = useState<any[]>([])  
    const [stopInterval, setStopInterval] = useState<boolean>(false)  
    const [spectator, setSpectator] = useState<any>(null)  
    useEffect(() => { 
        if (fetched) {  
            if (token) {  
                axios.get('https://localhost:3000/api/room/verify',{
                    headers: { Authorization:  token }
                } )
                .then(function (response:any) {
                    console.log(response.data );
                    if (response.data.hasActiveRoom) { 
                        addRoom(response.data.roomCode)
                        setStopInterval(true)
                        setGameStarted(true)
                    }
                    else{
                        addRoom("")
                        setGameStarted(false)
                        setStopInterval(false)
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
        if (!token ) return
        const axiosList = () => {
            axios.get('https://localhost:3000/api/room/list',{
                headers: { Authorization:  token }
            })
            .then((response:any) => {
                if (!stopInterval) {
                    setRoomList(response.data)
                } 
            })
            .catch(console.log);
        }
        axiosList()
        const intervalL = setInterval(() => {
            if (!stopInterval) {
                axiosList()
            }
        }, 10000);
        return () => clearInterval(intervalL); 
    },[token,stopInterval]) 
    const deleteRoom = () => {
        if (roomCode) {
            axios.delete(`https://localhost:3000/api/room/${roomCode}`,{
                headers: { Authorization:  token }
            })
            .then(function (response:any) {
                setGameStarted(false)
                addRoom(null)
            })
            .catch(function (error:any) {
                console.log(error );  
            });
        } 
    }
    return (   
        <div id="create-background" style={{display: "flex",flexDirection:"column"}}>   
            <div id="header-login">
                <header >
                    <div id="nav-items">
                        <Link href={"/"}><img src="/logoB3.png" alt="" style={{cursor:"pointer"}}/></Link>
                        <div id="nav-btns">
                            {roomCode && !(gameBoard.length > 0) && <button id="sing-up" onClick={() => deleteRoom()}>Delete room</button>}
                            {spectator && <button id="sing-up" onClick={() => {setSpectator(null),setStopInterval(false)}}>Quit</button>}
                            <div id="navbar-toggle" data-toggle="offcanvas-wrap" >
                                <span id="icon-bar upper"></span>
                                <span id="icon-bar middle" ></span>    
                                <span id="icon-bar bottom"></span> 
                            </div>
                        </div>
                    </div> 
                </header>
            </div>
                {!spectator && gameStarted && <GameForm setGameBoard={setGameBoard} gameBoard={gameBoard} addToast={(type:string,value:string) => setToastList((prev:any) => [...prev, {type,id:Date.now(),value}])} setGameStarted={setGameStarted} setStopInterval={setStopInterval}/>}  
                    {!spectator && !gameStarted &&<ChooseForm setGameStarted={setGameStarted} roomList={roomList} setRoomList={setRoomList} setStopInterval={setStopInterval} stopInterval={stopInterval} setSpectator={setSpectator}/> } 
                {toastList.length > 0 && <ToastContainer data={toastList} removeToast={ (id:any) => setToastList(toastList.filter((p:any) => p.id != id)) }/> }
                {spectator && <SpectateGameForm roomCode={spectator} onClose= {() => setSpectator(null)} addToast={(type:string,value:string) => setToastList((prev:any) => [...prev, {type,id:Date.now(),value}])}/>}
        </div> 
    );
}  
