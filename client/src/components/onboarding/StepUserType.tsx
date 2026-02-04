import { User, Building } from "lucide-react";
import type { UserType } from "../../pages/CompleteProfile";

export default function StepUserType({ setUserType, onNext }:{
  setUserType:(t:UserType)=>void; onNext:()=>void;
}) {
  return (
    <div className="step">
      <h2>I am a...</h2>
      <div className="choice-grid">
        <div className="choice" onClick={()=>{setUserType("tenant"); onNext();}}>
          <User size={40}/> Tenant
        </div>
        <div className="choice" onClick={()=>{setUserType("landlord"); onNext();}}>
          <Building size={40}/> Landlord
        </div>
      </div>
    </div>
  );
}
