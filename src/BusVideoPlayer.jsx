import React from 'react';

const BusVideoPlayer = () => {
  // Configuration for the YouTube video
  const videoId = "e_04ZrNroTo"; // "The Wheels on the Bus" (Super Simple Songs)
  const startSeconds = 0;
  const endSeconds = 10;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>The Wheels on the Bus (10s Clip)</h2>
        <div style={styles.videoWrapper}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?start=${startSeconds}&end=${endSeconds}&autoplay=1&rel=0&modestbranding=1`}
            title="The Wheels on the Bus"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={styles.iframe}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#f0f2f5',
    minHeight: '50vh',
  },
  card: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    padding: '24px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#1a1a1a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '24px',
  },
  videoWrapper: {
    position: 'relative',
    paddingBottom: '56.25%', /* 16:9 aspect ratio */
    height: 0,
    overflow: 'hidden',
    borderRadius: '12px',
    backgroundColor: '#000',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
};

export default BusVideoPlayer;
