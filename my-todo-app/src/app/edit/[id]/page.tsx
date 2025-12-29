'use client'
import { LoginForm } from "@/src/components/LoginForm"
import { RegisterForm } from "@/src/components/RegisterForm";    
import { useParams } from 'next/navigation';
import Link from "next/link"; 
import { useEffect,useState } from "react";
import { useLogin } from "@/src/contexts/Login";
import { useRouter } from "next/navigation";
import { EditForm } from "@/src/components/EditForm";
import { DashboardModal } from "@/src/components/DashboardModal";
export default function Page( ) {    
  const params = useParams();
  const id = params.id as string 
  return <App id={id}/>; 
}   
function App({id}:any ){  
  const {token,loaded}:any = useLogin()
  const router = useRouter(); 
  const [dashBoard,setDashBoard] = useState<boolean>(false)
  useEffect(() => {
    if (loaded && !token) {
      router.push('/')
    } 
  },[token])
    return (    
        <div id="create-background" style={{display: "flex",flexDirection:"column"}}> 
          <div id="header-login">
            <header >
              <div id="nav-items">
                <Link href={"/"}><img src="/logoB3.png" alt="" /></Link>
                <div id="navbar-toggle" data-toggle="offcanvas-wrap" onClick={() => setDashBoard(true)}>
                  <span id="icon-bar upper"></span>
                  <span id="icon-bar middle" ></span>    
                  <span id="icon-bar bottom"></span> 
                </div>
              </div> 
            </header>
          </div>
          <EditForm id={id}/> 
          {dashBoard && <DashboardModal onClose={() => setDashBoard(false)}/> }
        </div> 
    );
}  
