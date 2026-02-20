// client\src\features\home\components\LandlordHomeComponents\AddPropertyCard.tsx
import React from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import './AddPropertyCard.css';

// Define the interface for props
interface AddPropertyCardProps {
    onClick?: () => void;
}

const AddPropertyCard: React.FC<AddPropertyCardProps> = ({ onClick }) => {
  return (
    <div className="add-property-card" onClick={onClick}>
      <div className="dotted-border">
        <div className="add-content">
          <div className="plus-icon"><FaPlusCircle /></div>
          <h3>Add New Property</h3>
          <p>List a new unit to your portfolio</p>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyCard;