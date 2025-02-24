'use client';
// Core Imports
import React, { useRef, useEffect } from 'react';

// Utility Imports
import { cn } from '@/lib/utils';

// Define the props interface, extending standard <textarea> attributes
interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Forward ref to allow parent components to reference the textarea element
const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    // Create a reference to the textarea element
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Set Height based on the text content
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      // Listen for input changes to adjust height
      adjustHeight();
      textarea.addEventListener('input', adjustHeight);

      // Remove event listener when component unmounts
      return () => textarea.removeEventListener('input', adjustHeight);
    }, []); // Runs once when component mounts

    return (
      <textarea
        ref={(el) => {
          textareaRef.current = el; // Store reference for internal use

          // Handle the forwarded ref from parent components
          if (typeof ref === 'function') ref(el);
          else if (ref && el)
            (ref as React.RefObject<HTMLTextAreaElement>).current = el;
        }}
        className={cn(
          'w-full min-h-[100px] max-h-[300px] p-3 rounded-md border border-input bg-background text-base focus:ring focus:ring-primary/50 resize-none placeholder:text-muted-foreground disabled:opacity-50',
          className, // Allows additional custom class names to be passed
        )}
        {...props} // Spread any additional props
      />
    );
  },
);

TextArea.displayName = 'TextArea';

export { TextArea };
