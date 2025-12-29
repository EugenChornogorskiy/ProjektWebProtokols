 
import { useState,useEffect,useRef } from 'react';
import { useLogin } from '../contexts/Login';
import Link from 'next/link';  
const axios = require('axios').default;
export function Dashboard( { } : any) {    
  const {login,token,id,name,surname,email}:any = useLogin()
  const [open, setOpen] = useState(false); 
  const [showAccount, setShowAccount] = useState(false)   
  const dropdownRef = useRef<HTMLDivElement>(null) 
  const [active, setActive] = useState<any >(null)    
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);   
  return ( 
    <div id="dashboard-form" >    
      <p id="your-dashboard">Your dashboard</p>
      { !login && <div id="dash-btns"> 
        <Link href={"/auth/login"} style={{width:"100%"}}>
          <button id="login-btn-dash">Login in</button>
        </Link>
        <Link href={"/auth/register"} style={{width:"100%"}}>
          <button type="button" id="create-new-btn" > Create new account </button>
        </Link>
      </div>}
      { login && name &&
      <div style={{width:"100%"}}>
          <div className="info-dropbox-dash" onClick={() => setShowAccount(!showAccount)}>
            <div className="info-dropbox-name-dash"><p>Account</p> <p><img src="/icons/down.png" alt="" style={{ transform: showAccount ? "rotate(0deg)"  : "rotate(180deg)"}}/></p></div>
            {showAccount &&   
                    <div className='review' style={{color:"snow",width:"100%"}}>
                        <div className='dashboard-creator'>
                            <img src="/icons/UserCircle.svg" alt="" />
                            <div id="author">
                                <div id="author"> <p id="review-author">{ name + " " +  surname}</p></div>
                                <Link href={`/edit/${id}`}>
                                  <p style={{color:"#bbbbbbff",cursor:"pointer"}} id="reviews-count">Edit</p>
                                </Link> 
                            </div>
                        </div>
                        <div className="dashboard-info">Login: { login} </div> 
                        <div className="dashboard-info">Email: { email} </div> 
                     </div> 
            } 
          </div>
          <div>
            <button>Write review</button>
          </div>
      </div> 
      } 
    </div> )
}