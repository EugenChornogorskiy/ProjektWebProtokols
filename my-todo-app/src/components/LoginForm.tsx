import { useState, startTransition, useEffect } from 'react';   
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik'; 
import { loginValidationSchema } from '@/src/utils/validation'; 
import { LoginButton } from '@/src/components/LoginButton';    
import Link from 'next/link';
import { useLogin } from '../contexts/Login';
const axios = require('axios').default;
export function LoginForm( {type }: any) {   
  const [loginError, setLoginError] = useState<string >("");
  const { addLogin,addToken } :any = useLogin()
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
        startTransition(() => { 
          axios.post('http://localhost:3000/api/auth/login', {
            login: values.login,
            password: values.password
          })
          .then(function (response:any) {
            console.log(response.data);
            addLogin(response.data.user.nickname)
            addToken(response.data.token)
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