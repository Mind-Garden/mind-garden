'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Use the new hook from next/navigation
import { Particles } from '@/components/magicui/particles';

export default function ParticlesBackground() {
  const [documentHeight, setDocumentHeight] = useState(0);
  const [isRendered, setIsRendered] = useState(false); // State to track whether particles are rendered
  const pathname = usePathname(); // Listen for pathname changes

  // Function to update the document height
  const updateDocumentHeight = () => {
    setDocumentHeight(document.documentElement.scrollHeight);
    console.log(documentHeight);
  };

  useEffect(() => {
    // Update the document height when the component mounts or pathname changes
    updateDocumentHeight();

    // Use requestAnimationFrame to render after the initial page load
    requestAnimationFrame(() => {
      setIsRendered(true); // Set the state to true after the first render
    });
  }, [pathname]); // Adding pathname as a dependency to trigger on route changes

  // Prevent rendering particles before the page has been rendered
  if (!isRendered) {
    return null;
  }

  // Render the particles background with dynamic height
  return (
    <div className="absolute inset-0 z-[-5]">
      {' '}
      {/* Ensure particles render behind content */}
      <Particles
        quantity={200}
        ease={80}
        color={'#000000'}
        refresh
        style={{
          height: `${documentHeight}px`, // Dynamically set height based on document height
          width: '100vw', // Full viewport width
        }}
      />
    </div>
  );
}
