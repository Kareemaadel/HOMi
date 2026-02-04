import { useState } from "react";
import StepGuidelines from "../components/onboarding/StepGuidelines";
import StepUserType from "../components/onboarding/StepUserType";
import TenantCredentials from "../components/onboarding/TenantCredentials";
import TenantLifestyle from "../components/onboarding/TenantLifestyle";
import LandlordCredentials from "../components/onboarding/LandlordCredentials";
import LandlordProperties from "../components/onboarding/LandlordProperties";
import StepAvatarFinish from "../components/onboarding/StepAvatarFinish";
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
