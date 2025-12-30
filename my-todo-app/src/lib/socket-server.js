
import db from '@/src/lib/database'; 
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';  
import https from 'https';
const fs = require('fs');
import { publishGameEvent } from './mqtt.js';
const server = https.createServer({
  key: fs.readFileSync('kluczBez.key'),
  cert: fs.readFileSync('certyfikat.crt'),
});
const io = new Server(server, {
  cors: {
    origin: "https://localhost:3001", 
    methods: ["GET", "POST"]
  }
});
function movePlayer(currentPos, steps, start = false) {
  const { x, y } = currentPos;
  let newX = x;
  let newY = y;
  let remainingSteps = steps;
  let passedStart = start;  
  if (y === 0 && x < 9) {
    const moveRight = Math.min(9 - x, remainingSteps);
    const oldX = newX;
    newX += moveRight; 
    remainingSteps -= moveRight;
  } 
  if (x === 9 && y < 9 && remainingSteps > 0) {
    const moveDown = Math.min(9 - y, remainingSteps);
    const oldY = newY;
    newY += moveDown; 
    remainingSteps -= moveDown;
  } 
  if (y === 9 && x > 0 && remainingSteps > 0) {
    const moveLeft = Math.min(x, remainingSteps);
    const oldX = newX;
    newX -= moveLeft; 
    remainingSteps -= moveLeft;
  } 
  if (x === 0 && y > 0 && remainingSteps > 0) {
    const moveUp = Math.min(y, remainingSteps);
    const oldY = newY;
    newY -= moveUp; 
    remainingSteps -= moveUp;
    passedStart = remainingSteps > 0 ? true : false
  } 
  if (remainingSteps > 0) {
    const result = movePlayer({ x: newX, y: newY }, remainingSteps,passedStart);
    return {
      x: result.x,
      y: result.y,
      passedStart: passedStart || result.passedStart
    };
  }
  
  return { 
    x: newX, 
    y: newY, 
    passedStart: passedStart 
  };
}
const BUSINESS_GROUPS = [
  {
    name: 'Perfume',
    businesses: [
      { name: 'Chanel', basePrice: 300, baseProfit: 200 },
      { name: 'Dior', basePrice: 400, baseProfit: 250 },
      { name: 'Gucci', basePrice: 500, baseProfit: 300 }
    ]
  },
  {
    name: 'Social medias',
    businesses: [
      { name: 'Facebook', basePrice: 700, baseProfit: 400 },
      { name: 'Instagram', basePrice: 800, baseProfit: 500 },
      { name: 'Telegram', basePrice: 1000, baseProfit: 600 }
    ]
  }, 
  {
    name: 'Air lines',
    businesses: [
      { name: 'Ryanair', basePrice: 1200, baseProfit: 800 },
      { name: 'Wizz Air', basePrice: 1400, baseProfit: 900 },
      { name: 'Lufthansa', basePrice: 1600, baseProfit: 1000 }
    ]
  },
  {
    name: 'Hotels',
    businesses: [
      { name: 'Hilton', basePrice: 1900, baseProfit: 1200 },
      { name: 'Marriott', basePrice: 2100, baseProfit: 1300 },
      { name: 'Sheraton', basePrice: 2300, baseProfit: 1400 }
    ]
  },
  {
    name: 'Cars',
    businesses: [
      { name: 'Tesla', basePrice: 2500, baseProfit: 1600 },
      { name: 'Toyota', basePrice: 2700, baseProfit: 1700 },
      { name: 'BMW', basePrice: 2900, baseProfit: 1800 }
    ]
  },
  {
    name: 'Technology',
    businesses: [
      { name: 'Apple', basePrice: 3200, baseProfit: 2000 },
      { name: 'Samsung', basePrice: 3500, baseProfit: 2100 },
      { name: 'Microsoft', basePrice: 3700, baseProfit: 2200 }
    ]
  },
  {
    name: 'Shops',
    businesses: [
      { name: 'Walmart', basePrice: 4000, baseProfit: 2400 },
      { name: 'Amazon', basePrice: 4200, baseProfit: 2500 },
      { name: 'eBay', basePrice: 4300, baseProfit: 2600 }
    ]
  },
  {
    name: 'Drinks',
    businesses: [
      { name: 'Coca-Cola', basePrice: 4500, baseProfit: 2800 },
      { name: 'Pepsi', basePrice: 4700, baseProfit: 3000 },
      { name: 'Starbucks', basePrice: 4800, baseProfit: 3200 }
    ]
  },
  {
    name: 'Fast-food',
    businesses: [
      { name: 'Mac-donalds', basePrice: 5000, baseProfit: 3400 },
      { name: 'KFC', basePrice: 5200, baseProfit: 3600 },
      { name: 'Burger King', basePrice: 5400, baseProfit: 3800 }
    ]
  }
];
function generateBusinessBoard() {
  const size = 10;
  const board = Array(size).fill().map(() => Array(size).fill(null)) 
  const edgePositions = [] 
  for (let x = 0; x < size; x++) {
    edgePositions.push({ x, y: 0 }) 
  } 
  for (let y = 1; y < size - 1; y++) {
    edgePositions.push({ x: 9, y }) 
  } 
  for (let x = size - 1; x >= 0; x--) {
    edgePositions.push({ x, y: 9 }) 
  } 
  for (let y = size - 2; y >= 1; y--) {
    edgePositions.push({ x: 0, y }) 
  } 
  board[0][0] = {
    type: 'start',
    name: 'Старт'
  };
   
  const positionsToFill = edgePositions.slice(1) 
  
  let positionIndex = 0 
   
  for (let groupIndex = 0; groupIndex < BUSINESS_GROUPS.length; groupIndex++) {
    const group = BUSINESS_GROUPS[groupIndex] 
     
    for (let businessIndex = 0; businessIndex < group.businesses.length; businessIndex++) {
      if (positionIndex >= positionsToFill.length) break 
      
      const business = group.businesses[businessIndex] 
      const pos = positionsToFill[positionIndex] 
      
      board[pos.x][pos.y] = {
        type: 'b',
        name: business.name,
        group: group.name,
        price: business.basePrice ,
        profit: business.baseProfit 
      };
      
      positionIndex++;
    }
     
    if (positionIndex < positionsToFill.length) {
      const pos = positionsToFill[positionIndex]; 
      board[pos.x][pos.y] = {
        type: 'r',
        name: 'Рандом'
      };
      
      positionIndex++;
    }
  } 
  while (positionIndex < positionsToFill.length) {
    const pos = positionsToFill[positionIndex];
    
    board[pos.x][pos.y] = {
      type: 'r',
      name: 'Рандом'
    };
    
    positionIndex++;
  }
  
  return board;
} 
function handleRandomEvent(player) {
  const random = Math.random();
  
  if (random < 0.2) { 
    const amount = player.property.reduce((acc,curr) => {
      return acc+curr.profit
    },0); 
    return {
      type: 'ec',
      message: `${player.nickname} must pay tax: -${Math.floor(amount*0.3)}$`,
      amount: -amount
    };
  } else if (random < 0.4) { 
    const amount = 500; 
    return {
      type: 'ec',
      message: `${player.nickname} must pay fine: -${amount}$`,
      amount: -amount
    };
  } else if (random < 0.5) { 
    const amount = 1000; 
    return {
      type: 'ec',
      message: `${player.nickname} need repair a car: -${amount}$`,
      amount: -amount
    };
  } else if (random < 0.6) { 
    const amount = 1000; 
    return {
      type: 'win',
      message: `${player.nickname} won a lotery: +${amount}$`,
      amount: amount
    };
  } else if (random < 0.7) { 
    const amount = 500; 
    return {
      type: 'win',
      message: `${player.nickname} earn unexpected income: +${amount}$`,
      amount: amount
    };
  } else if (random < 1) { 
    const amount = 1500; 
    return {
      type: 'ec',
      message: `${player.nickname} has Fors-major: -${amount}$`,
      amount: -amount
    };
  } 

}
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  
  try {
    const decoded = jwt.verify(token, 'secret123');
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`) 
  socket.on('join-room', (data, callback) => {
    try {
      const { roomCode } = data  
      const room = db.prepare(`
        SELECT r.* FROM rooms r
        Where room_code = ?
      `).get(roomCode); 

      const game = db.prepare(`
          SELECT * FROM game 
          Where room_id = ?
      `).get(room.id); 

      if (game && (game.player1_id != socket.userId && game.player2_id != socket.userId)){ 
        return callback({
          success: false,
          error: 'You arent a room player'
        }) 
      } 

      if (!room) { 
        return callback({
          success: false,
          error: 'Room not found'
        }) 
      }  

      const Players = db.prepare(`
        SELECT u.nickname, u.id 
        FROM game_players gp
        JOIN users u ON gp.user_id = u.id
        WHERE gp.room_id = ?
      `).all(room.id); 
 
      if ( Players.length >= 2 && !Players.some(p => p.id == socket.userId)) {
          return callback({
            success: false,
            error: 'Room is full'
          });
      }  

      if ( Players.filter(p => p.id == socket.userId).length == 0 ) {
        db.prepare(`
          INSERT INTO game_players (user_id, room_id)
          VALUES (?, ?)
        `).run(socket.userId, room.id); 
      }   

      socket.join(roomCode);
      socket.roomCode = roomCode;  
      const updatedPlayers = db.prepare(`
        SELECT u.nickname, u.id 
        FROM game_players gp
        JOIN users u ON gp.user_id = u.id
        WHERE gp.room_id = ?
      `).all(room.id); 

      let gameStatus = 'waiting';
      let gameExist
      const playersInfo = updatedPlayers.map(p => {return ({id: p.id,nickname: p.nickname, money: 10000, property: [], position:{x:0,y:0} })})
      if (updatedPlayers.length === 2) {
        gameStatus = 'started'; 
        const board = generateBusinessBoard()
        if (!game) { 
          db.prepare(`
            INSERT INTO game (room_id, player1_id, player2_id, player1_info, player2_info, game_board, game_status, player_turn )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(room.id, playersInfo[0].id, playersInfo[1].id,JSON.stringify(playersInfo[0]) , JSON.stringify(playersInfo[1]), JSON.stringify(board), "started", updatedPlayers[0].id);
          io.to(roomCode).emit('game-started', {
            turn: updatedPlayers[0].id,
            players: playersInfo,
            playerCount: playersInfo.length ,
            gameStatus: gameStatus,
            gameBoard: board 
          });
        } 
        else{ 
          gameExist = {turn: game.player_turn, players: [JSON.parse(game.player1_info), JSON.parse(game.player2_info)], status: game.game_status,gameBoard: JSON.parse(game.game_board)}
          const player = gameExist.players.find(p => p.id == socket.userId) 
          let businessBuy = false
          if (player && player.property.some(b => b.status == "in process")) {
            businessBuy = true
            io.to(socket.id).emit('businessBuy', {
              player: player,
              business: board[player.position.x][player.position.y] 
            }); 
          }
          io.to(roomCode).emit('game-started', {
            turn: businessBuy ? null : game.player_turn,
            players: [JSON.parse(game.player1_info), JSON.parse(game.player2_info)],
            playerCount: updatedPlayers.length ,
            gameStatus: game.game_status,
            gameBoard: JSON.parse(game.game_board)
          });  
        }  
      } 

      io.to(roomCode).emit('player-joined', {
        playerId: socket.userId,
        players: gameExist ? gameExist.players : playersInfo,
        playerCount: updatedPlayers.length ,
        gameStatus: gameExist ? gameExist.status : gameStatus
      }); 

      callback({
        success: true,
        players: gameExist ? gameExist.players : playersInfo,
        playerCount: updatedPlayers.length ,
        gameStatus: gameExist ? gameExist.status : gameStatus,
        room: {
          code: roomCode,
          name: room.name
        }
      });
      
    } catch (error) { 
      callback({
        success: false,
        error: 'Server error'
      });
    }
  }); 
  socket.on('throwBones', (data,callback) => {
    try{
      const userId = socket.userId; 
      const roomCode = data.room
      const room = db.prepare(`
          SELECT r.* FROM rooms r
          Where room_code = ?
      `).get(roomCode); 
      const game = db.prepare(`
            SELECT * FROM game 
            Where room_id = ?
      `).get(room.id);  
      const number = Math.floor(Math.random() * 11) + 2;
      const board = JSON.parse(game.game_board)
      let player
      let turn
      if (game.player1_id == userId) {
        player = JSON.parse(game.player1_info) 
        turn = game.player2_id
      }
      else{
        player = JSON.parse(game.player2_info) 
        turn = game.player1_id
      }   
      const players = [JSON.parse(game.player1_info), JSON.parse(game.player2_info)]
      const position = movePlayer(player.position, number)  
      player.position = {x:position.x,y:position.y} 
      console.log(position);
      console.log(players)
      let gameStatus = "started" 
      if (position.passedStart) {
        const income = player.property.reduce((acc,curr) => {
          return acc+curr.profit
        },0)
        player.money = player.money + income
      } 
      let turnEnd = true
      let businessOwner
      let message
      if (board[player.position.x][player.position.y].type == "b") {
        const arleadyIn = players.find(p => p.property.some(pr => pr.name == board[player.position.x][player.position.y].name))
        if (arleadyIn && arleadyIn.id != player.id) {
          businessOwner = arleadyIn
          const business = arleadyIn.property.find(p => p.name == board[player.position.x][player.position.y].name)
          player.money - business.profit < 0  ?  gameStatus = "finished" : gameStatus = "started" 
          player.money = player.money - business.profit
          businessOwner.money = businessOwner.money + business.profit
          message = `${player.nickname} stand on ${arleadyIn.nickname} business -${business.profit}`
          publishGameEvent(roomCode, {
            type: 'PAY_RENT',
            from: player.nickname,
            to: businessOwner.nickname,
            amount: business.profit
          }) 
        }
        else if(!arleadyIn){
          turnEnd = false
          player.property = [...player.property, {name:board[player.position.x][player.position.y].name, status:"in process", profit:0}]
          const updatedPlayers = players.map(p => {
            return p.id == player.id  ? player : p
          })
          message = `${player.nickname} can buy ${board[player.position.x][player.position.y].name} business`
          db.prepare(`
                UPDATE game
                SET player1_info = ?, player2_info = ?, player_turn = ?, game_status = ?
                WHERE room_id = ?
          `).run(JSON.stringify(updatedPlayers[0]),JSON.stringify(updatedPlayers[1]),turn,gameStatus,room.id); 
          io.to(socket.id).emit('businessBuy', {
            player: player,
            business: board[player.position.x][player.position.y] 
          }); 
          publishGameEvent(roomCode, {
            type: 'THROW_BONES',
            player: player.nickname,
            value: number
          }) 
        }   
        message = message ? message : `${player.nickname} stand on his own business` 
      } 
      if (board[player.position.x][player.position.y].type == "r") { 
        const event = handleRandomEvent(player) 
        const amount = event.amount
        player.money + amount < 0  ?  gameStatus = "finished" : gameStatus = "started" 
        player.money = player.money + amount
        message = event.message
        publishGameEvent(roomCode, {
          type: 'RANDOM_EVENT',
          message: message,
          amount: amount
        }) 
      } 
      const updatedPlayers = players.map(p => {
        if (businessOwner) {
          return p.id == player.id  ? player : p.id == businessOwner.id ? businessOwner : p
        }
        return p.id == player.id  ? player : p 
      }) 
      db.prepare(`
            UPDATE game
            SET player1_info = ?, player2_info = ?, player_turn = ?, game_status = ?
            WHERE room_id = ?
      `).run(JSON.stringify(updatedPlayers[0]),JSON.stringify(updatedPlayers[1]),turn,gameStatus,room.id);  
      
      if (gameStatus == "finished") {
        const winner = updatedPlayers.find(p => p.id == turn)
        console.log(updatedPlayers)
        io.to(roomCode).emit('finish', {
          winner: winner,
          gameStatus: gameStatus,
          players: updatedPlayers,
          message: message
        }); 
        db.prepare(`
          DELETE FROM rooms 
          WHERE room_code = ?
        `).run( roomCode );  
        publishGameEvent(roomCode, {
          type: 'THROW_BONES',
          player: player.nickname,
          value: number
        });
        publishGameEvent(roomCode, {
          type: 'GAME_FINISHED',
          winner: updatedPlayers.find(p => p.id == turn)
        }) 
      }
      else if(turnEnd){
        publishGameEvent(roomCode, {
          type: 'THROW_BONES',
          player: player.nickname,
          value: number
        }) 
        io.to(roomCode).emit('end-turn', {
          turn: turn,
          players: updatedPlayers,
          playerCount: updatedPlayers.length ,
          gameStatus: gameStatus,
          gameBoard: JSON.parse(game.game_board),
          message: message
        }); 
      }  
      callback({
        success: true,
        players: updatedPlayers,
        distance: number
      } )
    }
    catch (err){
      console.log(err); 
      callback({ 
        success: false,
        error: 'Server error'
      });
    } 
  })
  socket.on('buyDecision', (data,callback ) => {
    try{ 
      const userId = socket.userId;
      if (data.decision) { 
        const roomCode = data.room
        const room = db.prepare(`
            SELECT r.* FROM rooms r
            Where room_code = ?
        `).get(roomCode); 
        const game = db.prepare(`
              SELECT * FROM game 
              Where room_id = ?
        `).get(room.id);   
        let player
        let turn
        if (game.player1_id == userId) {
          player = JSON.parse(game.player1_info) 
          turn = game.player2_id
        }
        else{
          player = JSON.parse(game.player2_info) 
          turn = game.player1_id
        }  
        let gameStatus = "started"
        let message = `${player.nickname} dont have enough money to buy ${data.business.name}`
        const realPlayer = player.property.find(p => p.name == data.business.name)
        if (realPlayer) {
          if ( player.money > data.business.price) {
            player.property = player.property.map(pr => {
              return pr.name == data.business.name ? {name:data.business.name, profit: data.business.profit, group:data.business.group, status:"in property"} : pr
            }),   
            player.money = player.money - data.business.price 
            if (player.property.filter(p => p.group == data.business.group).length == 3) {
              player.property = player.property.map(p => {
                return {...p, profit: p.profit*2 }
              })
            }
            message = `${player.nickname} bought ${data.business.name}`
          }
          else{
            player.property = player.property.filter(p => p.name != data.business.name)
          }
        } 
        const players = [JSON.parse(game.player1_info), JSON.parse(game.player2_info)]
        const updatedPlayers = players.map(p => {
          return p.id == player.id  ? player : p
        })
        db.prepare(`
            UPDATE game
            SET player1_info = ?, player2_info = ?, player_turn = ?, game_status = ?
            WHERE room_id = ?
        `).run(JSON.stringify(updatedPlayers[0]), JSON.stringify(updatedPlayers[1]), turn, gameStatus, room.id); 
        io.to(roomCode).emit('end-turn', {
          turn: turn,
          players: updatedPlayers,
          playerCount: updatedPlayers.length ,
          gameStatus: gameStatus,
          gameBoard: JSON.parse(game.game_board),
          message: message
        }); 
        publishGameEvent(roomCode, {
          type: 'BUY_BUSINESS',
          player: player.nickname,
          business: data.business.name,
          price: data.business.price,
          decision: true
        });
        callback({
          success: true, 
        });
      } 
      else{ 
        const roomCode = data.room
        const room = db.prepare(`
            SELECT r.* FROM rooms r
            Where room_code = ?
        `).get(roomCode); 
        const game = db.prepare(`
              SELECT * FROM game 
              Where room_id = ?
        `).get(room.id); 
        let player
        let turn
        if (game.player1_id == userId) {
          player = JSON.parse(game.player1_info) 
          turn = game.player2_id
        }
        else{
          player = JSON.parse(game.player2_info) 
          turn = game.player1_id
        }  
        player.property = player.property.filter(p => p.name != data.business.name)
        const players = [JSON.parse(game.player1_info), JSON.parse(game.player2_info)]
        const updatedPlayers = players.map(p => {
          return p.id == player.id  ? player : p
        })
        db.prepare(`
            UPDATE game
            SET player1_info = ?, player2_info = ?, player_turn = ?, game_status = ?
            WHERE room_id = ?
        `).run(JSON.stringify(updatedPlayers[0]), JSON.stringify(updatedPlayers[1]), turn, game.gameStatus, room.id); 
        io.to(roomCode).emit('end-turn', {
          turn: turn,
          players: updatedPlayers,
          playerCount: updatedPlayers.length ,
          gameStatus: game.gameStatus,
          gameBoard: JSON.parse(game.game_board),
          message: `${player.nickname} refused to bought ${data.business.name}`
        }); 
        publishGameEvent(roomCode, {
          type: 'BUY_BUSINESS',
          player: player.nickname,
          business: data.business.name,
          price: data.business.price,
          decision: false
        }); 
        callback({
          success: true, 
        });
      }
    }
    catch(err){
      console.log(err); 
      callback({
        success: false,
        error: 'Server error'
      });
    } 
  })
  socket.on('tradeRequest', (data,callback ) => {
    try {
      const userId = data.senderId 
      const recepientId = data.recepientId 
      const businessSell = data.businessSell
      const businessBuy = data.businessBuy
      const roomCode = data.room
      const room = db.prepare(`
            SELECT r.* FROM rooms r
            Where room_code = ?
      `).get(roomCode); 
      const game = db.prepare(`
              SELECT * FROM game 
              Where room_id = ?
      `).get(room.id);    
      let user 
      let recepient
      if (game.player1_id == userId) {
        user = JSON.parse(game.player1_info) 
        recepient = JSON.parse(game.player2_info) 
      }
      else{
        user = JSON.parse(game.player2_info) 
        recepient = JSON.parse(game.player1_info) 
      }   
      const businessSellExist = businessSell.every(b => user.property.some(rb => rb.name == b.name))
      if (!businessSellExist) {
        callback({
            success: false,  
            error: "Business not found"
        } )
      }
      const businessBuyExist = businessBuy.every(b => recepient.property.some(rb => rb.name == b.name))
      if (!businessBuyExist) {
        callback({
            success: false  ,
            error: "Business not found"
        } )
      }
      if (recepient.money < data.priceGet) {
        callback({
          success: false,  
          error: "Not enough money"
        } )
      }
      if (user.money < data.priceGive) {
        callback({
          success: false,  
          error: "Not enough money"
        } )
      } 
      const trade = db.prepare(`
            INSERT INTO trade_requests (room_id, sender_id, recepient_id, business_sell, business_buy, price_give, price_get)
            VALUES (?,?,?,?,?,?,?) 
      `).run(room.id, user.id, recepient.id, JSON.stringify(businessSell),JSON.stringify(businessBuy) , data.priceGive, data.priceGet); 
  
      io.to(roomCode).emit('trade', {
        tradeId: trade.lastInsertRowid,
        senderId: user.id,
        recepientId: recepient.id,
        businessSell: businessSell,
        businessBuy: businessBuy,
        priceGive: data.priceGive,
        priceGet: data.priceGet
      }) 
      callback({
          success: true 
      } )
    }
    catch(err){
      console.log(err); 
      callback({
        success: false,
        error: 'Server error'
      });
    } 
  } )
  socket.on('tradeDecision', (data,callback ) => { 
    try {
      const tradeId = data.tradeId
      const userId = data.senderId 
      const recepientId = data.recepientId 
      const businessSell = data.businessSell
      const businessBuy = data.businessBuy
      const roomCode = data.room
      const room = db.prepare(`
            SELECT r.* FROM rooms r
            Where room_code = ?
      `).get(roomCode); 
      const game = db.prepare(`
              SELECT * FROM game 
              Where room_id = ?
      `).get(room.id);   
      const trade = db.prepare(`
              SELECT * FROM trade_requests
              Where id = ?
      `).get(tradeId);    
      if (trade.sender_id != userId || trade.recepient_id != recepientId || JSON.stringify(JSON.parse(trade.business_sell)) !== JSON.stringify(businessSell) || JSON.stringify(JSON.parse(trade.business_buy)) !== JSON.stringify(businessBuy) || trade.price_give != data.priceGive || trade.price_get != data.priceGet) {
        callback({
          success: false  
        } )
      }
      if (!data.decision){
        let user 
        let recepient
        if (game.player1_id == userId) {
          user = JSON.parse(game.player1_info) 
          recepient = JSON.parse(game.player2_info)
        }
        else{
          user = JSON.parse(game.player2_info) 
          recepient = JSON.parse(game.player1_info) 
        }    
        db.prepare(`
                DELETE FROM trade_requests
                Where id = ?
        `).run(tradeId);   
        const players = [JSON.parse(game.player1_info), JSON.parse(game.player2_info)]
        io.to(roomCode).emit('tradeDone', { 
          message: `Trade from ${user.nickname} is declined by ${recepient.nickname}`,
          players: players
        }) 
        callback({
          success: true 
        } ) 
      }
      else{ 
        let user 
        let recepient
        if (game.player1_id == userId) {
          user = JSON.parse(game.player1_info) 
          recepient = JSON.parse(game.player2_info)
        }
        else{
          user = JSON.parse(game.player2_info) 
          recepient = JSON.parse(game.player1_info) 
        }    
        user.property = [...user.property, ...businessBuy]
        user.property = user.property.filter(p => !businessSell.some(bs => bs.name == p.name))
        recepient.property = [...recepient.property, ...businessSell]
        recepient.property = recepient.property.filter(p => !businessBuy.some(bs => bs.name == p.name))
        user.money = user.money + data.priceGet
        user.money = user.money - data.priceGive
        recepient.money = recepient.money + data.priceGive
        recepient.money = recepient.money - data.priceGet
        const players = [JSON.parse(game.player1_info), JSON.parse(game.player2_info)]
        const updatedPlayers = players.map(p => {
          return p.id == user.id  ? user : p.id == recepient.id ? recepient : p
        })
        db.prepare(`
            UPDATE game
            SET player1_info = ?, player2_info = ?, player_turn = ?, game_status = ?
            WHERE room_id = ?
        `).run(JSON.stringify(updatedPlayers[0]), JSON.stringify(updatedPlayers[1]), game.player_turn, game.game_status, room.id); 
        const message = (businessBuy.length > 0 && businessSell.length > 0) ? `${user.nickname} get ${data.priceGet} and ${businessBuy.map(b => b.name).join(', ')}. ${recepient.nickname} get ${data.priceGive} and ${businessSell.map(b => b.name).join(', ')}.` : 
        businessBuy.length > 0 ? `${user.nickname} get ${data.priceGet} and ${businessBuy.map(b => b.name).join(', ')}. ${recepient.nickname} get ${data.priceGive}.` : businessSell.length > 0 ? `${user.nickname} get ${data.priceGet}. ${recepient.nickname} get ${data.priceGive} and ${businessSell.map(b => b.name).join(', ')}.` :
        `${user.nickname} get ${data.priceGet}. ${recepient.nickname} get ${data.priceGive}.`
        db.prepare(`
                DELETE FROM trade_requests
                Where id = ?
        `).run(tradeId);  
        io.to(roomCode).emit('tradeDone', { 
          message: message,
          players: updatedPlayers
        }) 
      } 
    }
    catch(err){
      console.log(err); 
      callback({ 
        success: false,
        error: 'Server error'
      });
    } 
  })
  socket.on('chat-message', (data ) => { 
    const { room, message } = data;
    io.to(room).emit('chat-message', {
      senderId: socket.userId,
      message: message,
    });
  })
  socket.on('leave-room', () => {
    if (socket.roomCode) {
      const roomCode = socket.roomCode;
      socket.leave(roomCode);
      
      const room = db.prepare(`
        SELECT id FROM rooms WHERE room_code = ?
      `).get(roomCode);
      
      if (room) {
        db.prepare(`
          DELETE FROM game_players 
          WHERE user_id = ? AND room_id = ?
        `).run(socket.userId, room.id); 

        socket.to(roomCode).emit('player-left', {
          playerId: socket.userId
        });
      }
      
      socket.roomCode = null;
    }
  }); 
  socket.on('disconnect', () => { 
    console.log(`User ${socket.userId} disconnected`);
    if (socket.roomCode) { 
      const room = db.prepare(`
        SELECT id FROM rooms WHERE room_code = ?
      `).get(socket.roomCode);
      
      if (room) {
        db.prepare(`
          DELETE FROM game_players 
          WHERE user_id = ? AND room_id = ?
        `).run(socket.userId, room.id); 
        console.log(`Deleting player ${socket.userId} on disconnect`);
         
        io.to(socket.roomCode).emit('player-disconnected', {
          playerId: socket.userId
        });
        io.to(socket.roomCode).emit('player-left', {
          playerId: socket.userId
        });
      }
    }
  });
});
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
