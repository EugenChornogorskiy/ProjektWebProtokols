export function ReviewSubmitButton({ submitting }: { submitting: boolean }) {  
  return ( 
    <button 
      id="create-review-btn" 
      type="submit" 
      disabled={submitting}
    >
      {submitting ? "Publishing..." : "Publish"}
    </button>
  );
}