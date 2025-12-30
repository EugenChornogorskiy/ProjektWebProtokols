import { useState, startTransition,useEffect } from 'react';   
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik'; 
import { registerValidationSchema } from '@/src/utils/validation'; 
import { LoginButton } from '@/src/components/auth/LoginButton';    
import Link from 'next/link';
import { useLogin } from '../../contexts/Login';
import { log } from 'console'; 
const srp = require('secure-remote-password/client')
const axios = require('axios').default;
export function RegisterForm( { type }: any) {   
  const [registerError, setRegisterError] = useState<any >(""); 
  const { addLogin,addToken,addId } :any = useLogin()
  const formik = useFormik({
      initialValues: {  
        password: '',
        name: '',
        surname: '',
        email: '',
        nickname: ''  
      }, 
      validationSchema: registerValidationSchema ,
      onSubmit: async (values, { resetForm ,setSubmitting}) => { 
        setRegisterError("");
        setSubmitting(true);    
        const salt = srp.generateSalt();
        const privateKey = srp.derivePrivateKey(salt, values.nickname, values.password);
        const verifier = srp.deriveVerifier(privateKey);
        startTransition(() => {   
          axios.post('https://localhost:3000/api/users/', {
            email: values.email,
            nickname: values.nickname,
            salt:salt,
            verifier:verifier,
            name: values.name,
            surname: values.surname
          })
          .then(function (response:any) {
            console.log(response) 
            addLogin(response.data.user.nickname)
            addToken(response.data.token)
            addId(response.data.user.id)
          })
          .catch(function (error:any) {
            console.log(error) 
            if (error.response) {
              setRegisterError(error.response.data.error )
           }
          });
        });  
        resetForm(); 
        setRegisterError("");
        setSubmitting(false);
      }, 
    });   
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
                <LoginButton submitting={formik.isSubmitting} type={type}/> 
              </div>
              <Link href="/auth/login"> 
                <button type="button" id="create-new-btn" > Login in </button>
              </Link> 
              
            </div>
           </form>
          </div> 
    </div>
  )
}