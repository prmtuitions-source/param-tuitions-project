import React, { useState, useEffect } from 'react';

export default function Counter({ target, label, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    // Calculate duration based on the size of the number
    const end = parseInt(target);
    if (start === end) return;

    let totalDuration = 2000; // 2 seconds for the count-up
    let incrementTime = (totalDuration / end) * 2;

    let timer = setInterval(() => {
      start += Math.ceil(end / 100); // Increment by steps for performance
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center">
      {/* Updated to use 'target' and fixed the number display */}
      <h2 className="font-bold" style={{ margin: 0, display: 'inline', color: 'var(--gold)', fontSize: 'inherit' }}>
        {count.toLocaleString()}{suffix}
      </h2>
      {label && (
        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest" style={{ marginTop: '5px' }}>
          {label}
        </p>
      )}
    </div>
  );
}