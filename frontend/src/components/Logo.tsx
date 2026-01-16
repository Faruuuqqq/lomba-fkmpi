import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizes = {
        sm: { container: 'h-8', text: 'text-lg' },
        md: { container: 'h-10', text: 'text-xl' },
        lg: { container: 'h-12', text: 'text-2xl' },
        xl: { container: 'h-16', text: 'text-3xl' }
    };

    const { container, text } = sizes[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Geometric Logo Mark */}
            <div className={`${container} aspect-square relative flex items-center justify-center`}>
                {/* Blue Square (M) */}
                <div className="absolute left-0 top-0 bottom-0 w-[40%] bg-bauhaus-blue border-4 border-bauhaus flex items-center justify-center">
                    <div className="text-white font-black text-[1.2em] leading-none">M</div>
                </div>

                {/* Red Triangle (A) */}
                <div className="absolute left-[35%] top-0 w-0 h-0 
          border-l-[1.5em] border-l-transparent 
          border-r-[1.5em] border-r-transparent 
          border-b-[2.6em] border-b-bauhaus-red
          border-[3px] border-bauhaus"
                    style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        background: '#D02020',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        borderColor: '#121212'
                    }}
                >
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-white font-black text-[0.8em]">A</div>
                </div>

                {/* Yellow Circle */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full bg-bauhaus-yellow border-4 border-bauhaus"></div>
            </div>

            {/* Text */}
            {showText && (
                <div className="flex flex-col leading-none">
                    <span className={`${text} font-black uppercase tracking-tighter`}>MITRA</span>
                    <span className={`${text} font-black uppercase tracking-tighter`}>AI</span>
                </div>
            )}
        </div>
    );
}

// Simplified version for small spaces
export function LogoMark({ size = 'md', className = '' }: Omit<LogoProps, 'showText'>) {
    return <Logo size={size} showText={false} className={className} />;
}
