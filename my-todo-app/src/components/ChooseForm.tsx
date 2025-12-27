import { useState, startTransition,useEffect } from 'react';   
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik'; 
import { codeValidationSchema } from '@/src/utils/validation'; 
import { LoginButton } from '@/src/components/LoginButton';    
import Link from 'next/link';
import { useLogin } from '../contexts/Login';
import { log } from 'console';
const axios = require('axios').default;
export function ChooseForm( {setGameStarted,roomList}:any) {   
  const [registerError, setRegisterError] = useState<any >(""); 
  const {token,addRoom}:any = useLogin()
  const formik = useFormik({
      initialValues: {  
        code: '', 
      }, 
      validationSchema: codeValidationSchema ,
      onSubmit: async (values, { resetForm ,setSubmitting}) => { 
        setRegisterError("");
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
        setRegisterError("");
        setSubmitting(false);
      }, 
    });   
    const createRoom = () => {
      axios.get('http://localhost:3000/api/room/create',{
        headers: { Authorization:  token }
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
  return (    
  <div id="backgr-login">  
    <div id="register-form">  
      <form onSubmit={formik.handleSubmit} style={{height:"100%"}}>  
        <div id="login-inputs">
          <div id="login-content">
            <div className='register-part'> 
              <div className='login-part'>
                <div className='login-input'> <input type="text" id="login-password" name="code" placeholder="Game code" value={formik.values.code} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                {formik.touched.code && formik.errors.code && (
                  <div className="login-error">{formik.errors.code}</div>
                )}
              </div> 
              <button type="submit" id="create-new-btn" > Join in </button> 
            </div>  
            <button type="button" id="create-new-btn" onClick={() => createRoom()}> Create room </button> 
          </div>
        </div>
      </form>
    </div> 
  </div>
  )
}