import { useEffect, useRef } from 'react';

type KeyCombo = string;
type Callback = (event: KeyboardEvent) => void;

/**
 * Hook to handle keyboard shortcuts.
 * Supports combos like 'ctrl+s', 'meta+enter', 'escape'
 */
export function useHotkeys(keyCombo: KeyCombo, callback: Callback, deps: any[] = []) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const parts = keyCombo.toLowerCase().split('+');
            const key = parts[parts.length - 1];
            const needsCtrl = parts.includes('ctrl') || parts.includes('meta') || parts.includes('cmd');
            const needsShift = parts.includes('shift');
            const needsAlt = parts.includes('alt');

            const isCtrlPressed = event.ctrlKey || event.metaKey;
            const isShiftPressed = event.shiftKey;
            const isAltPressed = event.altKey;

            if (
                event.key.toLowerCase() === key &&
                (needsCtrl === isCtrlPressed) &&
                (needsShift === isShiftPressed) &&
                (needsAlt === isAltPressed)
            ) {
                event.preventDefault();
                callbackRef.current(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keyCombo, ...deps]);
}
