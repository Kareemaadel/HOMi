import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./features/auth/pages/authPage";
import TenantHome from "./features/home/pages/TenantHome";
import CompleteProfile from "./features/auth/pages/CompleteProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TenantHome />} />
        {/* <Route path="/complete-profile" element={<CompleteProfile />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
