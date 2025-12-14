import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EmailChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentEmail: string;
}

export function EmailChangeModal({ isOpen, onClose, currentEmail }: EmailChangeModalProps) {
    const [newEmail, setNewEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newEmail || newEmail === currentEmail) {
            setStatus('error');
            setMessage('Please enter a different email address');
            return;
        }

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail });

            if (error) {
                setStatus('error');
                setMessage(error.message);
            } else {
                setStatus('success');
                setMessage('Verification email sent! Please check both your old and new email addresses to confirm the change.');
            }
        } catch (e: any) {
            setStatus('error');
            setMessage('Failed to update email. Please try again.');
        }

        setIsLoading(false);
    };

    const handleClose = () => {
        setNewEmail('');
        setStatus('idle');
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
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
                                <Mail className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Change Email</h2>
                        </div>
                        <button onClick={handleClose} className="text-neutral-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {status === 'success' ? (
                        <div className="text-center py-6">
                            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <p className="text-white font-medium mb-2">Verification Sent!</p>
                            <p className="text-neutral-400 text-sm">{message}</p>
                            <button
                                onClick={handleClose}
                                className="mt-6 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm text-neutral-400 mb-2">Current Email</label>
                                <div className="px-4 py-3 bg-neutral-800/50 border border-white/5 rounded-xl text-neutral-500">
                                    {currentEmail}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm text-neutral-400 mb-2">New Email</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Enter new email address"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    required
                                />
                            </div>

                            {status === 'error' && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !newEmail}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending Verification...
                                    </>
                                ) : (
                                    'Send Verification Email'
                                )}
                            </button>

                            <p className="mt-4 text-xs text-neutral-500 text-center">
                                You'll need to verify via both your old and new email addresses.
                            </p>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
