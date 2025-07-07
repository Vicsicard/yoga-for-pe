'use client'

export default function MinimalPlayerPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Minimal Vimeo Player Test
      
      <div style={{ 
        width: '100%', 
        maxWidth: '800px',
        height: '450px',
        border: '2px solid red',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <iframe 
          src="https://player.vimeo.com/video/1095788590?title=0&byline=0&portrait=0"
          style={{
            position: 'absolute',
            top,
            left,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p>This is a minimal test page with no extra styling or components.</p>
        <p>The red border should show where the video player is positioned.</p>
      </div>
    </div>
  )
}
