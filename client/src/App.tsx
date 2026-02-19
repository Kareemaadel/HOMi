import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingPage from "./features/Loading/pages/LoadingPage"; // Import the loader
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
import Balance from "./features/Balance/pages/Balance";
import PrePayment from "./features/PrePayment/pages/PrePayment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry Point: The Loading Sequence */}
        <Route path="/" element={<LoadingPage />} />

        {/* Tenant Routes */}
        <Route path="/tenant-home" element={<TenantHome />} />
        <Route path="/browse-properties" element={<BrowseProperties />} />
        <Route path="/active-properties" element={<ActiveRentals />} />
        <Route path="/prepayment-page" element={<PrePayment />} />

        {/* Landlord Routes */}
        {/* <Route path="/landlord-home" element={<LandlordHome />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/rental-requests" element={<RentalRequests />} /> */}

        {/* Global Dashboard Routes */}
        <Route path="/balance" element={<Balance />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/messages" element={<Messages />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;