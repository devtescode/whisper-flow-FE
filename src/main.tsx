// import { createRoot } from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css";

// createRoot(document.getElementById("root")!).render(<App />);





// import { createRoot } from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css";
// import { GoogleOAuthProvider } from "@react-oauth/google";

// createRoot(document.getElementById("root")!).render(
//   <GoogleOAuthProvider clientId="867158582605-njavkrf5mk8i47eh29poll0fe7cj7i93.apps.googleusercontent.com">
//     <App />
//   </GoogleOAuthProvider>
// );



import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";



// ✅ ADD THIS
import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="867158582605-njavkrf5mk8i47eh29poll0fe7cj7i93.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);

// ✅ REGISTER SERVICE WORKER (VERY IMPORTANT)
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log("Whisper Flow is ready to work offline");
  },
  onNeedRefresh() {
    console.log("New version available, refresh needed");
  },
});
