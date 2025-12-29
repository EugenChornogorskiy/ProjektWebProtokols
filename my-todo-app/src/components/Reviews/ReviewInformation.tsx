import { StarRating } from './StarRating';
import { useRouter } from 'next/navigation';
import { useEffect,useState } from 'react';
import { useLogin } from '../../contexts/Login';
const axios = require('axios').default;
export function ReviewInformation( { addedReview, setAddedReview,setCreateReview,setEditReview } : any) {    
  const {login,token,id}:any = useLogin()  
  const router = useRouter();
  const [commentsList, setCommentsList] = useState<any[] >([]);  
  const [axiosDone, setAxiosDone] = useState<boolean >(false);   
  useEffect(() => {
    if (addedReview) { 
      axios.get(`http://localhost:3000/api/comment` )
      .then(function (response:any) {  
        setCommentsList(response.data ) 
        setAxiosDone(true)
        setAddedReview(false)
      })
      .catch(function (error:any) {
        console.log(error ); 
      }); 
    } 
  },[addedReview])
  return (
    <div id="reviews-form"> 
        {!axiosDone && <div id="loader">
            <div className="spinner"></div><p>Loanding</p>
        </div>}
        <div id="write-review"> 
            <button id="write-review-btn" onClick={() => login ? setCreateReview(true) : router.push('/auth/login')}><img src="/icons/Review.svg" alt="" />Write review</button>
        </div>
        <div id="rewievs"> 
            {commentsList.map((r:any,index:number) => {
                const reviewCount = commentsList.reduce((acc:any, curr:any) => {
                    const count = commentsList.filter(( review:any) => review.creator.nickname === r.creator.nickname ).length 
                    return acc + count;
                }, 0) 
                return ( 
                    <div key={index} className='review'>
                        <div id="review-creator">
                            <img src="/icons/BxsUserCircleB.svg" alt="" />
                            <div id="author">
                                <div id="author"> <p id="review-author">{r.creator.name + " " + r.creator.surname}</p></div>
                                <p id="reviews-count">{reviewCount } reviews</p>
                            </div>
                        </div>
                        <div id="review-rate">
                            <StarRating value={r.comment.rate}/>
                            {id && r.creator.id == id && <div id="edit-review"> 
                                <button id="edit-review-btn" onClick={() => login ? setEditReview(r.comment) : router.push('/auth/login')}><img src="/icons/Review.svg" alt="" />Edit</button>
                            </div>}
                         </div>
                        <p>{r.comment.value}</p>
                        {r.content && (r.content.includes("data:image/") ? <img src={r.content } alt="" /> : r.content.includes("data:video/") ? <video src={r.content} controls/> : <img src={r.content} alt="" />)} 
                    </div>
                )
            })}
        </div>

    </div>
    )
}