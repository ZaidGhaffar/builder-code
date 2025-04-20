import React from "react";
import { createRoot } from "react-dom/client"; // Update import
import { Provider } from "react-redux";
import { ClerkProvider } from "@clerk/clerk-react";
import store from "./redux/store";
import App from "./App";

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Log to check if key is available
console.log("Clerk key available:", !!clerkPubKey);

// New React 18 rendering API
const root = createRoot(document.getElementById("root"));
root.render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <Provider store={store}>
      <App />
    </Provider>
  </ClerkProvider>
);