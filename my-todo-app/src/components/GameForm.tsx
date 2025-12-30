import { useState, startTransition,useEffect,useRef  } from 'react';   
import { useRouter } from 'next/navigation'; 
import { useLogin } from '../contexts/Login'; 
import { BusinessBuyModal } from './BusinessBuyModal';
import { TradeModal } from './TradeModal';
import { TradeRequestModal } from './TradeRequestModal';
import mqtt from 'mqtt';
import io from 'socket.io-client';
const axios = require('axios').default;
export function GameForm( { setGameBoard, gameBoard , addToast,setGameStarted }: any) {    
  const [players, setPlayers] = useState<any[]>([]);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'started'>('waiting'); 
  const [error, setError] = useState('');
  const {token,roomCode,loaded,login,id,addRoom}:any = useLogin() 
  const router = useRouter(); 
  const [roomC, setRoomC] = useState<any>(null);
  const [myTurn, setMyTurn] = useState<boolean>(false);
  const [ trade, setTrade] = useState<any>(null);
  const [tradeRequest, setTradeRequest] = useState<any>(null);
  const [buyBusiness, setBuyBusiness] = useState<any>({buy:false, business: null});  
  const [socket, setSocket] = useState<any>(null);
  const [ turnDistance, setTurnDistance] = useState<any>(null);
  const [winner, setWinner] = useState<any>(null);
  const [chat,setChat] = useState<string[]>([]);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [showAnimation, setShowAnimation] = useState<boolean>(false) 
  const [roomChange, setRoomChange] = useState<string>('')
  const [currentFilter, setCurrentFilter] = useState("Web socket")   
  const mqttClient = useRef<any>(null);
  useEffect(() => {
    if (loaded && roomCode) {
      axios.get(`http://localhost:3000/api/room/${roomCode}`,{
        headers: { Authorization:  token }
      })
      .then(function (response:any) { 
        setRoomChange(response.data.name)
      })
      .catch(function (error:any) {
        console.log(error );  
      });
    } 
  },[])
  useEffect(() => {
    if (loaded) {  
      if (!token || !roomCode ) {  
        router.push('/');
        return;
      } 
      setRoomC(roomCode) 
      
      const socketInstance = io('https://localhost:3001', {
            auth: { token },
            transports: ['websocket', 'polling']
      }); 
      const Client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
        clientId: `monopoly-${roomCode + login}-chat`,
        clean: true
      });
      mqttClient.current = Client 
      setSocket(socketInstance)
      socketInstance.on('connect', () => {  

        socketInstance.emit('join-room', { roomCode }, (response: any) => {
          if (response.success) {
            setPlayers(response.players) 
            setGameStatus(response.gameStatus) 
          } else { 
            console.log("error ",response.error); 
            setError(response.error || 'Cannot join room') 
            setTimeout(() => router.push('/'), 2000) 
          }
        }) 
        }) 
      socketInstance.on('player-joined', (data: any) => {
        setPlayers(data.players) 
        setGameStatus(data.gameStatus) 
      }) 
      socketInstance.on('player-left', (data: any) => {
        setPlayers(prev => prev.filter(p => p.id !== data.playerId)) 
      })  
      socketInstance.on('finish', (data: any) => {  
        setGameStatus(data.gameStatus) 
        setWinner(data.winner) 
      }) 
      const onMessage = (data:any) => { 
        setChat(prev => [...prev, data.message])
      }
      const onGameStarted = (data:any) => {
        setGameStatus(data.gameStatus) 
        setGameBoard(data.gameBoard)
        setPlayers(data.players)
        const player = data.players.filter((p:any) => p.nickname == login)
        console.log(data.players,login); 
        if (data.turn == player[0].id) {  
          setMyTurn(true)
        }
        else{
          setMyTurn(false)
        }
      }
      const onBusinessBuy = (data:any) => {
        console.log('businessBuy event:', data);
        console.log(id, data.player.id);
        if (id == data.player.id) {
          console.log("yes"); 
          setBuyBusiness({
            buy: true,
            business: data.business
          });
        }
      }
      const onTrade = (data:any) => {
        console.log('trade event:', data,data.recepientId, id);
        console.log(data.recepientId == id);
        
        if (data.recepientId == id) {
          setTradeRequest(data);
        }
      }
      const onEndTurn = (data:any) => {
        const player = data.players.filter((p:any) => p.nickname == login)
        setPlayers(data.players)  
        addToast("info",data.message)
        setChat(prev => [...prev, data.message])
        if (data.turn == player[0].id) {  
          setMyTurn(true)
        }
        else{
          setMyTurn(false)
        } 
      }
      const onTradeDone = (data:any) => {
        setPlayers(data.players)
        addToast("info",data.message) 
        setChat(prev => [...prev, data.message]);
      }
      const onConnect = () => {
        mqttClient.current.subscribe(`game/${roomCode}/chat`)
        console.log('Observer subscribed')
      }
      const onMessageMqtt = (topic: string, message: Buffer) => {
        setChat(prev => [...prev, JSON.parse(message.toString())])
      }

      socketInstance.on('chat-message', onMessage)
      socketInstance.on('game-started', onGameStarted)
      socketInstance.on('businessBuy', onBusinessBuy)
      socketInstance.on('trade', onTrade)
      socketInstance.on('end-turn', onEndTurn)
      socketInstance.on('tradeDone', onTradeDone)
      mqttClient.current.on('connect', onConnect)
      mqttClient.current.on('message', onMessageMqtt)
    return () => {
      socketInstance.off('chat-message', onMessage)
      socketInstance.off('businessBuy', onBusinessBuy)
      socketInstance.off('trade', onTrade)
      socketInstance.off('end-turn', onEndTurn)
      socketInstance.off('tradeDone', onTradeDone)
      socketInstance.off('game-started', onGameStarted)
      socketInstance.disconnect()
      mqttClient.current.off('connect', onConnect)
      mqttClient.current.off('message', onMessageMqtt)
      mqttClient.current.end()
    }
  }  
  },[ loaded])  
  const throwBones = () => {
    setMyTurn(false)
    socket.emit('throwBones', { token:token,room:roomCode }, (response : any) => {
      if (response.success) {
        setTurnDistance(response.distance); 
        setShowAnimation(true);
        setTimeout(() => {
          setShowAnimation(false);
          setTurnDistance(null);
        }, 2000);
      } 
    })
  } 
  const sendMessage = () => {
    if (!chatMessage) return
    socket.emit('chat-message', {
      room: roomCode,
      message: `${login + " " + chatMessage}`,
    })
    setChatMessage('')
  }
  const sendMessageMqtt = () => {
    if (!chatMessage) return 
    mqttClient.current.publish( `game/${roomCode}/chat`,
      JSON.stringify(   login + " " +chatMessage  )
    );
    setChatMessage('')
  }
  const changeRoom = () => {
      axios.put(`https://localhost:3000/api/room/${roomCode}`,{
        token: token,
        name: roomChange
      } )
      .then(function (response:any) { 
        console.log(response.data);
        console.log(response);
        addToast("info","Name changed")  
        setRoomChange(response.data.name)
      })
      .catch(function (error:any) {
        console.log(error ); 
      });
  }
  const buy = () => {
    socket.emit('buyDecision', { token:token,room:roomCode, decision: true, business: buyBusiness.business }, (response : any) => { 
    }) 
    setBuyBusiness({buy:false, business: null})
  }
  const noBuy = () => {
    socket.emit('buyDecision', { token:token,room:roomCode, decision: false, business: buyBusiness.business }, (response : any) => { 
    }) 
    setBuyBusiness({buy:false, business: null})
  }
  return (    
    <div id="backgr-game"> 
        {showAnimation && turnDistance && (
          <DiceAnimation distance={turnDistance} isAnimating={showAnimation} />
        )}
        {winner && <div id="finish">
          <p id="monopoly">Winner: {players.find(p => p.id == winner.id).nickname}</p>
          <button onClick={() => {setGameStarted(false),addRoom('')}}>Confirm</button>
        </div>}
        {!winner && gameStatus != "started" &&  
        <div className ="game-wrapper">
          <div id="players">
            <p id="players-tag">Players</p>
            <div id="player-list">
              {players.map(p => {
                return (
                  <div key={p.id} id="player">
                    <img src={p.id == id ? "/UserCircleB.svg" : "/UserCircleR.svg"} alt="" /><p>{p.nickname}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <div id="game-form">
            <div id="info">
              <p id="monopoly">Waiting</p>
              <p id="invite">Invite your friend to start game</p> 
            </div> 
          </div> 
          <div id="room-code">
            <div style={{display: "flex", gap:"10px"}}><p>Room code:</p><p>{roomCode}</p></div>
            <div> 
              <div style={{display:"flex", gap:"10px"}}>
                <p>Room name: </p>
                <input style={{width: "125px"}} type="text" value={roomChange} onChange={(e) => setRoomChange(e.target.value)}/>
              </div>
              <button id="change-room-btn" onClick={() => changeRoom()}>Apply</button>
            </div> 
          </div>
        </div>
        }
        { !winner && gameStatus == "started"  && 
        <div className ="game-wrapper">
          <div id="players">
            <p id="players-tag">Players</p>
            <div id="player-list">
              {players.map(p => {
                return (
                  <div key={p.id} id="player-game" onClick={() => p.id != id ? !buyBusiness.buy ? setTrade(p ) : setTrade(trade) : setTrade(trade)}>
                    <div key={p.id} id="player">
                      <img src={p.id == id ? "/UserCircleB.svg" : "/UserCircleR.svg"} alt="" /><p>{p.nickname}</p>
                    </div>
                    <p className="money" style={{marginLeft:"10px"}}>{p.money} $</p>
                  </div> 
                )
              })}
            </div>
          </div>
          <div id="content-game"> 
            <div id="board">
              {gameBoard &&  players.some(p => p.nickname == login) && gameBoard.map((b:any,index1:number) => {
                return (
                  <div key={index1} id="board-part" >
                     {b.map((n:any,index:number) => {
                      const playersP = players.filter(p => p.position.x == index1 && p.position.y == index ) 
                      
                      const player = players.find(p => p.nickname == login)
                      const inMyProperty = gameBoard[index1][index] && gameBoard[index1][index].name? player.property.find((pr:any) => pr.name == gameBoard[index1][index].name) : null 
                      const OtherPlayer = gameBoard[index1][index] && gameBoard[index1][index].name ? players.filter(p => p.nickname != login).find(p => p.property.some((pr:any) => pr.name == gameBoard[index1][index].name)) : null
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
              {buyBusiness.buy && <div id="business-buy">
                <p id="business-name">{buyBusiness.business.name}</p>
                <p id="want-buy">Do you want to buy?</p>
                <div id="buy-btns">
                  <button type='button' className="cencel-review" onClick={() => noBuy()}>Cencel</button> 
                  <button type='button' className="cencel-review" onClick={() => buy()}>Buy</button> 
                </div>
              </div>}
              <div id="chat">
                {chat.map((m:string,index:number) => {
                  const parts = m.split(" ") 
                  return (
                    <div key={index}> <p>{parts.map((p,index) => {
                      return p == login ? <span key={index}style={{color:"blue"}}>{p} </span> : players.filter(pl => pl.id != id).some(pl => pl.nickname == p) ? <span key={index} style={{color:"red"}}>{p} </span> : <span key={index}>{p} </span> 
                    })}</p></div>
                  )
                }) }
                <div id="chat-wrapper">
                  <input type="text" id="chat-input" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}/>
                  <button id="chat-btn" onClick={() => currentFilter == "Web socket" ? sendMessage() : sendMessageMqtt()}>Send</button>
                </div>
              </div>
            </div>
          </div> 
          <div id="room-code">
            <p>Room code: {roomCode}</p> 
          </div>
          {myTurn && <div id="throw">
              <button id="throw-bones" onClick={() => throwBones()}>throw-bones</button>
          </div>}
        </div> 
        }
       <div id="choose-type">
          <p className="type" style={{ backgroundColor: currentFilter == "Web socket" ? "#be1f24ff" : "#D9232A"}} onClick={() => setCurrentFilter("Web socket") }>Web socket</p>
          <p className="type" style={{ backgroundColor: currentFilter == "Mqtt" ? "#be1f24ff" : "#D9232A"}}onClick={() => setCurrentFilter("Mqtt") }>Mqtt</p> 
        </div>
        {trade && <TradeModal recepient={trade} player={players.find(p => p.id == id)} onClose={() => setTrade(null)} socket={socket}/>}
        {tradeRequest && <TradeRequestModal info={tradeRequest} players={players} onClose={() => setTradeRequest(null)} socket={socket}/>}
    </div>
  )
} 
const DiceAnimation = ({ distance, isAnimating }: { distance: number, isAnimating: boolean }) => {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  
  useEffect(() => {
    if (isAnimating) { 
      const interval = setInterval(() => {
        setDice1(Math.floor(Math.random() * 6) + 1);
        setDice2(Math.floor(Math.random() * 6) + 1);
      }, 100);
      
      setTimeout(() => {
        clearInterval(interval); 
        const combinations = [
          [1, distance - 1], [distance - 1, 1],
          [2, distance - 2], [distance - 2, 2],
          [3, distance - 3], [distance - 3, 3],
          [4, distance - 4], [distance - 4, 4],
          [5, distance - 5], [distance - 5, 5],
          [6, distance - 6], [distance - 6, 6]
        ].filter(([a, b]) => a >= 1 && a <= 6 && b >= 1 && b <= 6);
        
        const randomCombo = combinations[Math.floor(Math.random() * combinations.length)] || [1, 1];
        setDice1(randomCombo[0]);
        setDice2(randomCombo[1]);
      }, 1000);
    }
  }, [isAnimating, distance]);
  
  if (!isAnimating) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.8)',
      padding: '20px',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="dice" style={{
          width: '50px',
          height: '50px',
          background: 'white',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          animation: 'diceRoll 0.5s infinite'
        }}>
          {dice1}
        </div>
        <div className="dice" style={{
          width: '50px',
          height: '50px',
          background: 'white',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          animation: 'diceRoll 0.5s infinite'
        }}>
          {dice2}
        </div>
      </div>
      <div style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        animation: 'numberFlip 1s'
      }}>
        Total: {distance}
      </div>
    </div>
  );
};