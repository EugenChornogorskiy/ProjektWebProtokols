 
'use client'
import { useEffect, useState,useRef } from 'react';
import ReactDOM from "react-dom";
import { Trade } from "./Trade";
import { Socket } from 'socket.io-client';
export function TradeModal( { recepient,player, onClose,socket } : any) {   
    const modalRoot = typeof window !== "undefined" ? document.getElementById("trade-modal") : null;
    const modalRef = useRef(null);    
    useEffect(() => {
        const modal = modalRef.current;
        const focusable = modal.querySelectorAll("button, [href], input, select, textarea");
        const first = focusable[0];
        first?.focus();
        const last = focusable[focusable.length - 1];

        function handleTab(e:any) {
          if (e.key !== "Tab") return;
          if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
          }
        }

        document.addEventListener("keydown", handleTab);
        return () => document.removeEventListener("keydown", handleTab);
    }, []);
    useEffect(() => {
      
      const handleEsc = (e:any) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }, []);
    if (!modalRoot) return null;
  return ReactDOM.createPortal( 
    <div ref={modalRef} id="backgr-review" > 
      <div onClick={(e) => e.stopPropagation()}> 
        <Trade recepient={recepient} player={player} onClose={onClose} socket={socket}/>
      </div>  
    </div>, modalRoot )
}