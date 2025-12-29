export function ReviewEditButton({ submitting }: { submitting: boolean }) {  
  return ( 
    <button 
      id="create-review-btn" 
      type="submit" 
      disabled={submitting}
    >
      {submitting ? "Editing..."  : "Edit" }
    </button>
  );
}