import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../../../components/global/header';
import Footer from '../../../../../components/global/footer';
import MaintenanceSideBar from '../../SideBar/MaintenanceSideBar';
import {
    FaTools, FaCheckCircle, FaDollarSign, FaSearch,
    FaMapMarkerAlt, FaWrench, FaBolt, FaChevronRight,
    FaBell, FaClipboardCheck, FaCreditCard, FaStar, FaStarHalfAlt
} from 'react-icons/fa';
import './MaintenanceHome.css';

const MaintenanceHome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="maintenance-home-layout">
            <MaintenanceSideBar />

            <div className="maintenance-main-content">
                <Header />

                <div className="maintenance-content-scroll">
                    <div className="maintenance-dashboard-container">

                        {/* Welcome Section */}
                        <header className="welcome-section">
                            <div className="welcome-text">
                                <h1>Good Morning, <span className="highlight">Ahmed!</span></h1>
                                <p>You have 3 new job requests today</p>
                            </div>
                        </header>

                        {/* Quick Stats Cards */}
                        <section className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue"><FaSearch /></div>
                                <div className="stat-info">
                                    <h3 className="stat-value">5</h3>
                                    <p className="stat-label">Available Jobs</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon yellow"><FaWrench /></div>
                                <div className="stat-info">
                                    <h3 className="stat-value">2</h3>
                                    <p className="stat-label">In Progress</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green"><FaCheckCircle /></div>
                                <div className="stat-info">
                                    <h3 className="stat-value">18</h3>
                                    <p className="stat-label">Completed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple"><FaDollarSign /></div>
                                <div className="stat-info">
                                    <h3 className="stat-value">$1200</h3>
                                    <p className="stat-label">Earnings This Month</p>
                                </div>
                            </div>
                        </section>

                        {/* Main Grid Layout */}
                        <div className="dashboard-main-grid">

                            {/* Left Column (Job Previews) */}
                            <div className="grid-left">

                                {/* New Requests Preview */}
                                <div className="section-card">
                                    <div className="section-header">
                                        <h2>New Requests Preview</h2>
                                        <button className="view-all-btn" onClick={() => navigate('/available-jobs')}>
                                            View All Jobs <FaChevronRight />
                                        </button>
                                    </div>

                                    <div className="job-list">
                                        <div className="job-item">
                                            <div className="job-details">
                                                <div className="job-icon"><FaTools /></div>
                                                <div className="job-info">
                                                    <h4>Leaking sink</h4>
                                                    <div className="job-meta">
                                                        <span><FaMapMarkerAlt /> 2km away</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="job-action">
                                                <span className="price">$40</span>
                                            </div>
                                        </div>

                                        <div className="job-item">
                                            <div className="job-details">
                                                <div className="job-icon"><FaBolt /></div>
                                                <div className="job-info">
                                                    <h4>Electrical issue</h4>
                                                    <div className="job-meta">
                                                        <span><FaMapMarkerAlt /> 5km away</span>
                                                        <span style={{ color: '#ef4444', fontWeight: 600 }}>Urgent</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="job-action">
                                                <span className="price">$60</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Jobs Preview */}
                                <div className="Active-jobs-section-card">
                                    <div className="section-header">
                                        <h2>Active Jobs</h2>
                                    </div>

                                    <div className="job-list">
                                        <div className="job-item">
                                            <div className="job-details">
                                                <div className="job-icon"><FaWrench /></div>
                                                <div className="job-info">
                                                    <h4>Kitchen repair</h4>
                                                    <div className="job-meta">
                                                        <span>Assigned today</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="job-action">
                                                <span className="status-badge in-progress">In Progress</span>
                                            </div>
                                        </div>

                                        <div className="job-item">
                                            <div className="job-details">
                                                <div className="job-icon"><FaTools /></div>
                                                <div className="job-info">
                                                    <h4>Bathroom fix</h4>
                                                    <div className="job-meta">
                                                        <span>Scheduled</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="job-action">
                                                <span className="status-badge scheduled">Tomorrow</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Right Column (Notifications Panel) */}
                            <div className="grid-right">

                                <div className="notif-premium">
                                    <header className="notif-header">
                                        <div className="notif-title-group">
                                            <div className="bell-ring">
                                                <FaBell />
                                                <span className="active-dot"></span>
                                            </div>
                                            <h3>Activity Feed</h3>
                                        </div>
                                    </header>

                                    <div className="notif-scroll-area">
                                        {/* Notification 1 */}
                                        <div className="notif-card is-unread">
                                            <div className="icon-orb system">
                                                <FaClipboardCheck />
                                            </div>
                                            <div className="notif-body">
                                                <div className="notif-meta">
                                                    <span className="notif-subject">New Job Posted</span>
                                                    <span className="notif-timestamp">10m ago</span>
                                                </div>
                                                <p className="notif-text">A new plumbing job is available near you.</p>
                                            </div>
                                        </div>

                                        {/* Notification 2 */}
                                        <div className="notif-card">
                                            <div className="icon-orb maintenance">
                                                <FaWrench />
                                            </div>
                                            <div className="notif-body">
                                                <div className="notif-meta">
                                                    <span className="notif-subject">Job Assigned</span>
                                                    <span className="notif-timestamp">2h ago</span>
                                                </div>
                                                <p className="notif-text">You have been assigned to "Kitchen repair".</p>
                                            </div>
                                        </div>

                                        {/* Notification 3 */}
                                        <div className="notif-card">
                                            <div className="icon-orb payment">
                                                <FaCreditCard />
                                            </div>
                                            <div className="notif-body">
                                                <div className="notif-meta">
                                                    <span className="notif-subject">Payment Received</span>
                                                    <span className="notif-timestamp">1d ago</span>
                                                </div>
                                                <p className="notif-text">Received $120 for "AC maintenance".</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Card */}
                                <div className="rating-premium-card">
                                    <div className="rating-header">
                                        <h3>Your Rating</h3>
                                        <div className="rating-score-badge">Top Rated</div>
                                    </div>
                                    <div className="rating-body">
                                        <div className="rating-big-score">
                                            <span>4.8</span>
                                            <span className="rating-max">/ 5</span>
                                        </div>
                                        <div className="rating-stars">
                                            <FaStar className="star-filled" />
                                            <FaStar className="star-filled" />
                                            <FaStar className="star-filled" />
                                            <FaStar className="star-filled" />
                                            <FaStarHalfAlt className="star-filled" />
                                        </div>
                                        <p className="rating-text">Based on 45 customer reviews.</p>
                                    </div>
                                    <button className="view-reviews-btn">
                                        View All Reviews <FaChevronRight />
                                    </button>
                                </div>

                            </div>

                        </div>
                    </div>

                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default MaintenanceHome;
