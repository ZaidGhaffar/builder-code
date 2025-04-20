import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignIn, useUser, useAuth } from "@clerk/clerk-react";
import "./Login.css"; // ✅ Keep styling

const Login = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useAuth(); // ✅ Get Clerk's signOut function

  // ✅ Force logout to clear any incorrect session
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      signOut(); // ✅ Ensures previous session does not interfere
    }
  }, [isLoaded, isSignedIn, signOut]);

  // ✅ Redirect users to /dashboardv1 after signing in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return <p>Loading...</p>; // ✅ Prevents flickering before Clerk loads
  }

  return (
    <div className="login-container">
      <header className="login-header">
        <h1>BuilderPro</h1>
      </header>
      <main className="login-main">
        <h2>Welcome back!</h2>
        <div className="clerk-sign-in">
          <SignIn 
            routing="path" 
            path="/login" 
            redirectUrl="/dashboard"  // ✅ Forces redirect to /dashboardv1
            afterSignInUrl="/dashboard"  // ✅ Ensures signup also redirects correctly
            afterSignUpUrl="/dashboard"
          />
        </div>
        <div className="signup-link">
          <p>Don't have an account? <Link to="/signup">Sign up now</Link></p>
        </div>
      </main>
    </div>
  );
};

export default Login;
