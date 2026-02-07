import React, { useEffect } from 'react';

const GoogleReviews = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="section reveal text-center">
      <div className="container">
        <div className="elfsight-app-6c13c603-c75a-4cec-8618-1a9066db77d1" data-elfsight-app-lazy></div>
      </div>
    </section>
  );
};

export default GoogleReviews;