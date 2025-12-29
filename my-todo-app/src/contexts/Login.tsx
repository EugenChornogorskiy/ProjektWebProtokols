'use client';
import { log } from 'node:console';
import React, { createContext, useContext, useReducer, useEffect,useState } from 'react'; 
const LoginContext = createContext();  
const axios = require('axios').default;
export const LoginProvider = ({ children }:any) => {  
  const [login, setLogin] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [id, setId] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [loaded, setLoaded] = useState<boolean>(false); 
  const [fetched, setFetched] = useState<boolean>(false); 
  console.log(login,token,roomCode,id);
  
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(`Login`, login );
      localStorage.setItem(`Id`, id );
      localStorage.setItem(`Token`, token );
      localStorage.setItem(`Room`,  roomCode );
    }
  }, [login,token]);
 
  useEffect(() => {
    const savedLogin = localStorage.getItem(`Login`);
    const savedId = localStorage.getItem(`Id`);
    const savedToken = localStorage.getItem(`Token`); 
    const savedRoom = localStorage.getItem(`Room`); 
    if (savedLogin) { 
      setLogin(savedLogin)
    } 
    if (savedId) { 
      setId(savedId)
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
    if (loaded && token ) { 
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
        setId(null)
        localStorage.removeItem('Login');
        localStorage.removeItem('Token'); 
        localStorage.removeItem('Id'); 
        window.location.href = '/auth/login';
      });  
      console.log(roomCode,token,id);
      
    }
    if(loaded){
      setFetched(true)
      if (!login || !id) {
        setName("")
        setEmail("")
        setSurname("")
      }
    } 
  }, [loaded]);
  useEffect(() => {
    if (loaded && id) {
      axios.get( `http://localhost:3000/api/users/${id}`)
      .then(function (response:any) {
        console.log(response.data); 
        setName(response.data.name)
        setEmail(response.data.email)
        setSurname(response.data.surname) 
      })
      .catch(function (error:any) {
        console.log(error); 
      });
    }
  },[loaded,id])
  const addLogin = (action: any) => {
    setLogin(action)
  }  
  const addId = (action: any) => {
    setId(action)
  }  
  const addToken = (action: any) => {  
    setToken(action) 
  } 
  const addRoom = (action: any) => {  
    setRoomCode(action)   
  }  
  const value = { 
    login,
    id,
    token,
    roomCode,
    name,
    surname,
    email,
    addLogin,
    addId,
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