import { useState, startTransition,useEffect,useRef  } from 'react';   
import { useRouter } from 'next/navigation'; 
import { useLogin } from '../contexts/Login';  
import mqtt from 'mqtt'; 
const axios = require('axios').default;
export function SpectateGameForm( { roomCode,onClose,addToast }: any) {    
  const [players, setPlayers] = useState<any[]>([]); 
  const {token, loaded, login }:any = useLogin() 
  const router = useRouter();   
  const [ trade, setTrade] = useState<any>(null); 
  const [buyBusiness, setBuyBusiness] = useState<any>({buy:false, business: null});    
  const [winner, setWinner] = useState<any>(null);
  const [chat,setChat] = useState<string[]>([]);   
  const [gameBoard, setGameBoard] = useState<any[]>([])  
  const mqttClient = useRef<any>(null); 
  useEffect(() => {
    if (loaded) {  
      if (!token ) {  
        router.push('/');
        return;
      }   
      const Client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
        clientId: `monopoly-${roomCode + login}-spectator`,
        clean: true
      });
      mqttClient.current = Client   
      const onConnect = () => {
        mqttClient.current.subscribe(`game/${roomCode}/events`)
        console.log('Observer subscribed')
        axios.get(`https://localhost:3000/api/game/${roomCode}`,{
          headers: {Authorization: token }
        } )
        .then(function (response:any) {  
          console.log(response);
          setPlayers(response.data.players) 
          setGameBoard(JSON.parse(response.data.board) )
        })
        .catch(function (error:any) {
          console.log(error ); 
        });
      }
      const onMessageMqtt = (topic: string, data: any) => {  
        const dane = JSON.parse(data.toString())
        if (dane.type == 'THROW_BONES') {
          console.log(dane); 
          setPlayers(dane.players)  
          addToast("info",dane.messageSpec)
          setChat(prev => [...prev, dane.messageSpec])
        } 
        if (dane.type == 'BUY_BUSINESS') {
          console.log(dane);
          setPlayers(dane.players)
          addToast("info",dane.messageSpec) 
          setChat(prev => [...prev, dane.messageSpec]);
        } 
        if (dane.type == 'CHAT-MESSAGE') { 
          console.log(dane);
          setChat(prev => [...prev, dane.messageSpec]);
        } 
        if (dane.type == 'TRADE-DONE') {
          console.log(dane);
          setPlayers(dane.players)  
          addToast("info",dane.messageSpec)
          setChat(prev => [...prev, dane.messageSpec])
        }  
        if (dane.type == 'GAME_FINISHED') {  
          console.log(dane);
          setWinner(dane.winner) 
        } 
      } 
      mqttClient.current.on('connect', onConnect)
      mqttClient.current.on('message', onMessageMqtt)
    return () => {  
      mqttClient.current.off('connect', onConnect)
      mqttClient.current.off('message', onMessageMqtt)
      mqttClient.current.end()
    }
  }  
  },[ loaded])   
  console.log(chat);
  
  return (    
    <div id="backgr-game">  
        {winner && <div id="finish">
          <p id="monopoly">Winner: {players.find(p => p.id == winner.id).nickname}</p>
          <button onClick={() => onClose()}>Confirm</button>
        </div>} 
        { !winner  && 
        <div className ="game-wrapper">
          <div id="players">
            <p id="players-tag">Players</p>
            <div id="player-list">
              {players.map(p => {
                return (
                  <div key={p.id} id="player-game" onClick={() => p.id != players[0].id ? !buyBusiness.buy ? setTrade(p ) : setTrade(trade) : setTrade(trade)}>
                    <div key={p.id} id="player">
                      <img src={p.id == players[0].id ? "/UserCircleB.svg" : "/UserCircleR.svg"} alt="" /><p>{p.nickname}</p>
                    </div>
                    <p className="money" style={{marginLeft:"10px"}}>{p.money} $</p>
                  </div> 
                )
              })}
            </div>
          </div>
          <div id="content-game"> 
            <div id="board">
              {gameBoard.length > 0 && gameBoard.map((b:any,index1:number) => {
                return (
                  <div key={index1} id="board-part" >
                     {b.map((n:any,index:number) => {
                      const playersP = players.filter(p => p.position.x == index1 && p.position.y == index ) 
                      
                      const player = players.find(p => p.nickname == players[0].nickname)
                      const inMyProperty = gameBoard[index1][index] && gameBoard[index1][index].name? player.property.find((pr:any) => pr.name == gameBoard[index1][index].name) : null 
                      const OtherPlayer = gameBoard[index1][index] && gameBoard[index1][index].name ? players.filter(p => p.nickname != players[0].nickname).find(p => p.property.some((pr:any) => pr.name == gameBoard[index1][index].name)) : null
                      const inOtherProperty = OtherPlayer ? OtherPlayer.property.find((pr:any) => pr.name == gameBoard[index1][index].name) : null
                      return (<div key={index} id="board-element" style={{backgroundColor: n ? inMyProperty ? "rgba(69, 125, 199, 0.68)" : inOtherProperty ? "rgba(192, 59, 59, 0.61)" : "snow" : "rgba(77, 77, 77, 1)", border: n ? "grey solid 1px" : "none"}}>
                        {gameBoard[index1][index] && gameBoard[index1][index].type == "b" && <div id="elem-info">
                          <img id="b-logo" src={`/b-logos/${gameBoard[index1][index].name == 'Facebook' ? "Facebook.svg" : 
                            gameBoard[index1][index].name == 'Instagram' ? "Instagram.svg" : 
                            gameBoard[index1][index].name == 'Telegram' ? "Telegram.svg" : 
                            gameBoard[index1][index].name == 'Chanel' ? "chanel.png" : 
                            gameBoard[index1][index].name == 'Dior' ? "dior.png" : 
                            gameBoard[index1][index].name == 'Gucci' ? "gucci.png" : 
                            gameBoard[index1][index].name == 'Ryanair' ? "RYA.svg" : 
                            gameBoard[index1][index].name == 'Wizz Air' ? "WIZZ.svg" : 
                            gameBoard[index1][index].name == 'Lufthansa' ? "LHA.svg" : 
                            gameBoard[index1][index].name == 'Hilton' ? "hilton.png" : 
                            gameBoard[index1][index].name == 'Marriott' ? "marriott.png" : 
                            gameBoard[index1][index].name == 'Sheraton' ? "sheraton.png" : 
                            gameBoard[index1][index].name == 'Tesla' ? "tesla.png" : 
                            gameBoard[index1][index].name == 'Toyota' ? "toyota.png" : 
                            gameBoard[index1][index].name == 'BMW' ? "bmw.png" : 
                            gameBoard[index1][index].name == 'Apple' ? "apple.png" : 
                            gameBoard[index1][index].name == 'Samsung' ? "samsung.png" : 
                            gameBoard[index1][index].name == 'Microsoft' ? "microsoft.png" : 
                            gameBoard[index1][index].name == 'Walmart' ? "walmart.svg" : 
                            gameBoard[index1][index].name == 'Amazon' ? "amazon.png" : 
                            gameBoard[index1][index].name == 'eBay' ? "EBAY.svg" : 
                            gameBoard[index1][index].name == 'Coca-Cola' ? "coca-cola.png" : 
                            gameBoard[index1][index].name == 'Pepsi' ? "pepsi.png" : 
                            "starbucks.png" }`} alt="" />
                            <p className="money">{inMyProperty && inMyProperty.status == "in property" ? inMyProperty.profit : inOtherProperty && inOtherProperty.status == "in property" ? inOtherProperty.profit : gameBoard[index1][index].price}</p>
                        </div>}
                        {gameBoard[index1][index] && gameBoard[index1][index].type == "r" && 
                          <div id="elem-info">
                            <img src="/b-logos/question.svg" alt="" /> 
                          </div> }
                        {playersP.length > 0 &&
                          <div id="players-pos">
                            {(playersP.length == 1 && playersP[0].id == player.id) ? <img src="/player.png" alt="" /> : (playersP.length == 1 && playersP[0].id != player.id) ? <img src="/enemy.png" alt="" /> : playersP.length == 2 ? <div id="player-images"><img src="/enemy.png" alt="" /><img src="/player.png" alt="" /></div> : "" }
                          </div>
                        }
                      </div>)
                     })}
                  </div>
                )
              })} 
              <div id="chat">
                {chat.map((m:string,index:number) => {
                  const parts = m.split(" ") 
                  return (
                    <div key={index}> <p>{parts.map((p,index) => {
                      return p == players[0].nickname ? <span key={index}style={{color:"blue"}}>{p} </span> : players.filter(pl => pl.id != players[0].id).some(pl => pl.nickname == p) ? <span key={index} style={{color:"red"}}>{p} </span> : <span key={index}>{p} </span> 
                    })}</p></div>
                  )
                }) } 
              </div>
            </div>
          </div> 
          <div id="room-code">
            <p>Room code: {roomCode}</p> 
          </div> 
        </div> 
        } 
      </div>
  )
}  