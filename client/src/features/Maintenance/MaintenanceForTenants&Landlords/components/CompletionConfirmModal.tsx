import React, { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaStar, FaImage, FaExclamationTriangle, FaTools } from 'react-icons/fa';
import maintenanceService, {
    type MaintenanceRequest,
} from '../../../../services/maintenance.service';
import './CompletionConfirmModal.css';

type Stage = 'review' | 'rate' | 'dispute' | 'success';

interface Props {
    request: MaintenanceRequest;
    onResolved: (updated: MaintenanceRequest) => void;
}

/**
 * A FORCED, non-dismissible modal that the tenant must answer once their job has
 * been marked as complete by the provider. They must either confirm and rate
 * the maintainer (which releases escrow) or open a dispute.
 */
const CompletionConfirmModal: React.FC<Props> = ({ request, onResolved }) => {
    const [stage, setStage] = useState<Stage>('review');
    const [rating, setRating] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    const [disputeReason, setDisputeReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const stop = (e: KeyboardEvent) => {
            if (e.key === 'Escape') e.preventDefault();
        };
        window.addEventListener('keydown', stop);
        return () => window.removeEventListener('keydown', stop);
    }, []);

    const submitSolved = async () => {
        if (rating < 1 || rating > 5) {
            setError('Please choose a rating between 1 and 5 stars.');
            return;
        }
        try {
            setError(null);
            setIsSubmitting(true);
            const updated = await maintenanceService.confirmCompletion(request.id, {
                solved: true,
                rating,
                ratingComment: ratingComment.trim() || null,
            });
            setStage('success');
            onResolved(updated);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Could not confirm completion.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitDispute = async () => {
        if (!disputeReason.trim()) {
            setError('Tell us why the issue is not resolved.');
            return;
        }
        try {
            setError(null);
            setIsSubmitting(true);
            const updated = await maintenanceService.confirmCompletion(request.id, {
                solved: false,
                disputeReason: disputeReason.trim(),
            });
            setStage('success');
            onResolved(updated);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Could not submit dispute.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const completionImages = request.completionImages ?? [];

    return (
        <div className="ccm-overlay">
            <div className="ccm-card">
                <header className="ccm-header">
                    <FaTools />
                    <h2>Job marked complete — please confirm</h2>
                </header>

                {error && <div className="ccm-error">{error}</div>}

                {stage === 'review' && (
                    <div className="ccm-body">
                        <p className="ccm-subtitle">
                            Your maintainer{' '}
                            <strong>
                                {request.provider?.businessName ??
                                    `${request.provider?.firstName ?? ''} ${request.provider?.lastName ?? ''}`.trim() ??
                                    'the maintainer'}
                            </strong>{' '}
                            has marked the issue <em>"{request.title}"</em> as fixed for EGP {Number(request.agreedPrice ?? 0).toFixed(2)}.
                            Please review the photos they uploaded and confirm.
                        </p>

                        <div className="ccm-photos">
                            {completionImages.length === 0 ? (
                                <div className="ccm-photos-empty"><FaImage /> No images submitted</div>
                            ) : (
                                completionImages.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer">
                                        <img src={url} alt={`completion ${i + 1}`} />
                                    </a>
                                ))
                            )}
                        </div>

                        {request.completionNotes && (
                            <div className="ccm-notes">
                                <strong>Maintainer note:</strong>
                                <p>{request.completionNotes}</p>
                            </div>
                        )}

                        <div className="ccm-actions">
                            <button
                                className="ccm-btn ccm-btn-success"
                                onClick={() => setStage('rate')}
                                disabled={isSubmitting}
                            >
                                <FaCheck /> Yes, the issue is solved
                            </button>
                            <button
                                className="ccm-btn ccm-btn-danger"
                                onClick={() => setStage('dispute')}
                                disabled={isSubmitting}
                            >
                                <FaExclamationTriangle /> No, the issue is NOT solved
                            </button>
                        </div>

                        <p className="ccm-hint">
                            By confirming, the escrowed amount is released to the maintainer. By disputing, the case
                            is forwarded to the HOMi admin team for review.
                        </p>
                    </div>
                )}

                {stage === 'rate' && (
                    <div className="ccm-body">
                        <h3>Rate the maintainer</h3>
                        <p className="ccm-subtitle">Your rating helps the HOMi community.</p>
                        <div className="ccm-stars">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`ccm-star ${n <= rating ? 'on' : ''}`}
                                    onClick={() => setRating(n)}
                                    aria-label={`Rate ${n} stars`}
                                >
                                    <FaStar />
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="ccm-textarea"
                            placeholder="Add a short review (optional)…"
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            rows={3}
                        />
                        <div className="ccm-actions">
                            <button className="ccm-btn ccm-btn-secondary" onClick={() => setStage('review')} disabled={isSubmitting}>Back</button>
                            <button className="ccm-btn ccm-btn-success" onClick={submitSolved} disabled={isSubmitting}>
                                {isSubmitting ? 'Releasing payment…' : 'Confirm & release payment'}
                            </button>
                        </div>
                    </div>
                )}

                {stage === 'dispute' && (
                    <div className="ccm-body">
                        <h3>Open a dispute</h3>
                        <p className="ccm-subtitle">Explain what is still wrong. The HOMi admin team will review the full case.</p>
                        <textarea
                            className="ccm-textarea"
                            placeholder="Describe what is still wrong…"
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            rows={4}
                        />
                        <div className="ccm-actions">
                            <button className="ccm-btn ccm-btn-secondary" onClick={() => setStage('review')} disabled={isSubmitting}>Back</button>
                            <button className="ccm-btn ccm-btn-danger" onClick={submitDispute} disabled={isSubmitting}>
                                {isSubmitting ? 'Sending…' : 'Submit dispute'}
                            </button>
                        </div>
                    </div>
                )}

                {stage === 'success' && (
                    <div className="ccm-body ccm-success">
                        <div className="ccm-success-icon"><FaCheck /></div>
                        <h3>Thanks!</h3>
                        <p className="ccm-subtitle">We've recorded your decision. You can close this dialog.</p>
                        <button className="ccm-btn ccm-btn-success" onClick={() => onResolved(request)}>
                            <FaTimes /> Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletionConfirmModal;
