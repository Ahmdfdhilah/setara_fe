import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ManageMap from "./pages/admin/ManageMap";
import LoginPage from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./route/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/manage/map" element={
            <PrivateRoute>
              <ManageMap />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;