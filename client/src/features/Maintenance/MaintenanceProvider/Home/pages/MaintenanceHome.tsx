import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const hasData = true; // Toggle this to test empty states

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
                                <h1>{t('maintenanceHome.goodMorning')}, <span className="highlight">Ahmed!</span></h1>
                                <p>{hasData ? t('maintenanceHome.jobRequestsCount', { count: 3 }) : t('maintenanceHome.noJobRequests')}</p>
                            </div>
                        </header>

                        {/* Quick Stats Cards */}
                        <section className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue"><FaSearch /></div>
                                <div className="stat-info">
                                    <h3 className="stat-value">{hasData ? "5" : "0"}</h3>
                                    <p className="stat-label">{t('maintenanceHome.availableJobs')}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon yellow"><FaWrench /></div>
                                <div className="stat-info">
                                    <h3 className="stat-value">{hasData ? "2" : "0"}</h3>
                                    <p className="stat-label">{t('maintenanceHome.inProgress')}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green"><FaCheckCircle /></div>
                                <div className="stat-info">
                                    <h3 className="stat-value">{hasData ? "18" : "0"}</h3>
                                    <p className="stat-label">{t('maintenanceHome.completed')}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple"><FaDollarSign /></div>
                                <div className="stat-info">
                                    <h3 className="stat-value">{hasData ? "$1200" : "$0"}</h3>
                                    <p className="stat-label">{t('maintenanceHome.earningsThisMonth')}</p>
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
                                        <h2>{t('maintenanceHome.newRequestsPreview')}</h2>
                                        <button className="view-all-btn" onClick={() => navigate('/available-jobs')}>
                                            {t('maintenanceHome.viewAllJobs')} <FaChevronRight />
                                        </button>
                                    </div>

                                    <div className="job-list">
                                        {hasData ? (
                                            <>
                                                <div className="job-item">
                                                    <div className="job-details">
                                                        <div className="job-icon"><FaTools /></div>
                                                        <div className="job-info">
                                                            <h4>Leaking sink</h4>
                                                            <div className="job-meta">
                                                                <span><FaMapMarkerAlt /> Cairo (2km away)</span>
                                                                <span>Plumbing</span>
                                                                <span>Oct 24, 2023</span>
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
                                                                <span><FaMapMarkerAlt /> Giza (5km away)</span>
                                                                <span>Electrical</span>
                                                                <span>Oct 23, 2023</span>
                                                                <span style={{ color: '#ef4444', fontWeight: 600 }}>{t('maintenanceHome.urgent')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="job-action">
                                                        <span className="price">$60</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="empty-state-card-mini">
                                                <div className="empty-icon"><FaSearch /></div>
                                                <p>{t('maintenanceHome.noNewRequests')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Active Jobs Preview */}
                                <div className="Active-jobs-section-card">
                                    <div className="section-header">
                                        <h2>{t('maintenanceHome.activeJobs')}</h2>
                                    </div>

                                    <div className="job-list">
                                        {hasData ? (
                                            <>
                                                <div className="job-item">
                                                    <div className="job-details">
                                                        <div className="job-icon"><FaWrench /></div>
                                                        <div className="job-info">
                                                            <h4>Kitchen repair</h4>
                                                            <div className="job-meta">
                                                                <span><FaMapMarkerAlt /> Maadi (3km away)</span>
                                                                <span>Appliance</span>
                                                                <span>Oct 22, 2023</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="job-action">
                                                        <span className="status-badge in-progress">{t('maintenanceHome.inProgress')}</span>
                                                        <span className="price" style={{ marginLeft: '10px' }}>$80</span>
                                                    </div>
                                                </div>

                                                <div className="job-item">
                                                    <div className="job-details">
                                                        <div className="job-icon"><FaTools /></div>
                                                        <div className="job-info">
                                                            <h4>Bathroom fix</h4>
                                                            <div className="job-meta">
                                                                <span><FaMapMarkerAlt /> Nasr City (8km away)</span>
                                                                <span>Plumbing</span>
                                                                <span>Oct 21, 2023</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="job-action">
                                                        <span className="status-badge scheduled">{t('maintenanceHome.tomorrow')}</span>
                                                        <span className="price" style={{ marginLeft: '10px' }}>$120</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="empty-state-card-mini">
                                                <div className="empty-icon"><FaTools /></div>
                                                <p>{t('maintenanceHome.noActiveJobs')}</p>
                                            </div>
                                        )}
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
                                            <h3>{t('maintenanceHome.activityFeed')}</h3>
                                        </div>
                                    </header>

                                    <div className="notif-scroll-area">
                                        {hasData ? (
                                            <>
                                                {/* Notification 1 */}
                                                <div className="notif-card is-unread">
                                                    <div className="icon-orb system">
                                                        <FaClipboardCheck />
                                                    </div>
                                                    <div className="notif-body">
                                                        <div className="notif-meta">
                                                            <span className="notif-subject">{t('maintenanceHome.newJobPosted')}</span>
                                                            <span className="notif-timestamp">{t('maintenanceHome.ago', { count: 10 })}</span>
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
                                                            <span className="notif-subject">{t('maintenanceHome.jobAssigned')}</span>
                                                            <span className="notif-timestamp">{t('maintenanceHome.ago', { count: 120 })}</span>
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
                                                            <span className="notif-subject">{t('maintenanceHome.paymentReceived')}</span>
                                                            <span className="notif-timestamp">{t('maintenanceHome.ago', { count: 1440 })}</span>
                                                        </div>
                                                        <p className="notif-text">Received $120 for "AC maintenance".</p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="empty-state-feed">
                                                <div className="empty-feed-icon"><FaBell /></div>
                                                <p>{t('maintenanceHome.stayTuned')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rating Card */}
                                <div className="rating-premium-card">
                                    <div className="rating-header">
                                        <h3>{t('maintenanceHome.yourRating')}</h3>
                                    </div>
                                    <div className="rating-body">
                                        <div className="rating-big-score">
                                            <span>{hasData ? "4.8" : "0.0"}</span>
                                            <span className="rating-max">/ 5</span>
                                        </div>
                                        <div className="rating-stars">
                                            {hasData ? (
                                                <>
                                                    <FaStar className="star-filled" />
                                                    <FaStar className="star-filled" />
                                                    <FaStar className="star-filled" />
                                                    <FaStar className="star-filled" />
                                                    <FaStarHalfAlt className="star-filled" />
                                                </>
                                            ) : (
                                                <>
                                                    <FaStar className="star-empty" />
                                                    <FaStar className="star-empty" />
                                                    <FaStar className="star-empty" />
                                                    <FaStar className="star-empty" />
                                                    <FaStar className="star-empty" />
                                                </>
                                            )}
                                        </div>
                                        <p className="rating-text">
                                            {hasData ? t('maintenanceHome.basedOnReviews', { count: 45 }) : t('maintenanceHome.noReviewsYet')}
                                        </p>
                                    </div>
                                    {hasData && (
                                        <button className="view-reviews-btn">
                                            {t('maintenanceHome.viewAllReviews')} <FaChevronRight />
                                        </button>
                                    )}
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
