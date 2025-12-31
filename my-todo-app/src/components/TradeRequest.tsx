import { useEffect,useState,startTransition } from "react"
import { useLogin } from "../contexts/Login"
import { useFormik } from 'formik'; 
import { tradeValidationSchema } from '@/src/utils/validation';  
export function TradeRequest( { info,players,onClose, socket} : any) {   
  const {token, login,loaded,id,roomCode}:any = useLogin()  
  const [error, setError] = useState<any>(null)   
  const [playerSelected, setPlayerSelected] = useState<any[]>([])   
  const [recepientSelected, setRecepientSelected] = useState<any[]>([]) 
  const player = players.find((p:any) => p.id == info.recepientId)
  const recepient = players.find((p:any) => p.id == info.senderId)
  const Close = () => {
    socket.emit('tradeDecision', { tradeId: info.tradeId, senderId: info.senderId , recepientId: info.recepientId, businessSell: info.businessSell, businessBuy: info.businessBuy, room: roomCode, priceGive: info.priceGive, priceGet: info.priceGet,decision: false }, (response : any) => { 

    })
    onClose()
  }
  const Accept = () => {
    socket.emit('tradeDecision', { tradeId: info.tradeId, senderId: info.senderId , recepientId: info.recepientId, businessSell: info.businessSell, businessBuy: info.businessBuy, room: roomCode, priceGive: info.priceGive, priceGet: info.priceGet,decision: true }, (response : any) => { 

    })
    onClose()
  }
  return (  
    
  <div id="trade-form">   
      <p id="business-name">Trade</p>  
      <div id="trade">
        <div className="trade-info" style={{borderRight:"1px solid grey"}}>
          <div  id="player-game" >
            <div id="player">
              <img src="/BxsUserCircleB.svg" alt="" /><p className = "nick"  style={{color:"rgb(0, 110, 255)"}}>{player.nickname}</p>
            </div> 
          </div> 
          <div className="trade-part">
            <div style={{width:"100%",height:"60px"}}>
              <div className='trade-input'> <img src="/dolar2.png" alt="" /><p>{info.priceGet}</p></div> 
            </div>
            <div className="player-property"> 
              {info.businessBuy.map((p:any) => {
                return (
                  <div key={p.name} className="property" >
                    <img  src={`/b-logos/${p.name == 'Facebook' ? "Facebook.svg" : 
                      p.name == 'Instagram' ? "Instagram.svg" : 
                      p.name == 'Telegram' ? "Telegram.svg" : 
                      p.name == 'Chanel' ? "chanel.png" : 
                      p.name == 'Dior' ? "dior.png" : 
                      p.name == 'Gucci' ? "gucci.png" : 
                      p.name == 'Ryanair' ? "RYA.svg" : 
                      p.name == 'Wizz Air' ? "WIZZ.svg" : 
                      p.name == 'Lufthansa' ? "LHA.svg" : 
                      p.name == 'Hilton' ? "hilton.png" : 
                      p.name == 'Marriott' ? "marriott.png" : 
                      p.name == 'Sheraton' ? "sheraton.png" : 
                      p.name == 'Tesla' ? "tesla.png" : 
                      p.name == 'Toyota' ? "toyota.png" : 
                      p.name == 'BMW' ? "bmw.png" : 
                      p.name == 'Apple' ? "apple.png" : 
                      p.name == 'Samsung' ? "samsung.png" : 
                      p.name == 'Microsoft' ? "microsoft.png" : 
                      p.name == 'Walmart' ? "walmart.svg" : 
                      p.name == 'Amazon' ? "amazon.png" : 
                      p.name == 'eBay' ? "EBAY.svg" : 
                      p.name == 'Coca-Cola' ? "coca-cola.png" : 
                      p.name == 'Pepsi' ? "pepsi.png" : 
                      "starbucks.png" }`} alt="" />
                    <p  className="trade-money">{p.profit}$</p>
                    <button type="button" className="check-btn" onClick={() => playerSelected.some(ps => ps.name == p.name) ? setPlayerSelected(playerSelected .filter(rp => rp.name != p.name)) : setPlayerSelected([...playerSelected, p])}>{playerSelected.some(ps => ps.name == p.name) ? "✔" : "\u00A0"}</button>
                  </div>
                )
              })} 
            </div>  
            </div>
        </div> 
        <div className="trade-info">
          <div  id="player-game" >
            <div id="player">
              <img src="/BxsUserCircleB.svg" alt="" /><p className = "nick" style={{color:"rgba(199, 19, 19, 1)"}}>{recepient.nickname}</p>
            </div> 
          </div> 
          <div className="trade-part"> 
            <div style={{width:"100%",height:"60px"}}>
              <div className='trade-input'><img src="/dolar2.png" alt="" />  <p>{info.priceGive}</p></div>
               
            </div>
            <div className="player-property"> 
              {info.businessSell.map((p:any) => {
                return (
                  <div key={p.name} className="property"  >
                    <img  src={`/b-logos/${p.name == 'Facebook' ? "Facebook.svg" : 
                      p.name == 'Instagram' ? "Instagram.svg" : 
                      p.name == 'Telegram' ? "Telegram.svg" : 
                      p.name == 'Chanel' ? "chanel.png" : 
                      p.name == 'Dior' ? "dior.png" : 
                      p.name == 'Gucci' ? "gucci.png" : 
                      p.name == 'Ryanair' ? "RYA.svg" : 
                      p.name == 'Wizz Air' ? "WIZZ.svg" : 
                      p.name == 'Lufthansa' ? "LHA.svg" : 
                      p.name == 'Hilton' ? "hilton.png" : 
                      p.name == 'Marriott' ? "marriott.png" : 
                      p.name == 'Sheraton' ? "sheraton.png" : 
                      p.name == 'Tesla' ? "tesla.png" : 
                      p.name == 'Toyota' ? "toyota.png" : 
                      p.name == 'BMW' ? "bmw.png" : 
                      p.name == 'Apple' ? "apple.png" : 
                      p.name == 'Samsung' ? "samsung.png" : 
                      p.name == 'Microsoft' ? "microsoft.png" : 
                      p.name == 'Walmart' ? "walmart.svg" : 
                      p.name == 'Amazon' ? "amazon.png" : 
                      p.name == 'eBay' ? "EBAY.svg" : 
                      p.name == 'Coca-Cola' ? "coca-cola.png" : 
                      p.name == 'Pepsi' ? "pepsi.png" : 
                      "starbucks.png" }`} alt="" />
                    <p  className="trade-money">{p.profit}$</p>
                   </div>
                )
              })}
            </div>
          </div>
        </div>
      </div> 
      {error && <div>
        <p>{error}</p>
      </div>} 
      <div id="trade-btns">
        <div style={{width:"75px"}}>{ playerSelected.reduce((acc,curr) => {
          return acc + curr.profit
        },0) + info.priceGet}$</div>
        <div id="total-amount">
          <p>Total amount</p>
          <button id="total-btn" className="cencel-review" onClick={() => Accept()}>Accept</button> 
        </div>
        <div style={{width:"75px"}}>{ recepientSelected.reduce((acc,curr) => {
          return acc + curr.profit
        },0) + info.priceGive}$</div>
        <button id="total-close" type='button' onClick={() => Close()}>✖</button> 
      </div> 
  </div> )
}