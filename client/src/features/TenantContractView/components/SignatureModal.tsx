import React, { useRef, useState, useEffect } from 'react';
import { X, Pencil, Upload, Trash2, ShieldCheck } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import './SignatureModal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureData: string) => void;
}

const SignatureModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [mode, setMode] = useState<'draw' | 'upload'>('draw');
    const sigCanvas = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    // This is the magic fix: Sync the internal canvas pixels with the CSS container size
    const syncCanvasSize = () => {
        if (containerRef.current && sigCanvas.current) {
            const canvas = sigCanvas.current.getCanvas();
            const data = sigCanvas.current.toData(); // save strokes

            const width = containerRef.current.offsetWidth;
            const height = 200;

            if (canvas.width !== width) {
                canvas.width = width;
                canvas.height = height;

                sigCanvas.current.fromData(data); // restore strokes
            }
        }
    };

    useEffect(() => {
        if (isOpen && mode === 'draw') {
            // Wait slightly for the modal animation to finish, then sync size
            const timer = setTimeout(syncCanvasSize, 100);
            window.addEventListener('resize', syncCanvasSize);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', syncCanvasSize);
            };
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const handleClear = () => {
        if (mode === 'draw') {
            sigCanvas.current?.clear();
        } else {
            setUploadedImage(null);
        }
    };

    const handleSave = () => {
        if (mode === 'draw') {
            const canvas = sigCanvas.current;

            if (canvas && canvas.toData().length > 0) {
                const dataURL = canvas.getTrimmedCanvas().toDataURL('image/png');
                onSave(dataURL);
            } else {
                alert("Please draw your signature first.");
            }
        } 
        else if (mode === 'upload' && uploadedImage) {
            onSave(uploadedImage);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="signature-modal animate-in">
                <header className="modal-header">
                    <div>
                        <h3>Digital Signature</h3>
                        <p>Sign clearly within the box</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20}/></button>
                </header>

                <div className="modal-tabs">
                    <button className={mode === 'draw' ? 'active' : ''} onClick={() => setMode('draw')}>
                        <Pencil size={16}/> Draw
                    </button>
                    <button className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}>
                        <Upload size={16}/> Upload
                    </button>
                </div>

                <div className="signature-content">
                    {mode === 'draw' ? (
                        <div className="canvas-container" ref={containerRef}>
                            <SignatureCanvas 
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{ className: 'sig-canvas' }}
                            />
                            <button className="clear-link" onClick={handleClear}>
                                <Trash2 size={14}/> Clear
                            </button>
                        </div>
                    ) : (
                        <div className="upload-container">
                            {uploadedImage ? (
                                <div className="preview-wrap">
                                    <img src={uploadedImage} alt="Uploaded" />
                                    <button className="clear-link" onClick={handleClear}>Remove</button>
                                </div>
                            ) : (
                                <label className="upload-dropzone">
                                    <Upload size={32} />
                                    <span>Upload Image (PNG)</span>
                                    <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                                </label>
                            )}
                        </div>
                    )}
                </div>

                <footer className="modal-footer">
                    <div className="security-tag">
                        <ShieldCheck size={14} /> HOMI Secure e-Sign
                    </div>
                    <div className="footer-actions">
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn-primary" onClick={handleSave}>Confirm Signature</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default SignatureModal;