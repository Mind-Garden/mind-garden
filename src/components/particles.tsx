'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Particles } from '@/components/magicui/particles';
import { createPortal } from 'react-dom';

export default function ParticlesBackground() {
  const [documentHeight, setDocumentHeight] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const pathname = usePathname();

  // Function to update the document height
  const updateHeight = () => {
    setDocumentHeight(document.documentElement.scrollHeight);
    console.log('Updated document height:', documentHeight);
  };

  // Set initial height and add resize listener
  useEffect(() => {
    // Initialize MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      updateHeight(); // Update the height when DOM changes
    });

    // Start observing the document body for child and subtree mutations
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial height update
    updateHeight();

    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  // On route change, hide particles briefly, update height, then show them
  useEffect(() => {
    // Hide particles to ensure a full unmount and re-render
    setShowParticles(false);

    // Allow the new page content to render before re-calculating height
    const timeoutId = setTimeout(() => {
      updateHeight();
      setShowParticles(true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  // Avoid rendering until we have a valid height and the particles are ready to show
  if (documentHeight === 0 || !showParticles) return null;

  // Using a portal so that the particles element is appended at the end of the document body
  return createPortal(
    <div className="absolute inset-0 z-[-5]">
      <Particles
        key={documentHeight} // Forces remount on route change
        quantity={200}
        ease={80}
        color={'#000000'}
        refresh={true}
        style={{
          height: `${documentHeight}px`,
          width: '100vw',
        }}
      />
    </div>,
    document.body,
  );
}
