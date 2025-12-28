 
import { useEffect, useState,useRef } from 'react';
import ReactDOM from "react-dom"; 
import { Toast } from './Toast';
export function ToastContainer( { data, removeToast } : any) {  
    const toastRoot = typeof window !== "undefined" ? document.getElementById("toast-modal") : null; 
    const timersRef = useRef(new Map()) 
    const uniqueToasts = data.filter((toast:any, index:number, self:any) => 
      index === self.findIndex((t:any) => t.id === toast.id)
    );
    useEffect(() => {
        const now = Date.now()

        uniqueToasts.forEach((toast:any) => {
            const elapsed = now - toast.id

            if (elapsed >= 3000) {
                removeToast(toast.id)
            } else {
                const remaining = 3000 - elapsed
                const timer = setTimeout(() => removeToast(toast.id), remaining)
                timersRef.current.set(toast.id, timer)
            }
        }) 
        return () => {
            timersRef.current.forEach(timer => clearTimeout(timer))
            timersRef.current.clear()
        }
    }, [uniqueToasts])
    console.log(uniqueToasts);
    
    if(!toastRoot) return null
    return ReactDOM.createPortal( 
        <div id="toast-container" onClick={(e) => e.stopPropagation()}> 
            <div id="toast-list"> 
                {uniqueToasts.map((t:any,index:number) => {
                    return (<Toast key={t.id} data ={t.value} removeToast={removeToast} id={t.id} type={t.type}/>)
                })}
            </div>  
        </div>, toastRoot )
}