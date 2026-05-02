import React from 'react';

interface CompatibilityBadgeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
}

const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({ score, size = 'md' }) => {
    const getColor = (s: number) => {
        if (s >= 90) return 'text-emerald-500';
        if (s >= 70) return 'text-homi-500';
        if (s >= 50) return 'text-amber-500';
        return 'text-red-400';
    };

    const getBgColor = (s: number) => {
        if (s >= 90) return 'bg-emerald-50/50';
        if (s >= 70) return 'bg-homi-50/50';
        if (s >= 50) return 'bg-amber-50/50';
        return 'bg-red-50/50';
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'w-10 h-10 text-sm';
            case 'lg': return 'w-20 h-20 text-2xl';
            default: return 'w-14 h-14 text-lg';
        }
    };

    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className={`relative flex items-center justify-center rounded-full ${getBgColor(score)} ${getSizeClasses()} font-bold ${getColor(score)} transition-all duration-1000`}>
            <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="opacity-20"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <span className="relative z-10">{score}%</span>
        </div>
    );
};

export default CompatibilityBadge;
