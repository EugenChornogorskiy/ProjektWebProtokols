'use client';
import { log } from 'node:console';
import React, { createContext, useContext, useReducer, useEffect,useState } from 'react'; 
const LoginContext = createContext();  
const axios = require('axios').default;
export const LoginProvider = ({ children }:any) => {  
  const [login, setLogin] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [loaded, setLoaded] = useState<boolean>(false); 
  const [fetched, setFetched] = useState<boolean>(false); 
  console.log(login,token,roomCode);
  
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(`Login`, login );
      localStorage.setItem(`Token`, token );
      localStorage.setItem(`Room`,  roomCode );
    }
  }, [login,token]);
 
  useEffect(() => {
    const savedLogin = localStorage.getItem(`Login`);
    const savedToken = localStorage.getItem(`Token`); 
    const savedRoom = localStorage.getItem(`Room`); 
    if (savedLogin) { 
      setLogin(savedLogin)
    } 
    if (savedToken) {
      setToken(savedToken.replace(/^"(.*)"$/, '$1'))
    }
    if (savedRoom) {
      setRoomCode(savedRoom)
    }
    setLoaded(true);
  }, []);
useEffect(() => {
  if (loaded && login && token) { 
    axios.get('http://localhost:3000/api/auth/verify', {
      headers: { Authorization: token }
    })
    .then(function (response:any) { 
      console.log('User authenticated');
      axios.get('http://localhost:3000/api/room/verify', {
        headers: { Authorization: token }
      })
      .then(function (response:any) { 
        console.log(roomCode);
        setFetched(true)
      })
      .catch(function (error:any) {  
        setRoomCode(""); 
        localStorage.removeItem('Room');
      });  
    })
    .catch(function (error:any) { 
      console.log('Token invalid');
      setLogin("");
      setToken(""); 
      localStorage.removeItem('Login');
      localStorage.removeItem('Token'); 
      window.location.href = '/auth/login';
    });  
    console.log(roomCode,token);
    
  }
  if(loaded){
    setFetched(true)
  } 
}, [loaded]);
  const addLogin = (action: any) => {
    setLogin(action)
  }  
  const addToken = (action: any) => {  
    setToken(action) 
  } 
  const addRoom = (action: any) => {  
    setRoomCode(action)   
  }  
  const value = { 
    login,
    token,
    roomCode,
    addLogin,
    addToken,
    addRoom,
    loaded,
    fetched,
  }; 
  return (
    <LoginContext.Provider value={value}>
      {children}
    </LoginContext.Provider >
  );
  
};

export const useLogin = () => {
  const context = useContext(LoginContext ); 
  return context;
};