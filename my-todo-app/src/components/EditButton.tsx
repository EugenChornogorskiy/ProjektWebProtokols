export function EditButton({ submitting }: { submitting: boolean }) {  
  return ( 
    <button 
      id="login-btn" 
      type="submit" 
      disabled={submitting}
    >
      {submitting ? "Editing..."  : "Edit" }
    </button>
  );
}