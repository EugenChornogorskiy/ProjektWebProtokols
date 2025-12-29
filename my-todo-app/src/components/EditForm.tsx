import { useState, startTransition,useEffect } from 'react';   
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik'; 
import { registerValidationSchema } from '@/src/utils/validation'; 
import { LoginButton } from '@/src/components/LoginButton';    
import Link from 'next/link';
import { useLogin } from '../contexts/Login';
import { log } from 'console';
import { EditButton } from './EditButton';
const srp = require('secure-remote-password/client')
const axios = require('axios').default;
export function EditForm( { id }: any) {   
  const [registerError, setRegisterError] = useState<any >(""); 
  const { addLogin,addToken,addId,email,name,surname,login,loaded, token } :any = useLogin()
  const [accountInfo, setAccountInfo] = useState<any >({email:"",nickname:"",name:"",surname:""}); 
  const router = useRouter(); 
  useEffect(() => {
    console.log("email,login,name,surname");
    if (email && name && surname && login) { 
      
      setAccountInfo({email:email,nickname:login,name:name,surname:surname})
    }
  },[email,name,surname,login])
  const formik = useFormik({
      enableReinitialize: true,
      initialValues: {  
        password: '',
        name: accountInfo.name,
        surname: accountInfo.surname,
        email: accountInfo.email,
        nickname: accountInfo.nickname  
      }, 
      validationSchema: registerValidationSchema ,
      onSubmit: async (values, { resetForm ,setSubmitting}) => { 
        setRegisterError("");
        setSubmitting(true);   

        const a = srp.generateEphemeral();
        const A = a.public.toString("hex");

        startTransition(() => {   

          axios.post('http://localhost:3000/api/auth/login/srp', {   login: login, A: A })
          .then(function (response:any) { 
            const salt = response.data.salt 
            const B = response.data.B 

            const privateKey = srp.derivePrivateKey(salt, login, values.password)
            const clientSession = srp.deriveSession(a.secret, B, salt ,login, privateKey)
            console.log(clientSession.proof,clientSession);
            
            const M = clientSession.proof
            axios.put(`http://localhost:3000/api/users/${id}`, { M: M ,
              email: values.email,
              nickname: values.nickname, 
              name: values.name,
              surname: values.surname }) 
            .then(function (response:any) { 
              srp.verifySession(A, clientSession, response.data.serverSession );
              addLogin(response.data.updatedUser.nickname) 
              addId(response.data.updatedUser.id)
            })
            .catch(function (error:any) {
              console.log(error);
              setRegisterError(error.response.data.error) 
            });
          })
          .catch(function (error:any) {
            console.log(error);
            setRegisterError(error.response.data.error) 
          }); 
        });  
        resetForm(); 
        setRegisterError("");
        setSubmitting(false);
      }, 
    });   
  const deleteAccount = () => {
        const a = srp.generateEphemeral();
        const A = a.public;
          axios.post('http://localhost:3000/api/auth/login/srp', {   login: login, A: A.toString("hex") })
          .then(function (response:any) { 
            const salt = Buffer.from(response.data.salt, 'hex');
            const B = Buffer.from(response.data.B, 'hex');

            const client = new srp.Client(a.secret, formik.values.password, salt, A, B);
            const M = client.computeProof();

            axios.delete(`http://localhost:3000/api/users/${id}`, { headers:{ M: M.toString("hex")} }) 
            .then(function (response:any) { 
              addLogin('')
              addToken('')
              addId(null)
            })
            .catch(function (error:any) {
              console.log(error);
              setRegisterError(error.response.data.error) 
            });
          })
          .catch(function (error:any) {
            console.log(error);
            setRegisterError(error.response.data.error) 
          }); 
  }
  return (    
    <div id="backgr-login"> 
          <div id="register-form">  
           <form onSubmit={formik.handleSubmit} style={{height:"100%"}}>  
            <div id="login-inputs">
              <div id="login-content">
                <div className='register-part'>
                  <div style={{width:"100%"}}>
                    <div className='register-input'> <input type="text" id="register-name" name="name" placeholder="Name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                    {formik.touched.name && formik.errors.name && (
                      <div className="login-error">{formik.errors.name}</div>
                    )}
                  </div> 
                  <div style={{width:"100%"}}>
                    <div className='register-input'> <input type="text" id="register-surname" name="surname" placeholder="Surname" value={formik.values.surname} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                    {formik.touched.surname && formik.errors.surname && (
                      <div className="login-error">{formik.errors.surname}</div>
                    )}
                  </div> 
                </div>
                <div className='login-part'>
                  <div className='login-input'> <input type="text" id="register-email" name="email" placeholder="Email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                  {formik.touched.email && formik.errors.email && (
                    <div className="login-error">{formik.errors.email}</div>
                  )}
                </div>
                <div className='login-part'>
                  <div className='login-input'> <input type="text" id="register-nickname" name="nickname" placeholder="Nickname" value={formik.values.nickname} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                  {formik.touched.nickname && formik.errors.nickname && (
                    <div className="login-error">{formik.errors.nickname}</div>
                  )}
                </div>
                <div className='login-part'>
                  <div className='login-input'> <input type="password" id="login-password" name="password" placeholder="Password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="login-error">{formik.errors.password}</div>
                  )}
                </div>
                {registerError &&  (
                    <div className="login-error">{registerError}</div>
                )}
                <EditButton submitting={formik.isSubmitting} /> 
              </div> 
              <button type="button" id="delete-new-btn"  onClick={() => deleteAccount()}> Delete account </button> 
            </div>
           </form>
          </div> 
    </div>
  )
}