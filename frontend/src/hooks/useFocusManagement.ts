import { useCallback, useEffect, useRef } from 'react';

export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<Set<string>>(new Set());

  const registerFocusable = (element: HTMLElement) => {
    if (element && element.focus) {
      setFocusedElement(element);
      setFocusableElements(prev => new Set(prev).add(element));
    }
  };

  const unregisterFocusable = (element: HTMLElement) => {
    setFocusableElements(prev => {
      const newSet = new Set(prev);
      newSet.delete(element);
      return newSet;
    });
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key;

    // Handle Tab and Shift+Tab for navigation
    if (key === 'Tab') {
      if (event.shiftKey) {
        const focusable = Array.from(focusableElements);
        const currentIndex = focusableElements.indexOf(document.activeElement);
        const nextIndex = (currentIndex + 1) % focusable.length;
        const nextElement = focusableElements[nextIndex];
        if (nextElement && nextElement.focus) {
          event.preventDefault();
          nextElement.focus();
        }
      } else {
        const prevElement = focusableElements[currentIndex - 1];
        if (prevElement && prevElement.focus) {
          event.preventDefault();
          prevElement.focus();
        }
      }
    }

    // Handle Escape to clear focus
    if (key === 'Escape') {
      if (focusedElement && focusedElement.blur) {
        setFocusedElement(null);
        unregisterFocusable(focusedElement);
      }
    }

    // Handle arrow keys for navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      if (!focusedElement) return;

      const focusable = Array.from(focusableElements);
      const currentIndex = focusableElements.indexOf(document.activeElement);
      
      let newIndex = currentIndex;
      
      if (key === 'ArrowUp') {
        newIndex = Math.max(0, currentIndex - 1);
      } else if (key === 'ArrowDown') {
        newIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
      } else if (key === 'ArrowLeft') {
        newIndex = Math.max(0, currentIndex - 1);
      } else if (key === 'ArrowRight') {
        newIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
      }
      
      if (newIndex >= 0 && newIndex < focusableElements.length && focusableElements[newIndex]) {
        const nextElement = focusableElements[newIndex];
        if (nextElement && nextElement.focus) {
          nextElement.focus();
        }
      }
    }
  }, [focusedElement, focusableElements]);

  return {
    focusedElement,
    registerFocusable,
    unregisterFocusable,
    handleKeyDown
  };
}