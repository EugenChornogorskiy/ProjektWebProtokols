 
import * as yup from 'yup';  
export let isSubmittingAddressTest = false;
const date = new Date();
const year = date.getFullYear(); 
export const loginValidationSchema = yup.object({
  login: yup
    .string() 
    .min(3, 'Login must be at least 3 characters') 
    .max(50, 'Login cannot exceed 50 characters') 
    .required("Login is required"),
  password: yup
    .string()
    .min(7, 'Password must be at least 7 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .matches(
      /^(?=.*[!@#$%^&*()[\]{}:;"'<>?,./\\|`~+=_-])[A-Za-z0-9!@#$%^&*()[\]{}:;"'<>?,./\\|`~+=_-]+$/,
      'Password must have one special character and no spaces'
    )
    .required('Password is required') 
});
export const registerValidationSchema = yup.object({ 
  password: yup
    .string()
    .min(7, 'Password must be at least 7 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .matches(
      /^(?=.*[!@#$%^&*()[\]{}:;"'<>?,./\\|`~+=_-])[A-Za-z0-9!@#$%^&*()[\]{}:;"'<>?,./\\|`~+=_-]+$/,
      'Password must have one special character and no spaces'
    )
    .required('Password is required'),
  name: yup
    .string() 
    .min(3, 'Name must be at least 3 characters') 
    .max(20, 'Name cannot exceed 20 characters') 
    .required("Name is required"),
  surname: yup
    .string() 
    .min(3, 'Surname must be at least 3 characters') 
    .max(30, 'Surname cannot exceed 30 characters') 
    .required("Surname is required"),
  nickname: yup
    .string() 
    .min(3, 'Name must be at least 3 characters') 
    .max(20, 'Name cannot exceed 20 characters') 
    .required("Name is required"),
  email: yup
    .string()
    .email('Invalid email format') 
    .required("Email is required"),
});
 
export const codeValidationSchema = yup.object({ 
  code: yup
    .string()  
    .required('Code is required'), 
});
export const tradeValidationSchema = yup.object({ 
  priceGive: yup
    .number()
    .typeError("Money must be a number") 
    .min(0, "Money must be ≥ 0")
    .max(4000, "Money must be ≤ 4000")
    .required("Money is required"), 
  priceGet: yup
    .number()
    .typeError("Money must be a number") 
    .min(0, "Money must be ≥ 0")
    .max(4000, "Money must be ≤ 4000")
    .required("Money is required"), 
});