   
export function Toast( { data, removeToast, id,type}: any) {    

  return (  
    <div style={{backgroundColor: type=="error" ? "rgba(255, 0, 0, 0.96)" : "rgba(0, 119, 255, 0.96)"}}className="toast-div">
        <p onClick={() => removeToast(id)} className="close-toast">X</p>
        <p className="toast">{data}</p>
    </div>
  )
}