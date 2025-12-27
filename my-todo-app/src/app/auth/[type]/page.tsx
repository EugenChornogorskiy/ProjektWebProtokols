'use client'
import { LoginForm } from "@/src/components/LoginForm"
import { RegisterForm } from "@/src/components/RegisterForm";    
import { useParams } from 'next/navigation';
import Link from "next/link";
import Image from 'next/image' 

export default function Page( ) {    
  const params = useParams();
  const type = params.type as string 
  return <App type={type}/>; 
}   
function App({type}:any ){   
    return (   
      
        <div id="create-background" style={{display: "flex",flexDirection:"column"}}> 
          <div id="header-login">
            <header >
              <div id="nav-items">
                <Link href={"/"}><img src="/logoB3.png" alt="" /></Link>
                <div id="nav-btns">
                  <Link href={"/auth/register"}> <button id="sing-up">Sing up</button></Link> 
                  <Link href={"/auth/login"}><button id="sing-in">Log in</button></Link> 
                </div>
              </div> 
            </header>
          </div>
          {type == "login" ? <LoginForm type={type}/> : <RegisterForm type={type}/>} 
        </div> 
    );
}  
