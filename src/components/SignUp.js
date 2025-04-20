import { SignUp } from "@clerk/clerk-react";
import "./SignUp.css"; // ✅ Import SignUp styles

const SignUpPage = () => {
  return (
    <div className="signup-container">
      <header className="signup-header">
        <h1>BuilderPro</h1>
      </header>
      <main className="signup-main">
        <h2>Create an Account</h2>
        <div className="clerk-sign-up">
          <SignUp routing="path" path="/signup" />
        </div>
        <div className="login-link">
          <p>Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
