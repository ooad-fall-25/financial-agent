"use client";

import { useRef, useEffect } from 'react';

/**
 * A custom hook that tracks and returns the previous value of a variable.
 * @param value The current value to track.
 * @returns The value from the previous render, or undefined on the initial render.
 */
export function usePrevious<T>(value: T): T | undefined {
  // Initialize the ref with 'undefined' as there's no previous value on the first render.
  const ref = useRef<T | undefined>(undefined);

  // After the component renders, update the ref's current value for the next render.
  useEffect(() => {
    ref.current = value;
  }, [value]); // This effect runs only when the value changes.

  // Return the value from the last render.
  return ref.current;
}