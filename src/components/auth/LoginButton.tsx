export function LoginButton({ submitting,type }: { submitting: boolean,type: string }) {  
  return ( 
    <button 
      id="login-btn" 
      type="submit" 
      disabled={submitting}
    >
      {submitting ? type == "login" ? "Logging in..." : "Creating account..." : type == "login" ? "Login in" : "Create account"}
    </button>
  );
}