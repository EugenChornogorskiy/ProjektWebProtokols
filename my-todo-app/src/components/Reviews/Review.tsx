
import { useState,useEffect,useRef,startTransition } from 'react'; 
import { useLogin } from '../../contexts/Login'; 
import { useFormik } from 'formik'; 
import { reviewValidationSchema } from '@/src/utils/validation'; 
import { date } from 'yup';
import { CreateStarRating } from '../CreateStarRating';
import { ReviewSubmitButton } from './ReviewSubmitButton';
const axios = require('axios').default;
export function Review( { onClose,setAddedReview } : any) {    
  const {name,surname,token}:any = useLogin()  
  const [image, setImage ] = useState<any>("")     
  
  const formik = useFormik({
      initialValues: { 
        rate: 1,
        value: '',  
      },
      validationSchema: reviewValidationSchema,
      onSubmit: async (values, { resetForm ,setSubmitting }) => { 
        setSubmitting(true); 
        startTransition(() => {   
          axios.post(`https://localhost:3000/api/comment`,{
            token: token,  
            rate: values.rate,
            value: values.value,
            image: image
          } )
          .then(function (response:any) {   
            setAddedReview(true)
            onClose()
          })
          .catch(function (error:any) {
            console.log(error ); 
          }); 
        }); 
        resetForm(); 
        setImage(null); 
        setSubmitting(false); 
      },
    });   
  return (  
  <div id="review-form"> 
   <form id="review-create-wrapper" onSubmit={formik.handleSubmit}>  
    <div id="create-review-author">
      <img src="/icons/BxsUserCircleB.svg" alt="" />
      <p>{ name +" " +  surname} </p> 
    </div>
    <div id="create-review-rating">
      <CreateStarRating value={formik.values.rate} formik={formik}/> 
    </div>
    <div id="textarea-review">
      < textarea id="review-value" name="value" placeholder="Review value" value={formik.values.value} onChange={formik.handleChange} onBlur={formik.handleBlur}></textarea>
      {formik.touched.value && formik.errors.value && (
        <div className="error">{formik.errors.value}</div>
      )}
    </div>
    <div>
      <div id="upload-file-review"> 
        <label id="upload-btn-review"> 
          <img src="/icons/AddPhoto.svg" alt="" />
          <p>Add image or video</p>
          <input type="file" accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImage(reader.result);  
                };
                reader.readAsDataURL(file);
              }
            }}
            style={{ display: "none" }} />
        </label>
        {image && (
          <div id="image-delete" onClick={() => setImage(null)}> 
            Delete file
          </div>
        )} 
      </div>  
    </div>
    <div id="review-btns">
      <button type='button' id="cencel-review" onClick={() => onClose()}>Cencel</button>
      <ReviewSubmitButton submitting={formik.isSubmitting}/>
    </div> 
   </form>
  </div> )
}