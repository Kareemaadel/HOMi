import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./features/auth/pages/authPage";
import TenantHome from "./features/home/pages/TenantHome";
import LandlordHome from "./features/home/pages/LandlordHome";
import CompleteProfile from "./features/auth/pages/CompleteProfile";
import MyProperties from "./features/MyProperties/pages/MyProperties";
import RentalRequests from "./features/RentalRequests/pages/RentalRequests";
import BrowseProperties from "./features/BrowseProperties/pages/BrowseProperties";
import ActiveRentals from "./features/ActiveRental/pages/ActiveRentals";
import Settings from "./features/Settings/pages/Settings";
import Messages from "./features/Messages/pages/Messages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TenantHome />} />
        <Route path="/browse-properties" element={<BrowseProperties />} />
        <Route path="/active-properties" element={<ActiveRentals />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/messages" element={<Messages />} />
        {/* <Route path="/" element={<LandlordHome />} /> */}
        {/* <Route path="/my-properties" element={<MyProperties />} /> */}
        {/* <Route path="/rental-requests" element={<RentalRequests />} /> */}
        {/* <Route path="/complete-profile" element={<CompleteProfile />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;