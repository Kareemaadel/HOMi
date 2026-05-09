import React, { useRef, useState, useEffect } from 'react';
import { X, Pencil, Upload, Trash2, ShieldCheck } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import './SignatureModal.css';
import { useTranslation } from 'react-i18next';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureData: string) => void;
}

const SignatureModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    const isAr = document.documentElement.lang?.toLowerCase().startsWith('ar');
    const [mode, setMode] = useState<'draw' | 'upload'>('draw');
    const sigCanvas = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showUploadGuide, setShowUploadGuide] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const syncCanvasSize = () => {
        if (containerRef.current && sigCanvas.current) {
            const canvas = sigCanvas.current.getCanvas();
            const data = sigCanvas.current.toData();
            const width = containerRef.current.offsetWidth;
            if (canvas.width !== width) {
                canvas.width = width;
                canvas.height = 200;
                sigCanvas.current.fromData(data);
            }
        }
    };

    useEffect(() => {
        if (isOpen && mode === 'draw') {
            const timer = setTimeout(syncCanvasSize, 100);
            window.addEventListener('resize', syncCanvasSize);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', syncCanvasSize);
            };
        }
    }, [isOpen, mode]);

    useEffect(() => {
        return () => {
            if (cameraStreamRef.current) {
                cameraStreamRef.current.getTracks().forEach((track) => track.stop());
                cameraStreamRef.current = null;
            }
        };
    }, []);

    if (!isOpen) return null;

    const stopCamera = () => {
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach((track) => track.stop());
            cameraStreamRef.current = null;
        }
        setShowCamera(false);
    };

    const startCamera = async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });
            cameraStreamRef.current = stream;
            setShowCamera(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch {
            setCameraError(t('signature.cameraAccessFailed'));
            setShowCamera(false);
        }
    };

    const captureFromCamera = () => {
        const video = videoRef.current;
        if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) return;

        const frameWidth = video.videoWidth;
        const frameHeight = video.videoHeight;
        const cropWidth = Math.floor(frameWidth * 0.82);
        const cropHeight = Math.floor(frameHeight * 0.38);
        const sx = Math.floor((frameWidth - cropWidth) / 2);
        const sy = Math.floor((frameHeight - cropHeight) / 2);

        const canvas = document.createElement('canvas');
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        setUploadedImage(canvas.toDataURL('image/png'));
        stopCamera();
    };

    const onUploadTabClick = () => {
        setMode('upload');
        setShowUploadGuide(true);
    };

    const handleSave = () => {
        if (mode === 'draw') {
            const canvas = sigCanvas.current;
            if (canvas && !canvas.isEmpty()) {
                onSave(canvas.getCanvas().toDataURL('image/png'));
            } else {
                alert(t('signature.pleaseDrawSignature'));
            }
        } else if (mode === 'upload' && uploadedImage) {
            onSave(uploadedImage);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="signature-modal animate-in">
                <header className="modal-header">
                    <div><h3>{t('signature.digitalSignature')}</h3><p>{t('signature.signWithinBox')}</p></div>
                    <button className="close-btn" onClick={onClose}><X size={20}/></button>
                </header>
                <div className="modal-tabs">
                    <button className={mode === 'draw' ? 'active' : ''} onClick={() => setMode('draw')}><Pencil size={16}/> {t('signature.draw')}</button>
                    <button className={mode === 'upload' ? 'active' : ''} onClick={onUploadTabClick}><Upload size={16}/> {t('signature.upload')}</button>
                </div>
                <div className="signature-content">
                    {mode === 'draw' ? (
                        <div className="canvas-container" ref={containerRef}>
                            <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ className: 'sig-canvas' }} />
                            <button className="clear-link" onClick={() => sigCanvas.current?.clear()}><Trash2 size={14}/> {t('signature.clear')}</button>
                        </div>
                    ) : (
                        <div className="upload-container">
                            {uploadedImage ? (
                                <div className="preview-wrap"><img src={uploadedImage} alt="Upload" /><button className="clear-link" onClick={() => setUploadedImage(null)}>{t('signature.remove')}</button></div>
                            ) : (
                                <div className="upload-dropzone">
                                    <Upload size={32} />
                                    <span>{t('signature.uploadImagePNG')}</span>
                                    <button className="btn-secondary" type="button" onClick={() => setShowUploadGuide(true)}>
                                        {t('signature.openUploadGuide')}
                                    </button>
                                    <input ref={fileInputRef} type="file" hidden onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onloadend = () => setUploadedImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }} accept="image/*" capture="environment" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <footer className="modal-footer">
                    <div className="security-tag"><ShieldCheck size={14} /> {t('signature.secureESign')}</div>
                    <div className="footer-actions"><button className="btn-secondary" onClick={onClose}>{t('signature.cancel')}</button><button className="btn-primary" onClick={handleSave}>{t('signature.confirmSignature')}</button></div>
                </footer>

                {showUploadGuide && (
                    <div className="guide-overlay">
                        <div className="guide-modal" dir={isAr ? 'rtl' : 'ltr'}>
                            <h4>{t('signature.uploadGuideTitle')}</h4>
                            <ol>
                                <li>{t('signature.uploadGuideStep1')}</li>
                                <li>{t('signature.uploadGuideStep2')}</li>
                                <li>{t('signature.uploadGuideStep3')}</li>
                            </ol>
                            <div className="guide-actions">
                                <button className="btn-secondary" type="button" onClick={() => setShowUploadGuide(false)}>
                                    {t('signature.cancel')}
                                </button>
                                <button
                                    className="btn-primary"
                                    type="button"
                                    onClick={async () => {
                                        setShowUploadGuide(false);
                                        await startCamera();
                                    }}
                                >
                                    {t('signature.openCamera')}
                                </button>
                            </div>
                            {cameraError && <p className="camera-error">{cameraError}</p>}
                        </div>
                    </div>
                )}

                {showCamera && (
                    <div className="guide-overlay">
                        <div className="camera-modal">
                            <h4>{t('signature.cameraFrameTitle')}</h4>
                            <div className="camera-stage">
                                <video ref={videoRef} autoPlay playsInline muted />
                                <div className="camera-rect" />
                            </div>
                            <div className="guide-actions">
                                <button className="btn-secondary" type="button" onClick={stopCamera}>
                                    {t('common.close')}
                                </button>
                                <button className="btn-secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                                    {t('signature.chooseFromGallery')}
                                </button>
                                <button className="btn-primary" type="button" onClick={captureFromCamera}>
                                    {t('signature.capture')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignatureModal;