import { useState } from "react";
import StepGuidelines from "../../../features/auth/components/StepGuidelines";
import StepUserType from "../../../features/auth/components/StepUserType";
import TenantCredentials from "../../../features/auth/components/TenantCredentials";
import TenantLifestyle from "../../../features/auth/components/TenantLifestyle";
import LandlordCredentials from "../../../features/auth/components/LandlordCredentials";
import LandlordProperties from "../../../features/auth/components/LandlordProperties";
import StepAvatarFinish from "../../../features/auth/components/StepAvatarFinish";
import "./CompleteProfile.css";
import "../components/onboarding/Onboarding.css";

export type UserType = "tenant" | "landlord" | null;

export default function CompleteProfile() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);

  const next = () => setStep((s) => s + 1);
  const skip = () => (window.location.href = "/dashboard");

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        <div className="progress-bar">
          <div style={{ width: `${step * 14}%` }} />
        </div>

        {step === 1 && <StepGuidelines onNext={next} />}
        {step === 2 && <StepUserType setUserType={setUserType} onNext={next} />}

        {userType === "tenant" && step === 3 && <TenantCredentials onNext={next} />}
        {userType === "tenant" && step === 4 && <TenantLifestyle onNext={next} />}

        {userType === "landlord" && step === 3 && <LandlordCredentials onNext={next} />}
        {userType === "landlord" && step === 4 && <LandlordProperties onNext={next} />}

        {step === 5 && <StepAvatarFinish />}

        <button className="skip-btn" onClick={skip}>Skip for now</button>
      </div>
    </div>
  );
}
