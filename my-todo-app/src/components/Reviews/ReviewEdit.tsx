
import { useState,useEffect,useRef,startTransition } from 'react'; 
import { useLogin } from '../../contexts/Login'; 
import { useFormik } from 'formik'; 
import { reviewValidationSchema } from '@/src/utils/validation'; 
import { date } from 'yup';
import { CreateStarRating } from '../CreateStarRating';
import { ReviewEditButton } from './ReviewEditButton';
const axios = require('axios').default;
export function ReviewEdit( { review, onClose,setAddedReview } : any) {    
  const {name,surname,token}:any = useLogin()  
  const [image, setImage ] = useState<any>(review.content)  
  const [editError, setEditError ] = useState<string>('')  
  const formik = useFormik({ 
      initialValues: { 
        rate: review.rate,
        value: review.value,  
      },
      validationSchema: reviewValidationSchema,
      onSubmit: async (values, { resetForm ,setSubmitting }) => { 
        setSubmitting(true); 
        startTransition(() => {   
          axios.put(`https://localhost:3000/api/comment/${review.id}`,{
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
  const deleteReview = () => {  
    axios.delete(`https://localhost:3000/api/comment/${review.id}`, { headers:{ Authorization: token} }) 
    .then(function (response:any) { 
      onClose()
      setAddedReview(true)
    })
    .catch(function (error:any) {
      console.log(error);
      setEditError(error.response.data.error) 
    }); 
  }
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
      <ReviewEditButton submitting={formik.isSubmitting}/>
    </div> 
    <button type='button' id="delete-review" onClick={() => deleteReview()}>Delete</button>
   </form>
  </div> )
}