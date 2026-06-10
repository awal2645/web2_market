import { cn } from '@/lib/utils';

type Props = {
    levels: number[];
    active?: boolean;
    className?: string;
};

export function VoiceWaveform({ levels, active = false, className }: Props) {
    return (
        <div
            className={cn(
                'flex h-10 flex-1 items-end justify-center gap-0.5',
                className,
            )}
            aria-hidden
        >
            {levels.map((level, index) => (
                <span
                    key={index}
                    className={cn(
                        'w-1 rounded-full transition-[height] duration-75',
                        active
                            ? 'bg-red-500 dark:bg-red-400'
                            : 'bg-[#1565C0]/70 dark:bg-[#90caf9]/70',
                    )}
                    style={{
                        height: `${Math.round(level * 100)}%`,
                        minHeight: '4px',
                    }}
                />
            ))}
        </div>
    );
}
