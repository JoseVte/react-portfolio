import Monitor from '@/components/icons/monitor';
import Moon from '@/components/icons/moon';
import Sun from '@/components/icons/sun';
import { Appearance } from '@/hooks/use-appearance';
import { Dropdown, DropdownItem } from 'flowbite-react';

export default function ModeToggle({ appearance, updateAppearance }: { appearance: string; updateAppearance: (appearance: Appearance) => void }) {
    const iconClass = 'size-6 fill-zinc-100 dark:fill-zinc-700 group-hover:stroke-yellow-500 cursor-pointer';

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className={iconClass + ' stroke-zinc-500 hover:stroke-yellow-500 focus:stroke-yellow-500'} />;
            case 'light':
                return <Sun className={iconClass + ' stroke-zinc-500 hover:stroke-yellow-500 focus:stroke-yellow-500'} />;
            default:
                return <Monitor className={iconClass + ' stroke-zinc-500 hover:stroke-yellow-500 focus:stroke-yellow-500'} />;
        }
    };

    return (
        <div className="flex cursor-pointer items-center rounded-full bg-white/90 px-3 py-2 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20">
            <Dropdown label={getCurrentIcon()} inline>
                <DropdownItem className="group" onClick={() => updateAppearance('light')}>
                    <Sun className={iconClass + ' ' + (appearance === 'light' ? 'stroke-yellow-500' : 'stroke-zinc-500')} />
                </DropdownItem>
                <DropdownItem className="group" onClick={() => updateAppearance('dark')}>
                    <Moon className={iconClass + ' ' + (appearance === 'dark' ? 'stroke-yellow-500' : 'stroke-zinc-500')} />
                </DropdownItem>
                <DropdownItem className="group" onClick={() => updateAppearance('system')}>
                    <Monitor className={iconClass + ' ' + (appearance === 'system' ? 'stroke-yellow-500' : 'stroke-zinc-500')} />
                </DropdownItem>
            </Dropdown>
        </div>
    );
}
