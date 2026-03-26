import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingPage from "./features/Loading/pages/LoadingPage";
import AuthPage from "./features/auth/pages/authPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import EmailVerificationPage from "./features/auth/pages/EmailVerificationPage";
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
import HowItWorks from "./features/HowItWorks/pages/HowItWorks";
import ForTenants from "./features/HowItWorks/pages/ForTenants";
import ComingSoon from "./features/ComingSoon/pages/ComingSoon";



import Contract from "./features/TenantContractView/pages/Contract";
import LandlordContract from "./features/LandlordContractView/pages/Contract";
import GuestHome from "./features/Guest/pages/GuestHome";
import GuestSearch from "./features/Guest/pages/GuestSearch";
import AuthGuard from "./components/global/AuthGuard";
import SentRequests from "./features/SentRequests/pages/SentRequests";
import PageNotFound from "./features/PageNotFound/pages/PageNotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry Point */}
        <Route path="/" element={<LoadingPage />} />

        {/* Tenant Routes — protected */}
        <Route path="/tenant-home"   element={<AuthGuard allowedRoles={['TENANT']}><TenantHome /></AuthGuard>} />
        <Route path="/browse-properties" element={<BrowseProperties />} /> {/* guests can browse; Apply Now button guards itself */}
        <Route path="/active-rental" element={<AuthGuard allowedRoles={['TENANT']}><ActiveRental /></AuthGuard>} />
        <Route path="/prepayment-page" element={<AuthGuard allowedRoles={['TENANT']}><PrePayment /></AuthGuard>} />
        <Route path="/saved-properties" element={<AuthGuard allowedRoles={['TENANT']}><SavedProperties /></AuthGuard>} />
        <Route path="/actives"       element={<AuthGuard allowedRoles={['TENANT']}><MyActives /></AuthGuard>} />
        <Route path="/tenant-payment" element={<AuthGuard allowedRoles={['TENANT']}><TenantPayment /></AuthGuard>} />
        <Route path="/tenant-contracts" element={<AuthGuard allowedRoles={['TENANT']}><Contract /></AuthGuard>} />
        <Route path="/sent-requests" element={<AuthGuard allowedRoles={['TENANT']}><SentRequests /></AuthGuard>} />
        <Route
          path="/rewards"
          element={<AuthGuard allowedRoles={['TENANT']}><ComingSoon title="Rewards" description="Rewards is coming soon." /></AuthGuard>}
        />
        <Route
          path="/roommate-matching"
          element={<AuthGuard allowedRoles={['TENANT']}><ComingSoon title="Roommate Matching" description="Roommate matching is coming soon." /></AuthGuard>}
        />
        <Route
          path="/matching"
          element={<AuthGuard allowedRoles={['TENANT']}><ComingSoon title="Roommate Matching" description="Roommate matching is coming soon." /></AuthGuard>}
        />

        {/* Landlord Routes — protected */}
        <Route path="/landlord-home" element={<AuthGuard allowedRoles={['LANDLORD']}><LandlordHome /></AuthGuard>} />
        <Route path="/my-properties" element={<AuthGuard allowedRoles={['LANDLORD']}><MyProperties /></AuthGuard>} />
        <Route path="/rental-requests" element={<AuthGuard allowedRoles={['LANDLORD']}><RentalRequests /></AuthGuard>} />
        <Route path="/landlord-payment" element={<AuthGuard allowedRoles={['LANDLORD']}><LandlordPayment /></AuthGuard>} />
        <Route path="/landlord-contracts" element={<AuthGuard allowedRoles={['LANDLORD']}><LandlordContract /></AuthGuard>} />
        <Route
          path="/maintenance-requests"
          element={<AuthGuard><ComingSoon title="Maintenance Requests" description="Maintenance requests management is coming soon." /></AuthGuard>}
        />

        {/* Global Dashboard Routes */}
        <Route path="/balance" element={<Balance />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/get-help" element={<GetHelp />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-landlords"  element={<HowItWorks />} />
        <Route path="/for-tenants" element={<ForTenants />} />
        {/* Global Dashboard Routes — protected */}
        <Route path="/balance"   element={<AuthGuard><Balance /></AuthGuard>} />
        <Route path="/settings"  element={<Settings />} /> {/* has its own guard */}
        <Route path="/messages"  element={<AuthGuard><Messages /></AuthGuard>} />
        <Route path="/about-us"  element={<AboutUs />} />
        <Route path="/get-help"  element={<GetHelp />} />
        <Route path="/not-found"  element={<PageNotFound />} />

        {/* Guest Routes — public */}
        <Route path="/guest-home"   element={<GuestHome />} />
        <Route path="/guest-search" element={<GuestSearch />} />

        {/* Auth Routes — public */}
        <Route path="/auth"             element={<AuthPage />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
        <Route path="/reset-password"   element={<ResetPasswordPage />} />
        <Route path="/verify-email"     element={<EmailVerificationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;