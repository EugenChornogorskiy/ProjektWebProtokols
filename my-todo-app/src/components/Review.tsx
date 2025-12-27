import { useLogin } from "../contexts/Login"
export function Review( { business, onClose, socket} : any) {   
  const {token,roomCode,loaded,login}:any = useLogin() 
  const buy = () => {
    socket.emit('buyDecision', { token:token,room:roomCode, decision: true, business: business }, (response : any) => { 
    })
    onClose()
  }
  const noBuy = () => {
    socket.emit('buyDecision', { token:token,room:roomCode, decision: false, business: business }, (response : any) => { 
    })
    onClose()
  }
  return (  
  <div id="review-form">   
    <div id="review-btns">
      <button type='button' className="cencel-review" onClick={() => noBuy() }>Cencel</button> 
      <button type='button' className="cencel-review" onClick={() => buy()}>Buy</button> 
    </div>  
  </div> )
}