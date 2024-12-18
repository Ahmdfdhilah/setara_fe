import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ManageMap from "./pages/admin/ManageMap";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/create/lahan" element={<ManageMap />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;