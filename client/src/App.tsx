import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./features/auth/pages/authPage";
import TenantHome from "./features/home/pages/TenantHome";
import LandlordHome from "./features/home/pages/LandlordHome";
import CompleteProfile from "./features/auth/pages/CompleteProfile";
import MyProperties from "./features/MyProperties/pages/MyProperties";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<TenantHome />} /> */}
        <Route path="/" element={<LandlordHome />} />
        <Route path="/my-properties" element={<MyProperties />} />
        {/* <Route path="/complete-profile" element={<CompleteProfile />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
