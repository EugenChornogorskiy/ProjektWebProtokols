import { useState, startTransition,useEffect } from 'react';   
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik'; 
import { codeValidationSchema } from '@/src/utils/validation'; 
import { LoginButton } from '@/src/components/LoginButton';    
import Link from 'next/link';
import { useLogin } from '../contexts/Login';
import { log } from 'console';
const axios = require('axios').default;
export function ChooseForm( {setGameStarted,roomList,setRoomList, setStopInterval,stopInterval }:any) {   
  const [roomSearch, setRoomSearch] = useState<any >(""); 
  const {token,addRoom}:any = useLogin()
  const formik = useFormik({
      initialValues: {  
        code: '', 
      }, 
      validationSchema: codeValidationSchema ,
      onSubmit: async (values, { resetForm ,setSubmitting}) => {  
        setSubmitting(true);   
        startTransition(async() => {  
          axios.get('http://localhost:3000/api/room/join',{
            headers: { Authorization:  token, Room: values.code }
          } )
          .then(function (response:any) {
            console.log(response.data );
            if (response.data.joinAllowed) { 
              addRoom(values.code)
              setGameStarted(true)
            } 
          })
          .catch(function (error:any) {
            console.log(error );   
          });
        });  
        resetForm();  
        setSubmitting(false);
      }, 
    });   
  const createRoom = () => {
      axios.post('http://localhost:3000/api/room/',{
        token:token
      } )
      .then(function (response:any) {
        console.log(response.data.hasActiveRoom);
        if (response.data.hasActiveRoom) { 
          addRoom(response.data.roomCode)
          setGameStarted(true)
        }
        else{ 
          console.log("error ");
        } 
      })
      .catch(function (error:any) {
        console.log(error ); 
      });
    }
    console.log(roomList);
  const searchRoom = () => {
      setStopInterval(true)
      axios.get(`http://localhost:3000/api/room/search?name=${roomSearch}`,{
        headers: {Authorization: token }
        
      } )
      .then(function (response:any) {  
        setRoomList(response.data ) 
      })
      .catch(function (error:any) {
        console.log(error ); 
      });
  }
  return (    
  <div id="backgr-login">  
    <div id="room-list-form">  
      <form onSubmit={formik.handleSubmit} style={{height:"100%", width:"500px"}}>  
        <div id="login-inputs">
          <div id="login-content">
            <div className='register-part'> 
              <div className='login-part'>
                <div className='login-input'> <input type="text" id="login-password" name="code" placeholder="Game code" value={formik.values.code} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                {formik.touched.code && formik.errors.code && (
                  <div className="login-error">{formik.errors.code}</div>
                )}
              </div> 
              <button type="submit" id="join-new-btn" > Join in </button> 
            </div>  
            <button type="button" id="create-new-btn" onClick={() => createRoom()}> Create room </button> 
          </div>
        </div>
      </form>
      <div id="room-list">
        <div id='search-input'><input type="text" placeholder="Room name" value={roomSearch} onChange={(e) => setRoomSearch(e.target.value)}/><button onClick={() => searchRoom()}>Search</button></div>
        {stopInterval && <div id="start-interval"><button onClick={() => {setStopInterval(false), setRoomSearch('')}}>All rooms</button></div>}
        {roomList.map((r:any) => {
          return (
            <div key={r.room.id} className='room'>
              <p className='name'>{r.room.name}</p>
              <p className='code'>{r.room.room_code}</p>
              <p className='state'>{r.room.game_state}</p>
              <div className="room-players">
                {r.players.map((p:any) => {
                  return (
                    <div key={p.id} style={{display: "flex",gap:"10px",alignItems:"center"}}>
                      <img src="/BxsUserCircleB.svg" alt="" />
                      <p>{p.nickname}</p> 
                    </div>
                  )
                })}
              </div>
              {r.players.length < 2 && <div className='join-room'><button className='join-room-btn' onClick={() => {addRoom(r.room.room_code), setGameStarted(true)}}>Join</button></div>}
            </div>
          )
        })}
      </div>
    </div> 
  </div>
  )
}