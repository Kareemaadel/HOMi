import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import { contractService } from '../../../services/contract.service';
import './PaymobVerify.css';

type VerifyState = 'loading' | 'success' | 'failed';

const PaymobVerify: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [state, setState] = useState<VerifyState>('loading');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        let mounted = true;

        const runVerification = async () => {
            const contractId = searchParams.get('contractId') || '';
            const transactionIdRaw = searchParams.get('id') || searchParams.get('transaction_id') || '';
            const successFlag = searchParams.get('success');
            const transactionId = Number(transactionIdRaw);

            if (!contractId || !transactionIdRaw || !Number.isFinite(transactionId) || transactionId <= 0) {
                if (!mounted) return;
                setState('failed');
                setMessage('Missing payment callback data. Please retry payment from the contract page.');
                return;
            }

            if (successFlag === 'false') {
                if (!mounted) return;
                setState('failed');
                setMessage('Payment was not completed. Please try again.');
                return;
            }

            try {
                await contractService.verifyPaymobPayment(contractId, transactionId);
                if (!mounted) return;
                setState('success');
                setMessage('Payment verified successfully. Your contract is now active.');

                setTimeout(() => {
                    navigate('/tenant-payment', { replace: true, state: { tab: 'history' } });
                }, 1800);
            } catch {
                if (!mounted) return;
                setState('failed');
                setMessage('Payment verification failed. Please try payment again from Pre-Payment page.');
            }
        };

        void runVerification();

        return () => {
            mounted = false;
        };
    }, [navigate, searchParams]);

    return (
        <div className="paymob-verify-wrapper">
            <Header />
            <div className="paymob-verify-container">
                <Sidebar />
                <main className="paymob-verify-main">
                    <section className={`verify-card ${state}`}>
                        <h1>
                            {state === 'loading' && 'Verifying Payment'}
                            {state === 'success' && 'Payment Confirmed'}
                            {state === 'failed' && 'Verification Failed'}
                        </h1>
                        <p>{message}</p>

                        {state !== 'loading' && (
                            <div className="verify-actions">
                                <button type="button" onClick={() => navigate('/prepayment-page')}>
                                    Back to Pre-Payment
                                </button>
                                <button type="button" onClick={() => navigate('/tenant-contracts')}>
                                    Go to Contracts
                                </button>
                            </div>
                        )}
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default PaymobVerify;
