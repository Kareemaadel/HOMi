import React, { useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import DetailedPropertyCard from '../components/DetailedPropertyCard';
import AddPropertyModal from '../../home/components/LandlordHomeComponents/AddPropertyModal'; // Import modal
import { FiPlus, FiHome } from 'react-icons/fi'; // Icons for the button
import './MyProperties.css';

const MyProperties = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const myProperties = [
    { id: 1, name: "Skyline Apartments", address: "Downtown, Unit 402", status: "rented", price: "$2,400", beds: 2, baths: 2, sqft: "1,100", tenantName: "John Doe", leaseEnd: "Dec 2026", yield: "6.4" },
    { id: 2, name: "Oak Ridge Villa", address: "Suburban St. 12", status: "available", price: "$1,850", beds: 4, baths: 3, sqft: "2,500", tenantName: null, leaseEnd: null, yield: "5.2" },
    { id: 3, name: "Sunset Loft", address: "Beachside Ave 5", status: "pending", price: "$3,100", beds: 1, baths: 1, sqft: "850", tenantName: "Sarah Smith", leaseEnd: "Jan 2027", yield: "7.1" },
    { id: 4, name: "Emerald Gardens", address: "North District, Bld 4", status: "rented", price: "$2,200", beds: 3, baths: 2, sqft: "1,400", tenantName: "Mike Ross", leaseEnd: "Oct 2026", yield: "5.8" },
  ];

  return (
    <div className="landlord-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="my-properties-container">
          
          <div className="my-props-header">
            <div className="header-left">
              <h1>Portfolio</h1>
              <p>Managing {myProperties.length} total units</p>
            </div>
            
            <button className="add-prop-primary-btn" onClick={() => setIsModalOpen(true)}>
              <div className="btn-icon-circle">
                <FiPlus />
              </div>
              <span className="new-prop-btn-text">Add New Property</span>
            </button>
          </div>

          <div className="detailed-list-wrapper">
            {myProperties.map(prop => (
              <DetailedPropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </main>
        <Footer />
      </div>

      {isModalOpen && (
        <AddPropertyModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default MyProperties;