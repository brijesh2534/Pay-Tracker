import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { AuthProvider, useAuth } from "./auth";
import { NotificationProvider } from "./context/NotificationContext";

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <InnerApp />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
