import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Loader2 } from 'lucide-react';
import { send2FA, verify2FA } from '@/lib/api';

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onSuccess: () => void;
}

export function OTPModal({ isOpen, onClose, email, onSuccess }: OTPModalProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            handleSendOTP();
        }
    }, [isOpen]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendOTP = async () => {
        setIsSending(true);
        setError('');
        try {
            await send2FA(email);
            setCountdown(60);
        } catch (e: any) {
            setError('Failed to send OTP. Please try again.');
        }
        setIsSending(false);
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await verify2FA(email, code);
            onSuccess();
            onClose();
        } catch (e: any) {
            setError('Invalid or expired OTP. Please try again.');
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="liquid-glass rounded-2xl p-8 max-w-md w-full shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Verify Your Identity</h2>
                        </div>
                        <button onClick={onClose} className="text-neutral-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-neutral-400 mb-6">
                        We've sent a 6-digit code to <span className="text-emerald-400">{email}</span>
                    </p>

                    <div className="flex gap-2 justify-center mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-neutral-800 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                    )}

                    <button
                        onClick={handleVerify}
                        disabled={isLoading}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Code'
                        )}
                    </button>

                    <div className="mt-4 text-center">
                        <button
                            onClick={handleSendOTP}
                            disabled={countdown > 0 || isSending}
                            className="text-sm text-neutral-500 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive code? Resend"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
