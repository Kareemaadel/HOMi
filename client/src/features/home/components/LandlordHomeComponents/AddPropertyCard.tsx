// client\src\features\home\components\LandlordHomeComponents\AddPropertyCard.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlusCircle } from 'react-icons/fa';
import './AddPropertyCard.css';

// Define the interface for props
interface AddPropertyCardProps {
    onClick?: () => void;
}

const AddPropertyCard: React.FC<AddPropertyCardProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <div className="add-property-card" onClick={onClick}>
      <div className="dotted-border">
        <div className="add-content">
          <div className="plus-icon"><FaPlusCircle /></div>
          <h3>{t('landlordHomeComponents.addNewProperty')}</h3>
          <p>{t('landlordHomeComponents.listNewUnit')}</p>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyCard;