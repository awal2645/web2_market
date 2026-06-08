import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';

export default function AppearanceToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    onClick={() =>
                        updateAppearance(isDark ? 'light' : 'dark')
                    }
                    aria-label={
                        isDark ? 'Switch to light mode' : 'Switch to dark mode'
                    }
                >
                    {isDark ? (
                        <Sun className="size-5" />
                    ) : (
                        <Moon className="size-5" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isDark ? 'Light mode' : 'Dark mode'}</p>
            </TooltipContent>
        </Tooltip>
    );
}
