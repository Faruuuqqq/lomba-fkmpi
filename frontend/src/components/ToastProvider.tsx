'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#ffffff',
                    color: '#121212',
                    border: '4px solid #121212',
                    padding: '16px 20px',
                    borderRadius: '0', // No rounded corners - Bauhaus
                    boxShadow: '4px 4px 0px 0px #121212', // Hard shadow
                    fontWeight: 'bold',
                    fontSize: '14px',
                    maxWidth: '400px',
                },
                success: {
                    style: {
                        background: '#10B981', // Green
                        color: '#ffffff',
                        border: '4px solid #121212',
                        boxShadow: '4px 4px 0px 0px #121212',
                    },
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#10B981',
                    },
                },
                error: {
                    style: {
                        background: '#D02020', // Bauhaus Red
                        color: '#ffffff',
                        border: '4px solid #121212',
                        boxShadow: '4px 4px 0px 0px #121212',
                    },
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#D02020',
                    },
                },
                loading: {
                    style: {
                        background: '#1040C0', // Bauhaus Blue
                        color: '#ffffff',
                        border: '4px solid #121212',
                        boxShadow: '4px 4px 0px 0px #121212',
                    },
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#1040C0',
                    },
                },
            }}
        />
    );
}
