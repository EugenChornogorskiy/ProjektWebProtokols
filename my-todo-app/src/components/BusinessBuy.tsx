import { useLogin } from "../contexts/Login"
export function BusinessBuy( { business, onClose, socket} : any) {   
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
  <div id="business-buy-form">  
    <p id="business-group">{business.group}</p>
    <p id="business-name">{business.name}</p> 
    <div>
      <div>
        <p>Price:</p>
        <p>{business.price}</p>
      </div>
      <div>
        <p>Profit:</p>
        <p>{business.profit}</p>
      </div>
    </div>
    <div id="business-buy-btns">
      <button type='button' className="cencel-review" onClick={() => noBuy() }>Cencel</button> 
      <button type='button' className="cencel-review" onClick={() => buy()}>Buy</button> 
    </div>  
  </div> )
}