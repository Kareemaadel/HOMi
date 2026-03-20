import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingPage from "./features/Loading/pages/LoadingPage";
import AuthPage from "./features/auth/pages/authPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import TenantHome from "./features/home/pages/TenantHome";
import LandlordHome from "./features/home/pages/LandlordHome";
import CompleteProfile from "./features/auth/pages/CompleteProfile";
import MyProperties from "./features/MyProperties/pages/MyProperties";
import RentalRequests from "./features/RentalRequests/pages/RentalRequests";
import BrowseProperties from "./features/BrowseProperties/pages/BrowseProperties";
import ActiveRental from "./features/ActiveRental/pages/ActiveRental";
import Settings from "./features/Settings/pages/Settings";
import Messages from "./features/Messages/pages/Messages";
import Balance from "./features/Balance/pages/Balance";
import PrePayment from "./features/PrePayment/pages/PrePayment";
import SavedProperties from "./features/SavedProperties/pages/SavedProperties";
import AboutUs from "./features/AboutUs/pages/AboutUs";
import GetHelp from "./features/GetHelp/pages/GetHelp";
import MyActives from "./features/ActiveRental/pages/MyActives";
import TenantPayment from "./features/TenantPayment/pages/TenantPayment";
import LandlordPayment from "./features/LandlordPayment/pages/LandlordPayment";
import Contract from "./features/TenantContractView/pages/Contract";
import LandlordContract from "./features/LandlordContractView/pages/Contract";
import GuestHome from "./features/Guest/pages/GuestHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry Point: The Loading Sequence */}
        <Route path="/" element={<LoadingPage />} />
        <Route path="/guest-home" element={<GuestHome />} />


        {/* Tenant Routes */}
        <Route path="/tenant-home" element={<TenantHome />} />
        <Route path="/browse-properties" element={<BrowseProperties />} />
        <Route path="/active-rental" element={<ActiveRental />} />
        <Route path="/prepayment-page" element={<PrePayment />} />
        <Route path="/saved-properties" element={<SavedProperties />} />
        <Route path="/actives" element={<MyActives/>} />
        <Route path="/tenant-payment" element={<TenantPayment />} />
        <Route path="/tenant-contracts" element={<Contract />} />

        {/* Landlord Routes */}
        <Route path="/landlord-home" element={<LandlordHome />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/rental-requests" element={<RentalRequests />} />
        <Route path="/landlord-payment" element={<LandlordPayment />} />
        <Route path="/landlord-contracts" element={<LandlordContract />} />

        {/* Global Dashboard Routes */}
        <Route path="/balance" element={<Balance />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/get-help" element={<GetHelp />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;