'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-foreground font-['Outfit']">
                    <div className="bg-white border-4 border-bauhaus-red shadow-bauhaus-lg p-8 max-w-md w-full text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6 border-4 border-bauhaus-red">
                            <AlertTriangle className="w-10 h-10 text-bauhaus-red" />
                        </div>

                        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                            Critical System Error
                        </h2>

                        <p className="text-zinc-600 mb-8 font-medium">
                            A critical error occurred in the logic core.
                        </p>

                        <Button
                            onClick={() => reset()}
                            className="w-full bg-bauhaus-red hover:bg-red-700 text-white font-bold uppercase tracking-wider h-12 border-2 border-black shadow-bauhaus transition-transform active:translate-y-1 active:shadow-none"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reboot System
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
