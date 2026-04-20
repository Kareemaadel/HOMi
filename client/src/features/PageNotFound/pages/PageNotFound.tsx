import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Compass } from 'lucide-react';
import './PageNotFound.css';

const PageNotFound = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const previous = document.title;
        document.title = 'Page not found | HOMI';
        return () => {
            document.title = previous;
        };
    }, []);

    return (
        <div className="pnf-shell" role="main">
            <div className="pnf-bg" aria-hidden="true" />
            <div className="pnf-inner">
                <header className="pnf-brand">
                    <img src="/logo.png" alt="HOMI" className="pnf-logo" width={160} height={48} />
                    {/* <span className="pnf-brand-name">HOMI</span> */}
                </header>

                <div className="pnf-panel">
                    <p className="pnf-badge" aria-hidden="true">
                        <span className="pnf-badge-dot" />
                        Error 404
                    </p>
                    <h1 className="pnf-headline">This page does not exist</h1>
                    <p className="pnf-lede">
                        The address may be mistyped, or the page was moved. Check the URL or head back to a familiar place on HOMI.
                    </p>

                    <div className="pnf-actions">
                        <button
                            type="button"
                            className="pnf-btn pnf-btn-primary"
                            onClick={() => navigate('/', { replace: true })}
                        >
                            <Home size={18} strokeWidth={2.25} aria-hidden />
                            Go to home
                        </button>
                        <Link to="/guest-home" className="pnf-btn pnf-btn-secondary">
                            <Compass size={18} strokeWidth={2.25} aria-hidden />
                            Explore HOMI
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="pnf-back"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} strokeWidth={2.25} aria-hidden />
                        Go back
                    </button>
                </div>

                <p className="pnf-code" aria-hidden="true">404</p>
            </div>
        </div>
    );
};

export default PageNotFound;
