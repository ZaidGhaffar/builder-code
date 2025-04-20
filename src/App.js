import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from "@clerk/clerk-react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Default redirect */}
          <Route index element={<Navigate to="/login" replace />} />

          {/* Login route */}
          <Route
            path="login"
            element={
              <>
                <SignedOut>
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "calc(100vh - 120px)", // Account for header/footer
                    width: "100%",
                    backgroundColor: "#f5f5f5",
                  }}>
                    <SignIn
                      appearance={{
                        elements: {
                          rootBox: {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            borderRadius: "8px",
                          }
                        }
                      }}
                    />
                  </div>
                </SignedOut>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
              </>
            }
          />

          {/* Sign-up route */}
          <Route
            path="sign-up"
            element={
              <>
                <SignedOut>
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "calc(100vh - 120px)", // Account for header/footer
                    width: "100%",
                    backgroundColor: "#f5f5f5",
                  }}>
                    <SignUp />
                  </div>
                </SignedOut>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
              </>
            }
          />

          {/* Dashboard (protected route) */}
          <Route
            path="dashboard"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn redirectUrl="/dashboard" />
                </SignedOut>
              </>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;