import { useState, startTransition,useEffect  } from 'react';   
import { useRouter } from 'next/navigation'; 
import { useLogin } from '../contexts/Login'; 
import { ReviewModal } from './ReviewModal';
import io from 'socket.io-client';
export function GameForm( { }: any) {   
  const [gameBoard, setGameBoard] = useState<any[]>([])   
  const [players, setPlayers] = useState<any[]>([]);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'started'>('waiting'); 
  const [error, setError] = useState('');
  const {token,roomCode,loaded,login}:any = useLogin() 
  const router = useRouter(); 
  const [roomC, setRoomC] = useState<any>(null);
  const [myTurn, setMyTurn] = useState<boolean>(false);
  const [buyBusiness, setBuyBusiness] = useState<any>({buy:false, business: null});
  const [money, setMoney] = useState<number>(0);
  const [property, setProperty] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [ turnDistance, setTurnDistance] = useState<number>(0);
  const [winner, setWinner] = useState<any>(null);
  useEffect(() => {
    if (loaded) { 
      console.log("error ");
      if (!token || !roomCode) { 
        console.log("error "); 
        router.push('/');
        return;
      }
      console.log("error ");
      setRoomC(roomCode)
      console.log(roomCode);
      
      const socketInstance = io('http://localhost:3001', {
            auth: { token },
            transports: ['websocket', 'polling']
      }); 
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
      socketInstance.on('game-started', (data: any) => {
        setGameStatus(data.gameStatus) 
        setGameBoard(data.gameBoard)
        const player = data.players.filter((p:any) => p.nickname == login)
        console.log(data.players,login);
        
        if (data.turn == player[0].id) {  
          setMyTurn(true)
        }
        else{
          setMyTurn(false)
        }
      })  
      socketInstance.on('end-turn', (data: any) => { 
        const player = data.players.filter((p:any) => p.nickname == login)
        setPlayers(data.players)
        setMoney(player[0].money)
        setProperty(player[0].property) 
        if (data.turn == player[0].id) {  
          setMyTurn(true)
        }
        else{
          setMyTurn(false)
        } 
      })
      socketInstance.on('finish', (data: any) => { 
        const player = data.players.filter((p:any) => p.nickname == login) 
        setGameStatus(data.gameStatus)
        if (data.winner == player[0].id) {  
          setWinner(true)
        }  
      })
      socketInstance.on('businessBuy', (data: any) => {  
        const player = players.filter((p:any) => p.id == data.player.id) 
        if (player) {
          setBuyBusiness({buy:true,business:data.business})
        }
      })
  } 
  
  },[ loaded]) 
  console.log(players);
  console.log(gameStatus);
  console.log(gameBoard)
  const throwBones = () => {
    socket.emit('throwBones', { token:token,room:roomCode }, (response : any) => {
      if (response.success) {
        setTurnDistance(response.distance ) 
      } 
    })
  } 
  return (    
    <div id="backgr-game">  
        {gameStatus != "started" &&  
        <div className ="game-wrapper">
          <div id="players">
            <p id="players-tag">Players</p>
            <div id="player-list">
              {players.map(p => {
                return (
                  <div key={p.id} id="player">
                    <img src="/UserCircle.svg" alt="" /><p>{p.nickname}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <div id="content-game">
            <div id="info">
              <p id="monopoly">Waiting</p>
              <p id="invite">Invite your friend to start game</p> 
            </div>
          </div> 
          <div id="room-code">
            <p>Room code: {roomCode}</p>
          </div>
        </div>
        }
        { gameStatus == "started" && 
        <div className ="game-wrapper">
          <div id="players">
            <p id="players-tag">Players</p>
            <div id="player-list">
              {players.map(p => {
                return (
                  <div key={p.id} id="player-game">
                    <div id="player">
                      <img src="/UserCircle.svg" alt="" /><p>{p.nickname}</p>
                    </div>
                    <p>{p.money}</p>
                  </div> 
                )
              })}
            </div>
          </div>
          <div id="content-game"> 
            <div id="board">
              {gameBoard && players.some(p => p.nickname == login) && gameBoard.map((b:any,index1:number) => {
                return (
                  <div key={index1} id="board-part" >
                     {b.map((n:any,index:number) => {
                      const playersP = players.filter(p => p.position.x == index1 && p.position.y == index )
                      console.log(playersP);
                      
                      const player = players.find(p => p.nickname == login)
                      const inMyProperty = gameBoard[index1][index] && gameBoard[index1][index].name? player.property.find(pr => pr.name == gameBoard[index1][index].name) : null
                      const inOtherProperty = gameBoard[index1][index] && gameBoard[index1][index].name ? players.filter(p => p.nickname != login).find(p => p.property.some(pr => pr.name == gameBoard[index1][index].name)) : null
                      return (<div key={index} id="board-element" style={{backgroundColor: n ? inMyProperty ? "blue" : inOtherProperty ? "red" : "snow" : "black", border: n ? "grey solid 1px" : "none"}}>
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
                            <p>{inMyProperty && inMyProperty.status == "in property" ? inMyProperty.profit : inOtherProperty && inOtherProperty.status == "in property" ? inOtherProperty.profit : gameBoard[index1][index].price}</p>
                        </div>}
                        {gameBoard[index1][index] && gameBoard[index1][index].type == "r" && 
                          <div>
                            <img src="/b-logos/question.svg" alt="" /> 
                          </div> }
                        {playersP.length > 0 &&
                          <div id="players-pos">
                            {playersP.length == 1 ? <img src="/Usercircle.svg" alt="" /> : <div id="player-images"><img src="/Usercircle.svg" alt="" /><img src="/Usercircle.svg" alt="" /></div> }
                          </div>
                        }
                      </div>)
                     })}
                  </div>
                )
              })}
            </div>
          </div> 
          <div id="room-code">
            <p>Room code: {roomCode}</p>
          </div>
          {myTurn && <div id="throw">
              <button id="throw-bones" onClick={() => throwBones()}></button>
          </div>}
        </div> 
        }
        {buyBusiness.buy && <ReviewModal business={buyBusiness.business} onClose={() => setBuyBusiness({buy:false,business:null})} socket={socket}/>}
    </div>
  )
}