'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log the error to an online reporting service if needed
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
            <div className="bg-white dark:bg-zinc-800 border-4 border-bauhaus-red shadow-bauhaus-lg p-8 max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6 border-4 border-bauhaus-red">
                    <AlertTriangle className="w-10 h-10 text-bauhaus-red" />
                </div>

                <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">
                    Something went wrong!
                </h2>

                <p className="text-zinc-600 dark:text-zinc-400 mb-8 font-medium">
                    We apologize for the inconvenience. The logic engine encountered an unexpected error.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-bauhaus-red hover:bg-red-700 text-white font-bold uppercase tracking-wider h-12 border-2 border-black shadow-bauhaus transition-transform active:translate-y-1 active:shadow-none"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try again
                    </Button>

                    <Button
                        onClick={() => router.push('/')}
                        variant="outline"
                        className="w-full font-bold uppercase tracking-wider h-12 border-2 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-900 rounded text-left overflow-auto max-h-40 border-2 border-zinc-300 dark:border-zinc-700">
                        <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs font-mono text-zinc-500 mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
