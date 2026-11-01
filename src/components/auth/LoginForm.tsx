import { useState, startTransition, useEffect } from 'react';   
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik'; 
import { loginValidationSchema } from '@/src/utils/validation'; 
import { LoginButton } from '@/src/components/auth/LoginButton';    
import Link from 'next/link';
import { useLogin } from '../../contexts/Login';
const axios = require('axios').default; 
const srp = require('secure-remote-password/client')
export function LoginForm( {type }: any) {   
  const [loginError, setLoginError] = useState<string >("");
  const { addLogin,addToken,addId } :any = useLogin()
  const router = useRouter(); 
  const formik = useFormik({
      initialValues: { 
        login: '',
        password: '',  
      },
      validationSchema: loginValidationSchema ,
      onSubmit: async (values, { resetForm ,setSubmitting}) => { 
        setLoginError("");
        setSubmitting(true);   
        
        const a = srp.generateEphemeral();
        const A = a.public.toString("hex");

        startTransition(() => { 

          axios.post('https://localhost:3000/api/auth/login/srp', {   login: values.login, A: A })
          .then(function (response:any) { 
            const salt = response.data.salt 
            const B = response.data.B 
            const login = response.data.login
            console.log(login); 
            const privateKey = srp.derivePrivateKey(salt, login, values.password)
            const clientSession = srp.deriveSession(a.secret, B ,salt ,login, privateKey)
            const M = clientSession.proof

            axios.post("https://localhost:3000/api/auth/login/srp/verify", {  login: login, M: M })
            .then(function (response:any) { 
              srp.verifySession(A, clientSession, response.data.serverSession );
              addLogin(response.data.user.nickname)
              addToken(response.data.token)
              addId(response.data.user.id)
            })
            .catch(function (error:any) {
              console.log(error);
              setLoginError(error.response.data.error) 
            });
          })
          .catch(function (error:any) {
            console.log(error);
            setLoginError(error.response.data.error) 
          });
        }); 
        resetForm(); 
        setLoginError("");
        setSubmitting(false);
      }, 
    });   
  return (    
    <div id="backgr-login"> 
          <div id="login-form">  
           <form onSubmit={formik.handleSubmit} style={{height:"100%"}}>  
            <div id="login-inputs">
              <div id="login-content">
                <div className='login-part'>
                  <div className='login-input'> <input type="text" id="login-login" name="login" placeholder="Address email lub nickname" value={formik.values.login} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                  {formik.touched.login && formik.errors.login && (
                    <div className="login-error">{formik.errors.login}</div>
                  )}
                </div>
                <div className='login-part'>
                  <div className='login-input'> <input type="password" id="login-password" name="password" placeholder="Password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}/></div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="login-error">{formik.errors.password}</div>
                  )}
                </div>
                <LoginButton submitting={formik.isSubmitting} type={type}/>
                {loginError.length > 0 && (
                    <div className="login-error">{loginError}</div>
                )}
              </div> 
              <Link href={"/auth/register"} style={{width:"100%"}}>
                <button type="button" id="create-new-btn" > Create new account </button>
              </Link>
            </div>
           </form>
           
          </div> 
    </div>
  )
}