import { useCallback, useEffect, useRef, useState } from 'react';

export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<Set<HTMLElement>>(new Set());

  const registerFocusable = (element: HTMLElement) => {
    if (element) {
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
    const focusable = Array.from(focusableElements);

    // Handle Tab and Shift+Tab for navigation
    if (key === 'Tab') {
      event.preventDefault();
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      
      if (event.shiftKey) {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1;
        const prevElement = focusable[prevIndex];
        if (prevElement) {
          prevElement.focus();
        }
      } else {
        const nextIndex = (currentIndex + 1) % focusable.length;
        const nextElement = focusable[nextIndex];
        if (nextElement) {
          nextElement.focus();
        }
      }
    }

    // Handle Escape to clear focus
    if (key === 'Escape') {
      if (focusedElement) {
        setFocusedElement(null);
        unregisterFocusable(focusedElement);
      }
    }

    // Handle arrow keys for navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      if (!focusedElement) return;

      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      
      let newIndex = currentIndex;
      
      if (key === 'ArrowUp' || key === 'ArrowLeft') {
        newIndex = Math.max(0, currentIndex - 1);
      } else if (key === 'ArrowDown' || key === 'ArrowRight') {
        newIndex = Math.min(focusable.length - 1, currentIndex + 1);
      }
      
      if (newIndex >= 0 && newIndex < focusable.length) {
        const nextElement = focusable[newIndex];
        if (nextElement) {
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