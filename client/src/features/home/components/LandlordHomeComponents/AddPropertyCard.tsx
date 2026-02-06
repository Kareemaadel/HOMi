import React from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import './AddPropertyCard.css';

const AddPropertyCard = () => {
  return (
    <div className="add-property-card">
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