 
'use client'
import { useEffect, useState,useRef } from 'react';
import ReactDOM from "react-dom";
import { ReviewEdit } from "./ReviewEdit";
export function ReviewEditModal( { review, onClose,setAddedReview } : any) {   
    const modalRoot = typeof window !== "undefined" ? document.getElementById("review-modal") : null;
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
    <div ref={modalRef} id="backgr-review" onClick={onClose} > 
      <div onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose } id="close-modal">
          ✖
        </button> 
        <ReviewEdit review={review} onClose={onClose} setAddedReview={setAddedReview} />
      </div>  
    </div>, modalRoot )
}