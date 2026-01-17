'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white border-4 border-bauhaus shadow-bauhaus-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col rounded-none">
                {/* Header */}
                <div className="bg-bauhaus-blue border-b-4 border-bauhaus p-4 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white border-4 border-bauhaus hover:bg-bauhaus-red hover:text-white btn-press transition-colors flex items-center justify-center rounded-none"
                    >
                        <X className="w-5 h-5" strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
