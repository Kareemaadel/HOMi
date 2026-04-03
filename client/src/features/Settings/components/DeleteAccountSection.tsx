import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaExclamationTriangle } from 'react-icons/fa';
import authService from '../../../services/auth.service';

type DeleteAccountSectionProps = {
    onBackToProfile?: () => void;
};

export type AccountDeleteBlockers = {
    propertyCount: number;
    rentalRequestCount: number;
    contractCount: number;
};

function parseDeleteAccountError(err: unknown): { message: string; blockers?: AccountDeleteBlockers } {
    if (!axios.isAxiosError(err)) {
        return { message: 'Something went wrong. Please try again.' };
    }
    const data = err.response?.data as
        | { message?: string; code?: string; details?: AccountDeleteBlockers }
        | undefined;
    if (!data?.message) {
        return { message: 'Something went wrong. Please try again.' };
    }
    if (data.code === 'ACCOUNT_HAS_DEPENDENCIES' && data.details) {
        return { message: data.message, blockers: data.details };
    }
    return { message: data.message };
}

const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({ onBackToProfile }) => {
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<{ message: string; blockers?: AccountDeleteBlockers } | null>(null);

    const handleConfirmDelete = async () => {
        setError(null);
        setDeleting(true);
        try {
            await authService.deleteAccount();
            setShowConfirm(false);
            navigate('/auth', { replace: true });
        } catch (err) {
            setError(parseDeleteAccountError(err));
            setShowConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="delete-zone-container animate-fade-in">
                <div className="danger-icon-wrapper">
                    <FaExclamationTriangle />
                </div>
                <h2>Delete Account</h2>
                <p>
                    This action is <strong>irreversible</strong>. If your account has no property listings,
                    rental applications, or contracts, we will permanently remove your profile and sign-in.
                </p>
                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                    If you still have properties, rental requests, or contracts, deletion is blocked until
                    those are resolved.
                </p>

                {error && (
                    <div
                        style={{
                            marginTop: '1.25rem',
                            textAlign: 'left',
                            padding: '12px 14px',
                            borderRadius: 10,
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#b91c1c',
                            fontSize: 14,
                            lineHeight: 1.5,
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: error.blockers ? 8 : 0 }}>Cannot delete account</div>
                        <div>{error.message}</div>
                        {error.blockers && (
                            <ul style={{ margin: '10px 0 0', paddingLeft: 20 }}>
                                {error.blockers.propertyCount > 0 && (
                                    <li>
                                        Properties (landlord): {error.blockers.propertyCount}
                                    </li>
                                )}
                                {error.blockers.rentalRequestCount > 0 && (
                                    <li>
                                        Rental requests: {error.blockers.rentalRequestCount}
                                    </li>
                                )}
                                {error.blockers.contractCount > 0 && (
                                    <li>Contracts: {error.blockers.contractCount}</li>
                                )}
                            </ul>
                        )}
                    </div>
                )}

                <div className="delete-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => (onBackToProfile ? onBackToProfile() : navigate(-1))}
                    >
                        Keep My Account
                    </button>
                    <button
                        type="button"
                        className="danger-confirm-btn"
                        disabled={deleting}
                        onClick={() => {
                            setError(null);
                            setShowConfirm(true);
                        }}
                    >
                        Permanently Delete
                    </button>
                </div>
            </div>

            {showConfirm && (
                <div
                    className="delete-confirm-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-account-confirm-title"
                    onClick={() => !deleting && setShowConfirm(false)}
                >
                    <div
                        className="delete-confirm-dialog"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="delete-account-confirm-title" style={{ margin: '0 0 10px', fontSize: 18 }}>
                            Delete your account?
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.55 }}>
                            This cannot be undone. Your profile and account will be permanently removed if you
                            have no active listings, rental requests, or contracts.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="cancel-btn"
                                disabled={deleting}
                                onClick={() => setShowConfirm(false)}
                            >
                                No, keep my account
                            </button>
                            <button
                                type="button"
                                className="danger-confirm-btn"
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                            >
                                {deleting ? 'Deleting…' : 'Yes, delete forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeleteAccountSection;
