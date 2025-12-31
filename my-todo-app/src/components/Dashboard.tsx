 
import { useState,useEffect,useRef } from 'react';
import { useLogin } from '../contexts/Login';
import Link from 'next/link';  
const axios = require('axios').default;
export function Dashboard( { } : any) {    
  const {login,token,id,name,surname,email}:any = useLogin()
  const [open, setOpen] = useState(false); 
  const [showAccount, setShowAccount] = useState(false)   
  const [history, setHistory] = useState<any[]>([])  
  const [showHistory, setShowHistory] = useState<boolean>(false)  
  const dropdownRef = useRef<HTMLDivElement>(null) 
  const [update, setUpdate] = useState<boolean>(false)     
  useEffect(() => {
    if (token) {
      axios.get(`https://localhost:3000/api/game_history`,{ headers:{ Authorization: token} } )
      .then(function (response:any) {  
        setHistory(response.data)
      })
      .catch(function (error:any) {
        console.log(error ); 
      }); 
    } 
  }, [token,update]); 
  const deleteHistory = (id:number) => {
      axios.delete(`https://localhost:3000/api/game_history${id}`,{ headers:{ Authorization: token} } )
      .then(function (response:any) {  
        setHistory(history.filter(h => h.id != id))
        setUpdate(!update)
      })
      .catch(function (error:any) {
        console.log(error ); 
      }); 
  }
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
          <div className="info-dropbox-dash" onClick={() => setShowHistory(!showHistory)}>
            <div className="info-dropbox-name-dash"><p>History</p> <p><img src="/icons/down.png" alt="" style={{ transform: showHistory ? "rotate(0deg)"  : "rotate(180deg)"}}/></p></div>
            {showHistory &&   
              <div> {history.map(h => {
                return(
                    <div className='review' style={{color:"snow",width:"100%"}}>
                        <div className='dashboard-creator'>
                            <img src="/icons/UserCircle.svg" alt="" />
                            <div id="author">
                                <div id="author"> <p id="review-author">{ name + " " +  surname}</p></div> 
                                <p style={{color:"#bbbbbbff",cursor:"pointer"}} id="reviews-count" onClick={() => deleteHistory(h.id)}>Delete</p> 
                            </div>
                        </div>
                        <div className="dashboard-info">Winner: { h.winner} </div> 
                        <div className="dashboard-info">Room: { h.room_code} </div> 
                     </div>
                )
              })} 
              </div> 
            }  
          </div> 
      </div> 
      } 
    </div> )
}