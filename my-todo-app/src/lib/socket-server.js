
import db from '@/src/lib/database';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken'; 
const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", 
    methods: ["GET", "POST"]
  }
});
function movePlayer(currentPos, steps, start = false) {
  const { x, y } = currentPos;
  let newX = x;
  let newY = y;
  let remainingSteps = steps;
  let passedStart = start; 

  const checkIfPassedStart = (fromX, fromY, toX, toY) => { 
    if (fromX > 0 || fromY > 0) { 
      if ((fromX === 0 && toX > 0 && toY === 0) || 
          (fromY === 0 && toY > 0 && fromX === 9) || 
          (fromX === 9 && toX < 9 && fromY === 9) || 
          (fromY === 9 && toY < 9 && toX === 0)) { 
        passedStart = true;
      }
    }
  }; 
  if (y === 0 && x < 9) {
    const moveRight = Math.min(9 - x, remainingSteps);
    const oldX = newX;
    newX += moveRight;
    checkIfPassedStart(oldX, y, newX, y);
    remainingSteps -= moveRight;
  } 
  if (x === 9 && y < 9 && remainingSteps > 0) {
    const moveDown = Math.min(9 - y, remainingSteps);
    const oldY = newY;
    newY += moveDown;
    checkIfPassedStart(x, oldY, x, newY);
    remainingSteps -= moveDown;
  } 
  if (y === 9 && x > 0 && remainingSteps > 0) {
    const moveLeft = Math.min(x, remainingSteps);
    const oldX = newX;
    newX -= moveLeft;
    checkIfPassedStart(oldX, y, newX, y);
    remainingSteps -= moveLeft;
  } 
  if (x === 0 && y > 0 && remainingSteps > 0) {
    const moveUp = Math.min(y, remainingSteps);
    const oldY = newY;
    newY -= moveUp;
    checkIfPassedStart(x, oldY, x, newY);
    remainingSteps -= moveUp;
  } 
  if (remainingSteps > 0) {
    const result = movePlayer({ x: newX, y: newY }, remainingSteps,passedStart);
    return {
      x: result.x,
      y: result.y,
      passedStart: passedStart 
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
    name: 'Social medias',
    businesses: [
      { name: 'Facebook', basePrice: 200, baseProfit: 50 },
      { name: 'Instagram', basePrice: 180, baseProfit: 45 },
      { name: 'Telegram', basePrice: 150, baseProfit: 40 }
    ]
  },
  {
    name: 'Perfume',
    businesses: [
      { name: 'Chanel', basePrice: 300, baseProfit: 60 },
      { name: 'Dior', basePrice: 280, baseProfit: 55 },
      { name: 'Gucci', basePrice: 250, baseProfit: 50 }
    ]
  },
  {
    name: 'Air lines',
    businesses: [
      { name: 'Ryanair', basePrice: 400, baseProfit: 70 },
      { name: 'Wizz Air', basePrice: 350, baseProfit: 65 },
      { name: 'Lufthansa', basePrice: 500, baseProfit: 80 }
    ]
  },
  {
    name: 'Hotels',
    businesses: [
      { name: 'Hilton', basePrice: 600, baseProfit: 90 },
      { name: 'Marriott', basePrice: 550, baseProfit: 85 },
      { name: 'Sheraton', basePrice: 500, baseProfit: 80 }
    ]
  },
  {
    name: 'Cars',
    businesses: [
      { name: 'Tesla', basePrice: 700, baseProfit: 100 },
      { name: 'Toyota', basePrice: 400, baseProfit: 70 },
      { name: 'BMW', basePrice: 650, baseProfit: 95 }
    ]
  },
  {
    name: 'Technology',
    businesses: [
      { name: 'Apple', basePrice: 800, baseProfit: 110 },
      { name: 'Samsung', basePrice: 450, baseProfit: 75 },
      { name: 'Microsoft', basePrice: 750, baseProfit: 105 }
    ]
  },
  {
    name: 'Shops',
    businesses: [
      { name: 'Walmart', basePrice: 350, baseProfit: 65 },
      { name: 'Amazon', basePrice: 850, baseProfit: 115 },
      { name: 'eBay', basePrice: 300, baseProfit: 60 }
    ]
  },
  {
    name: 'Drinks',
    businesses: [
      { name: 'Coca-Cola', basePrice: 500, baseProfit: 80 },
      { name: 'Pepsi', basePrice: 450, baseProfit: 75 },
      { name: 'Starbucks', basePrice: 400, baseProfit: 70 }
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
        price: business.basePrice + Math.floor(Math.random() * 100),
        profit: business.baseProfit + Math.floor(Math.random() * 30)
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
    const amount = Math.floor(Math.random() * 300) + 100; 
    return {
      type: 'ec',
      message: `Податок: -${amount}₴`,
      amount: -amount
    };
  } else if (random < 0.4) { 
    const amount = Math.floor(Math.random() * 200) + 50; 
    return {
      type: 'ec',
      message: `Штраф: -${amount}₴`,
      amount: -amount
    };
  } else if (random < 0.5) { 
    const amount = Math.floor(Math.random() * 400) + 150; 
    return {
      type: 'ec',
      message: `Ремонт: -${amount}₴`,
      amount: -amount
    };
  } else if (random < 0.6) { 
    const amount = Math.floor(Math.random() * 500) + 100; 
    return {
      type: 'win',
      message: `Виграш у лотереї: +${amount}₴`,
      amount: amount
    };
  } else if (random < 0.7) { 
    const amount = Math.floor(Math.random() * 300) + 100; 
    return {
      type: 'win',
      message: `Несподіваний дохід: +${amount}₴`,
      amount: amount
    };
  } else if (random < 1) { 
    const amount = Math.floor(Math.random() * 400) + 100; 
    return {
      type: 'ec',
      message: `Форс-мажор: -${amount}₴`,
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
      console.log(roomCode,data); 
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
        console.log("!room"); 
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
      const playersInfo = updatedPlayers.map(p => {return ({id: p.id,nickname: p.nickname, money: 10000, property: [], position:{x:0,y:0}})})
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
          io.to(roomCode).emit('game-started', {
            turn: game.player_turn,
            players: [JSON.parse(game.player1_info), JSON.parse(game.player2_info)],
            playerCount: updatedPlayers.length ,
            gameStatus: game.gameStatus,
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
      console.error('Join room error:', error);
      callback({
        success: false,
        error: 'Server error'
      });
    }
  }); 
  socket.on('throwBones', (data,callback) => {
    let userId
    try {
      const decoded = jwt.verify(data.token, 'secret123');
      userId = decoded.userId;  
    } catch (err) { 
      callback({
        success: false,
        error: 'Server error'
      });
    }
    const roomCode = data.room
    const room = db.prepare(`
        SELECT r.* FROM rooms r
        Where room_code = ?
    `).get(roomCode); 
    const game = db.prepare(`
          SELECT * FROM game 
          Where room_id = ?
    `).get(room.id); 
    const number = Math.floor(Math.random() * 12) + 1;
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
    let gameStatus = "started" 
    if (position.passedStart) {
      const income = player.property.reduce((acc,curr) => {
        return acc+curr.profit
      },0)
      player.money = player.money + income
    } 
    let turnEnd = true
    let businessOwner
    if (board[player.position.x][player.position.y].type == "b") {
      const arleadyIn = players.find(p => p.property.some(pr => pr.name == board[player.position.x][player.position.y].name))
      if (arleadyIn && arleadyIn.id != player.id) {
        businessOwner = arleadyIn
        const business = arleadyIn.property.find(p => p.name == board[player.position.x][player.position.y].name)
        player.money - business.profit < 0  ?  gameStatus = "finished" : gameStatus = "started" 
        player.money = player.money - business.profit
        businessOwner.money = businessOwner.money + business.profit
      }
      else if(!arleadyIn){
        turnEnd = false
        player.property = [...player.property, {name:board[player.position.x][player.position.y].name, status:"in process"}]
        const updatedPlayers = players.map(p => {
          return p.id == player.id  ? player : p
        })
        db.prepare(`
              UPDATE game
              SET player1_info = ?, player2_info = ?, player_turn = ?, game_status = ?
              WHERE room_id = ?
        `).run(JSON.stringify(updatedPlayers[0]),JSON.stringify(updatedPlayers[1]),turn,gameStatus,room.id); 
        io.to(socket.id).emit('businessBuy', {
          player: player,
          business: board[player.position.x][player.position.y] 
        }); 
      }  
    } 
    if (board[player.position.x][player.position.y].type == "r") { 
      const amount = handleRandomEvent(player).amount
      player.money + amount < 0  ?  gameStatus = "finished" : gameStatus = "started" 
      player.money = player.money + amount
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
      io.to(roomCode).emit('finish', {
        winner: turn,
        gameStatus: gameStatus
      }); 
    }
    else if(turnEnd){
      io.to(roomCode).emit('end-turn', {
        turn: turn,
        players: updatedPlayers,
        playerCount: updatedPlayers.length ,
        gameStatus: gameStatus,
        gameBoard: JSON.parse(game.game_board)
      }); 
    } 
    callback({
      success: true,
      players: updatedPlayers,
      distance: number
    } )
  })
  socket.on('buyDecision', (data ) => {
    let userId
    try {
        const decoded = jwt.verify(data.token, 'secret123');
        userId = decoded.userId;  
    } catch (err) {  
        console.log(err); 
    }
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
      const realPlayer = player.property.find(p => p.name == data.business.name)
      if (realPlayer) {
        if (data.decision && player.money > data.business.price) {
          player.property = player.property.map(pr => {
            return pr.name == data.business.name ? {name:data.business.name, profit: data.business.profit, group:data.business.group, status:"in property"} : pr
          }),  
          player.money - data.business.price < 0  ?  gameStatus = "finished" : gameStatus = "started"
          player.money = player.money - data.business.price 
          if (player.property.filter(p => p.group == data.business.group).length == 3) {
            player.property = player.property.map(p => {
              return {...p, profit: p.profit*2 }
            })
          }
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
        gameBoard: JSON.parse(game.game_board)
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
      const updatedPlayers = [JSON.parse(game.player1_info),JSON.parse(game.player2_info) ]
      io.to(roomCode).emit('end-turn', {
        turn: turn,
        players: updatedPlayers,
        playerCount: updatedPlayers.length ,
        gameStatus: game.gameStatus,
        gameBoard: JSON.parse(game.game_board)
      }); 
    }
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
