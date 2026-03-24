// client/src/features/PageNotFound/pages/PageNotFound.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff, Home } from 'lucide-react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import './PageNotFound.css';

const PageNotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="pnf-layout">
            <Header />
            
            <div className="pnf-main">
                <Sidebar />
                
                <div className="pnf-content">
                    <div className="pnf-card">
                        <div className="pnf-icon-wrapper">
                            <MapPinOff size={48} className="pnf-icon" />
                        </div>
                        
                        <div className="pnf-text-content">
                            <h1 className="pnf-error-code">404</h1>
                            <h2 className="pnf-title">Off the Map!</h2>
                            <p className="pnf-description">
                                We can't seem to find the page you're looking for. The property might have been moved, or the link might be broken.
                            </p>
                        </div>

                        <button 
                            className="pnf-home-btn"
                            onClick={() => navigate('/')}
                        >
                            <Home size={18} />
                            <span>Return to Homepage</span>
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PageNotFound;