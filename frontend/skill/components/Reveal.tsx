
import React, { useEffect, useRef, useState } from 'react';
import { RevealProps } from '../types';

export const Reveal: React.FC<RevealProps> = ({ children, width = "fit-content", delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // ننتظر انتهاء الأنيميشن لفتح الـ overflow
        setTimeout(() => setIsFinished(true), 600 + (delay * 1000));
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [delay]);

  return (
    <div 
      ref={ref} 
      style={{ 
        width, 
        position: 'relative', 
        // نفتح الـ overflow بعد انتهاء الأنيميشن لمنع قص التوهج أو الـ Scale
        overflow: isFinished ? 'visible' : 'hidden' 
      }}
    >
      <div
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(75px)',
          opacity: isVisible ? 1 : 0,
          transition: `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`
        }}
      >
        {children}
      </div>
    </div>
  );
};
