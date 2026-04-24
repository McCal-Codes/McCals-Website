import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const TerranovaPage = () => {
  usePageMeta({
    title: 'TerraNova | Hytale Terrain Generation Studio',
    description: 'TerraNova is a terrain generation studio for Hytale. Procedural world building, node-based editor, and creator tooling. Contributor: Caleb McCartney.',
    canonical: `${SITE_URL}/terranova`,
    og: {
      type: 'website',
      title: 'TerraNova | Hytale Terrain Generation Studio',
      description: 'TerraNova is a terrain generation studio for Hytale. Procedural world building, node-based editor, and creator tooling.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'TerraNova | Hytale Terrain Generation Studio',
      description: 'TerraNova is a terrain generation studio for Hytale. Procedural world building, node-based editor, and creator tooling.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TerraNova',
      description: 'TerraNova is a terrain generation studio for the Hytale ecosystem, focused on procedural systems and creator tooling. Features node-based terrain editing with live preview, environment and weather systems.',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      author: {
        '@type': 'Organization',
        name: 'HyperSystems Development',
        url: 'https://github.com/HyperSystems-Development',
      },
      contributor: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
      },
    },
  });

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Hero Section */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
          marginBottom: '5rem'
        }}>
          {/* Left: Content */}
          <div style={{ textAlign: 'left' }}>
            {/* TerraNova App Icon with staggered animation */}
            <div style={{ marginBottom: '2rem' }}>
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 512 512" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                style={{ 
                  display: 'block',
                  animation: 'floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <rect width="512" height="512" rx="108" fill="#1a1814"/>
                <ellipse cx="230" cy="260" rx="180" ry="140" fill="#b5924c" opacity="0.06"/>
                <path d="M310 185 L440 370 L200 370 Z" fill="#3d3730"/>
                <path d="M195 145 L375 370 L55 370 Z" fill="#b5924c"/>
                <path d="M195 145 L215 192 L175 192 Z" fill="#e8e2d9" opacity="0.8"/>
                <rect x="46" y="368" width="420" height="3" rx="1.5" fill="#4a4438"/>
                <path d="M66 402 Q190 380 275 394 Q365 408 446 388" stroke="#b5924c" strokeWidth="3" opacity="0.3" fill="none" strokeLinecap="round"/>
                <circle cx="412" cy="98" r="10" fill="#b5924c" opacity="0.4"/>
                <circle cx="412" cy="98" r="5" fill="#e8e2d9" opacity="0.65"/>
              </svg>
            </div>

            <h1 style={{ 
              fontFamily: "'Libre Baskerville', serif", 
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
              fontWeight: 600, 
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}>
              TerraNova
            </h1>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', 
              marginBottom: '1.5rem',
              fontWeight: 400,
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}>
              Visual Node-Based Worldgen Editor for Hytale
            </p>
            <p style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '1.1rem', 
              marginBottom: '2.5rem', 
              lineHeight: '1.7',
              maxWidth: '500px',
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}>
              Connect noise generators, curve transforms, and terrain combinators in a visual graph — then export directly to Hytale.
            </p>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              flexWrap: 'wrap',
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}>
              <a
                href="https://tryterranova.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 32px',
                  backgroundColor: '#fff',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Try TerraNova
              </a>
              <a
                href="https://github.com/HyperSystems-Development/TerraNova"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 32px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                View on GitHub
              </a>
            </div>
          </div>

          {/* Right: Node Graph Visualization */}
          <div style={{ 
            padding: '2rem',
            background: 'rgba(38,35,32,0.5)',
            borderRadius: '16px',
            border: '1px solid rgba(74,68,56,0.3)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards',
            opacity: 0,
            transform: 'translateY(20px)'
          }}>
            <svg width="100%" height="350" viewBox="0 0 950 350" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              {/* Dot pattern background */}
              <defs>
                <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="12" cy="12" r="1" fill="#4a4438" opacity="0.4"/>
                </pattern>
                <radialGradient id="fade" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white"/>
                  <stop offset="65%" stopColor="white"/>
                  <stop offset="100%" stopColor="black"/>
                </radialGradient>
                <mask id="mask">
                  <rect width="100%" height="100%" fill="url(#fade)"/>
                </mask>
              </defs>
              <g mask="url(#mask)">
                <rect width="100%" height="100%" fill="url(#dots)"/>
              </g>
              
              {/* Connection lines with TerraNova styling */}
              <path id="conn1" d="M 180 85 C 220 85, 220 45, 260 45" stroke="#4A90D9" strokeWidth="1.5" strokeDasharray="1 1" strokeOpacity="0.5"/>
              <path id="conn2" d="M 180 85 C 220 85, 220 125, 260 125" stroke="#7B68AE" strokeWidth="1.5" strokeDasharray="1 1" strokeOpacity="0.5"/>
              <path id="conn3" d="M 180 85 C 220 85, 220 205, 260 205" stroke="#D4A843" strokeWidth="1.5" strokeDasharray="1 1" strokeOpacity="0.5"/>
              <path id="conn4" d="M 420 45 C 460 45, 460 85, 500 85" stroke="#2D9B83" strokeWidth="1.5" strokeDasharray="1 1" strokeOpacity="0.5"/>
              <path id="conn5" d="M 420 125 C 460 125, 460 85, 500 85" stroke="#B8763C" strokeWidth="1.5" strokeDasharray="1 1" strokeOpacity="0.5"/>
              <path id="conn6" d="M 420 205 C 460 205, 460 165, 500 165" stroke="#A67EB8" strokeWidth="1.5" strokeDasharray="1 1" strokeOpacity="0.5"/>
              <path id="conn7" d="M 660 85 C 700 85, 700 125, 740 125" stroke="#C45B84" strokeWidth="1.5" strokeDasharray="1 1" strokeOpacity="0.5"/>
              <path id="conn8" d="M 660 165 C 700 165, 700 125, 740 125" stroke="#6B9E5A" strokeWidth="1.5" strokeDasharray="1 1" strokeOpacity="0.5"/>
              
              {/* Animated particles */}
              <circle r="3" fill="#4A90D9" opacity="0.8">
                <animateMotion dur="2.5s" repeatCount="indefinite">
                  <mpath href="#conn1"/>
                </animateMotion>
              </circle>
              <circle r="3" fill="#7B68AE" opacity="0.8">
                <animateMotion dur="2.8s" repeatCount="indefinite">
                  <mpath href="#conn2"/>
                </animateMotion>
              </circle>
              <circle r="3" fill="#D4A843" opacity="0.8">
                <animateMotion dur="3.1s" repeatCount="indefinite">
                  <mpath href="#conn3"/>
                </animateMotion>
              </circle>
              <circle r="3" fill="#2D9B83" opacity="0.8">
                <animateMotion dur="3.4s" repeatCount="indefinite">
                  <mpath href="#conn4"/>
                </animateMotion>
              </circle>
              <circle r="3" fill="#B8763C" opacity="0.8">
                <animateMotion dur="3.7s" repeatCount="indefinite">
                  <mpath href="#conn5"/>
                </animateMotion>
              </circle>
              <circle r="3" fill="#A67EB8" opacity="0.8">
                <animateMotion dur="4.0s" repeatCount="indefinite">
                  <mpath href="#conn6"/>
                </animateMotion>
              </circle>
              
              {/* Node 1: SimplexNoise2D */}
              <g className="node-group" style={{ cursor: 'pointer' }}>
                <rect x="20" y="60" width="160" height="50" rx="6" fill="#262320" stroke="#4a4438" strokeWidth="1"/>
                <rect x="20" y="60" width="160" height="26" rx="6" fill="#4A90D9"/>
                <rect x="20" y="80" width="160" height="6" fill="#4A90D9"/>
                <text x="30" y="77" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">SimplexNoise2D</text>
                <text x="30" y="100" fill="#9a9082" fontSize="9" fontFamily="monospace">Freq: 0.005</text>
                <circle cx="180" cy="85" r="4" fill="#1c1a17" stroke="#4A90D9" strokeWidth="1.5"/>
              </g>
              
              {/* Node 2: Normalizer */}
              <g className="node-group" style={{ cursor: 'pointer' }}>
                <rect x="260" y="20" width="160" height="50" rx="6" fill="#262320" stroke="#4a4438" strokeWidth="1"/>
                <rect x="260" y="20" width="160" height="26" rx="6" fill="#7B68AE"/>
                <rect x="260" y="40" width="160" height="6" fill="#7B68AE"/>
                <text x="270" y="37" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">Normalizer</text>
                <text x="270" y="60" fill="#9a9082" fontSize="9" fontFamily="monospace">Source: [-1, 1]</text>
                <circle cx="260" cy="45" r="4" fill="#1c1a17" stroke="#7B68AE" strokeWidth="1.5"/>
                <circle cx="420" cy="45" r="4" fill="#1c1a17" stroke="#7B68AE" strokeWidth="1.5"/>
              </g>
              
              {/* Node 3: CurveMapper */}
              <g className="node-group" style={{ cursor: 'pointer' }}>
                <rect x="260" y="100" width="160" height="50" rx="6" fill="#262320" stroke="#4a4438" strokeWidth="1"/>
                <rect x="260" y="100" width="160" height="26" rx="6" fill="#B8763C"/>
                <rect x="260" y="120" width="160" height="6" fill="#B8763C"/>
                <text x="270" y="117" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">CurveMapper</text>
                <text x="270" y="140" fill="#9a9082" fontSize="9" fontFamily="monospace">Mode: Cubic</text>
                <circle cx="260" cy="125" r="4" fill="#1c1a17" stroke="#B8763C" strokeWidth="1.5"/>
                <circle cx="420" cy="125" r="4" fill="#1c1a17" stroke="#B8763C" strokeWidth="1.5"/>
              </g>
              
              {/* Node 4: VoronoiBiome */}
              <g className="node-group" style={{ cursor: 'pointer' }}>
                <rect x="260" y="180" width="160" height="50" rx="6" fill="#262320" stroke="#4a4438" strokeWidth="1"/>
                <rect x="260" y="180" width="160" height="26" rx="6" fill="#D4A843"/>
                <rect x="260" y="200" width="160" height="6" fill="#D4A843"/>
                <text x="270" y="197" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">VoronoiBiome</text>
                <text x="270" y="220" fill="#9a9082" fontSize="9" fontFamily="monospace">Cells: 12</text>
                <circle cx="260" cy="205" r="4" fill="#1c1a17" stroke="#D4A843" strokeWidth="1.5"/>
                <circle cx="420" cy="205" r="4" fill="#1c1a17" stroke="#D4A843" strokeWidth="1.5"/>
              </g>
              
              {/* Node 5: Mix */}
              <g className="node-group" style={{ cursor: 'pointer' }}>
                <rect x="500" y="60" width="160" height="50" rx="6" fill="#262320" stroke="#4a4438" strokeWidth="1"/>
                <rect x="500" y="60" width="160" height="26" rx="6" fill="#2D9B83"/>
                <rect x="500" y="80" width="160" height="6" fill="#2D9B83"/>
                <text x="510" y="77" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">Mix</text>
                <text x="510" y="100" fill="#9a9082" fontSize="9" fontFamily="monospace">Blend: 0.5</text>
                <circle cx="500" cy="85" r="4" fill="#1c1a17" stroke="#2D9B83" strokeWidth="1.5"/>
                <circle cx="500" cy="105" r="4" fill="#1c1a17" stroke="#2D9B83" strokeWidth="1.5"/>
                <circle cx="660" cy="85" r="4" fill="#1c1a17" stroke="#2D9B83" strokeWidth="1.5"/>
              </g>
              
              {/* Node 6: SurfaceDensity */}
              <g className="node-group" style={{ cursor: 'pointer' }}>
                <rect x="500" y="140" width="160" height="50" rx="6" fill="#262320" stroke="#4a4438" strokeWidth="1"/>
                <rect x="500" y="140" width="160" height="26" rx="6" fill="#A67EB8"/>
                <rect x="500" y="160" width="160" height="6" fill="#A67EB8"/>
                <text x="510" y="157" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">SurfaceDensity</text>
                <text x="510" y="180" fill="#9a9082" fontSize="9" fontFamily="monospace">Res: High</text>
                <circle cx="500" cy="165" r="4" fill="#1c1a17" stroke="#A67EB8" strokeWidth="1.5"/>
                <circle cx="660" cy="165" r="4" fill="#1c1a17" stroke="#A67EB8" strokeWidth="1.5"/>
              </g>
              
              {/* Node 7: TerrainOutput */}
              <g className="node-group" style={{ cursor: 'pointer' }}>
                <rect x="740" y="100" width="160" height="50" rx="6" fill="#262320" stroke="#4a4438" strokeWidth="1"/>
                <rect x="740" y="100" width="160" height="26" rx="6" fill="#C45B84"/>
                <rect x="740" y="120" width="160" height="6" fill="#C45B84"/>
                <text x="750" y="117" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">TerrainOutput</text>
                <text x="750" y="140" fill="#9a9082" fontSize="9" fontFamily="monospace">Format: Hytale</text>
                <circle cx="740" cy="125" r="4" fill="#1c1a17" stroke="#C45B84" strokeWidth="1.5"/>
              </g>
            </svg>
            
            {/* CSS for hover effects and animations */}
            <style>{`
              .node-group rect {
                transition: all 0.2s ease;
              }
              .node-group:hover rect {
                filter: brightness(1.1);
              }
              .node-group:hover text {
                filter: brightness(1.1);
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes floatIn {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              @keyframes breathing {
                0%, 100% { 
                  opacity: 1;
                  transform: scale(1);
                }
                50% { 
                  opacity: 0.6;
                  transform: scale(1.2);
                }
              }
            `}</style>
          </div>
        </div>

        {/* Decorative Divider */}
        <div style={{ 
          height: '1px', 
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          marginBottom: '5rem'
        }}/>

        {/* Stats Section */}
        <div style={{ 
          padding: '3rem 0',
          backgroundColor: 'rgba(38,35,32,0.3)',
          borderTop: '1px solid rgba(74,68,56,0.3)',
          borderBottom: '1px solid rgba(74,68,56,0.3)',
          marginBottom: '5rem'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                fontFamily: 'monospace',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#B8763C',
                display: 'inline-block',
                animation: 'float 3s ease-in-out infinite'
              }}>
                200+
              </span>
              <p style={{ 
                fontFamily: 'monospace',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)'
              }}>
                Node Types
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                fontFamily: 'monospace',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#B8763C',
                display: 'inline-block',
                animation: 'float 3s ease-in-out infinite 0.5s'
              }}>
                11
              </span>
              <p style={{ 
                fontFamily: 'monospace',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)'
              }}>
                Categories
              </p>
              <div style={{ 
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
                flexWrap: 'wrap'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4A90D9', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7B68AE', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2D9B83', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#A67EB8', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4A843', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B8763C', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6B9E5A', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5AACA6', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C87D3A', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C45B84', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7DB350', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                fontFamily: 'monospace',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#B8763C',
                display: 'inline-block',
                animation: 'float 3s ease-in-out infinite 1s'
              }}>
                Real-Time
              </span>
              <p style={{ 
                fontFamily: 'monospace',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)'
              }}>
                3D Preview
              </p>
              <div style={{ 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#7DB350',
                  animation: 'breathing 2s ease-in-out infinite'
                }}/>
                <span style={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: '#7DB350'
                }}>
                  Live
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                fontFamily: 'monospace',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#B8763C',
                display: 'inline-block',
                animation: 'float 3s ease-in-out infinite 1.5s'
              }}>
                LGPL-2.0
              </span>
              <p style={{ 
                fontFamily: 'monospace',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)'
              }}>
                License
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontFamily: "'Libre Baskerville', serif", 
            fontSize: '2rem', 
            marginBottom: '1.5rem',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Why TerraNova?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginBottom: '2rem' }}>
            Everything you need for worldgen
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {/* Bridge Plugin Card - Full width */}
            <div style={{ 
              gridColumn: '1 / -1',
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid rgba(74,68,56,0.3)',
              backgroundColor: 'rgba(38,35,32,0.5)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(181,146,76,0.4)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(181,146,76,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(74,68,56,0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ 
                position: 'relative',
                height: '128px',
                overflow: 'hidden',
                backgroundColor: 'rgba(38,35,32,0.8)'
              }}>
                <div style={{ 
                  display: 'flex',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px'
                }}>
                  <div style={{ width: '100%', maxWidth: '200px' }}>
                    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="35" width="70" height="50" rx="4" fill="#262320" stroke="#4a4438" strokeWidth="0.5"/>
                      <rect x="10" y="35" width="70" height="12" rx="4" fill="#B8763C"/>
                      <rect x="10" y="41" width="70" height="6" fill="#B8763C"/>
                      <text x="16" y="44" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="600">TerrainOutput</text>
                      <text x="16" y="60" fill="#9a9082" fontSize="4.5" fontFamily="monospace">Format: Hytale</text>
                      <text x="16" y="70" fill="#9a9082" fontSize="4.5" fontFamily="monospace">Preview: On</text>
                      <circle cx="80" cy="60" r="3" fill="#1c1a17" stroke="#B8763C" strokeWidth="1"/>
                      <path d="M 83 60 C 100 60, 110 60, 120 60" stroke="#4a4438" strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>
                      <rect x="125" y="40" width="55" height="40" rx="6" fill="#262320" stroke="#4a4438" strokeWidth="0.5"/>
                      <rect x="135" y="48" width="35" height="6" rx="2" fill="#4a4438"/>
                      <circle cx="165" cy="51" r="2" fill="#7DB350"/>
                      <rect x="135" y="58" width="35" height="6" rx="2" fill="#4a4438"/>
                      <circle cx="165" cy="61" r="2" fill="#7DB350"/>
                      <rect x="135" y="68" width="35" height="6" rx="2" fill="#4a4438"/>
                      <circle cx="165" cy="71" r="2" fill="#5AACA6"/>
                      <text x="152" y="92" textAnchor="middle" fill="#7DB350" fontSize="5" fontFamily="monospace" fontWeight="600">Hot Reload</text>
                    </svg>
                  </div>
                </div>
                <div style={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '32px',
                  background: 'linear-gradient(to top, rgba(38,35,32,0.5), transparent)'
                }}/>
              </div>
              <div style={{ padding: '24px 32px 32px' }}>
                <p style={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '0.5rem'
                }}>
                  Integration
                </p>
                <h3 style={{ 
                  marginTop: '0.5rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.125rem'
                }}>
                  Bridge Plugin
                </h3>
                <p style={{ 
                  marginTop: '0.75rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  Hot-reload templates directly into your Hytale server via the TerraNova Bridge plugin.
                </p>
              </div>
            </div>

            {/* Schema Validation Card */}
            <div style={{ 
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid rgba(74,68,56,0.3)',
              backgroundColor: 'rgba(38,35,32,0.5)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(181,146,76,0.4)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(181,146,76,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(74,68,56,0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ 
                position: 'relative',
                height: '128px',
                overflow: 'hidden',
                backgroundColor: 'rgba(38,35,32,0.8)'
              }}>
                <div style={{ 
                  display: 'flex',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px'
                }}>
                  <div style={{ width: '100%', maxWidth: '200px' }}>
                    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="30" y="15" width="100" height="70" rx="4" fill="#262320" stroke="#4a4438" strokeWidth="0.5"/>
                      <rect x="30" y="15" width="100" height="12" rx="4" fill="#7B68AE"/>
                      <rect x="30" y="21" width="100" height="6" fill="#7B68AE"/>
                      <text x="36" y="24" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="600">SchemaValidator</text>
                      <text x="36" y="40" fill="#9a9082" fontSize="4.5" fontFamily="monospace">&#123; "type": "noise"</text>
                      <text x="36" y="50" fill="#9a9082" fontSize="4.5" fontFamily="monospace">  "freq": 0.005</text>
                      <text x="36" y="60" fill="#9a9082" fontSize="4.5" fontFamily="monospace">  "valid": true</text>
                      <text x="36" y="70" fill="#9a9082" fontSize="4.5" fontFamily="monospace">&#125;</text>
                      <circle cx="125" cy="20" r="10" fill="#262320" stroke="#4ade80" strokeWidth="1.5"/>
                      <path d="M 120 20 L 123 23 L 130 17" stroke="#4ade80" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="30" y="90" width="100" height="14" rx="4" fill="#262320" stroke="#4a4438" strokeWidth="0.5"/>
                      <rect x="30" y="90" width="75" height="14" rx="4" fill="#4ade80" opacity="0.15"/>
                      <text x="80" y="100" textAnchor="middle" fill="#4ade80" fontSize="5" fontFamily="monospace">VALID</text>
                    </svg>
                  </div>
                </div>
                <div style={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '32px',
                  background: 'linear-gradient(to top, rgba(38,35,32,0.5), transparent)'
                }}/>
              </div>
              <div style={{ padding: '24px 32px 32px' }}>
                <p style={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '0.5rem'
                }}>
                  Reliability
                </p>
                <h3 style={{ 
                  marginTop: '0.5rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.125rem'
                }}>
                  Schema Validation
                </h3>
                <p style={{ 
                  marginTop: '0.75rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  Templates are validated against the Hytale worldgen schema before export. No broken configs.
                </p>
              </div>
            </div>

            {/* Open Source Card */}
            <div style={{ 
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid rgba(74,68,56,0.3)',
              backgroundColor: 'rgba(38,35,32,0.5)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(181,146,76,0.4)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(181,146,76,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(74,68,56,0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ 
                position: 'relative',
                height: '128px',
                overflow: 'hidden',
                backgroundColor: 'rgba(38,35,32,0.8)'
              }}>
                <div style={{ 
                  display: 'flex',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px'
                }}>
                  <div style={{ width: '100%', maxWidth: '200px' }}>
                    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* GitHub-style logo */}
                      <circle cx="100" cy="50" r="28" fill="#262320" stroke="#c4baa8" strokeWidth="1.5"/>
                      <path d="M100 30C86.7 30 76 40.7 76 54c0 10.3 6.7 19 16 22.1 1.2.2 1.6-.5 1.6-1.1v-4.2c-6.5 1.4-7.9-3.1-7.9-3.1-1.1-2.7-2.6-3.4-2.6-3.4-2.1-1.4.2-1.4.2-1.4 2.3.2 3.5 2.4 3.5 2.4 2 3.5 5.3 2.5 6.6 1.9.2-1.4.8-2.6 1.4-3.2-5.1-.5-10.5-2.6-10.5-11.5 0-2.5.9-4.6 2.4-6.2-.2-.6-1-2.9.2-6 0 0 2-.6 6.5 2.3 1.9-.5 3.9-.8 5.9-.8s4 .3 5.9.8c4.5-2.9 6.5-2.3 6.5-2.3 1.2 3.1.5 5.4.2 6 1.5 1.6 2.4 3.7 2.4 6.2 0 8.9-5.4 11-10.5 11.5.8.7 1.5 2 1.5 4v4.2c0 .6.4 1.3 1.6 1.1 9.3-3.1 16-11.8 16-22.1 0-13.3-10.7-24-24-24z" fill="#c4baa8" opacity="0.9"/>
                      
                      {/* Contribution indicators */}
                      <circle cx="70" cy="35" r="6" fill="#262320" stroke="#7DB350" strokeWidth="1"/>
                      <path d="M68 35L69 37L72 33" stroke="#7DB350" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      
                      <circle cx="130" cy="35" r="6" fill="#262320" stroke="#7DB350" strokeWidth="1"/>
                      <path d="M128 35L129 37L132 33" stroke="#7DB350" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      
                      <circle cx="70" cy="65" r="6" fill="#262320" stroke="#5AACA6" strokeWidth="1"/>
                      <path d="M68 65L69 67L72 63" stroke="#5AACA6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      
                      <circle cx="130" cy="65" r="6" fill="#262320" stroke="#5AACA6" strokeWidth="1"/>
                      <path d="M128 65L129 67L132 63" stroke="#5AACA6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      
                      {/* Connection lines */}
                      <path d="M76 35C85 35, 90 50, 100 50" stroke="#4a4438" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4"/>
                      <path d="M124 35C115 35, 110 50, 100 50" stroke="#4a4438" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4"/>
                      <path d="M76 65C85 65, 90 50, 100 50" stroke="#4a4438" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4"/>
                      <path d="M124 65C115 65, 110 50, 100 50" stroke="#4a4438" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4"/>
                      
                      {/* Fork/Branch indicators */}
                      <rect x="85" y="90" width="30" height="12" rx="2" fill="#262320" stroke="#4a4438" strokeWidth="0.5"/>
                      <text x="100" y="98" textAnchor="middle" fill="#9a9082" fontSize="4" fontFamily="monospace">fork</text>
                      
                      <rect x="120" y="90" width="30" height="12" rx="2" fill="#262320" stroke="#4a4438" strokeWidth="0.5"/>
                      <text x="135" y="98" textAnchor="middle" fill="#9a9082" fontSize="4" fontFamily="monospace">PR</text>
                      
                      <rect x="50" y="90" width="30" height="12" rx="2" fill="#262320" stroke="#4a4438" strokeWidth="0.5"/>
                      <text x="65" y="98" textAnchor="middle" fill="#9a9082" fontSize="4" fontFamily="monospace">star</text>
                    </svg>
                  </div>
                </div>
                <div style={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '32px',
                  background: 'linear-gradient(to top, rgba(38,35,32,0.5), transparent)'
                }}/>
              </div>
              <div style={{ padding: '24px 32px 32px' }}>
                <p style={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '0.5rem'
                }}>
                  Community
                </p>
                <h3 style={{ 
                  marginTop: '0.5rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.125rem'
                }}>
                  Open Source
                </h3>
                <p style={{ 
                  marginTop: '0.75rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  TerraNova is fully open source. Contribute, fork, or browse the code on GitHub.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works Section */}
        <div style={{ 
          padding: '4rem 0',
          backgroundColor: 'rgba(38,35,32,0.3)',
          marginBottom: '4rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ 
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#B8763C',
              marginBottom: '0.75rem'
            }}>
              How it works
            </p>
            <h2 style={{ 
              fontFamily: "'Libre Baskerville', serif", 
              fontSize: '2rem', 
              color: 'rgba(255,255,255,0.9)'
            }}>
              From idea to world in minutes
            </h2>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {/* Step 01: Design */}
            <div style={{ position: 'relative', animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards', opacity: 0, transform: 'translateY(20px)' }}>
              <p style={{ 
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.75rem'
              }}>
                Step 01
              </p>
              <div style={{ 
                borderRadius: '12px',
                border: '1px solid rgba(74,68,56,0.3)',
                backgroundColor: 'rgba(38,35,32,0.5)',
                overflow: 'hidden',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(74,144,217,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  padding: '10px 16px',
                  backgroundColor: '#4A90D9'
                }}>
                  <span style={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#fff'
                  }}>
                    Design
                  </span>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4A90D9' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Drag &amp; drop nodes
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4A90D9' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Connect inputs/outputs
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4A90D9' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Tweak parameters
                    </span>
                  </div>
                </div>
                <div style={{ position: 'relative', height: '12px' }}>
                  <div style={{ 
                    position: 'absolute',
                    right: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid #4A90D9',
                    backgroundColor: '#262320'
                  }}/>
                </div>
              </div>
            </div>

            {/* Step 02: Export */}
            <div style={{ position: 'relative', animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards', opacity: 0, transform: 'translateY(20px)' }}>
              <p style={{ 
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.75rem'
              }}>
                Step 02
              </p>
              <div style={{ 
                borderRadius: '12px',
                border: '1px solid rgba(74,68,56,0.3)',
                backgroundColor: 'rgba(38,35,32,0.5)',
                overflow: 'hidden',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(184,118,60,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  padding: '10px 16px',
                  backgroundColor: '#B8763C'
                }}>
                  <span style={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#fff'
                  }}>
                    Export
                  </span>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B8763C' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Validate schema
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B8763C' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Export .json
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B8763C' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Hot-reload via Bridge
                    </span>
                  </div>
                </div>
                <div style={{ position: 'relative', height: '12px' }}>
                  <div style={{ 
                    position: 'absolute',
                    right: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid #B8763C',
                    backgroundColor: '#262320'
                  }}/>
                  <div style={{ 
                    position: 'absolute',
                    left: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid #B8763C',
                    backgroundColor: '#262320'
                  }}/>
                </div>
              </div>
            </div>

            {/* Step 03: Share */}
            <div style={{ position: 'relative', animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards', opacity: 0, transform: 'translateY(20px)' }}>
              <p style={{ 
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.75rem'
              }}>
                Step 03
              </p>
              <div style={{ 
                borderRadius: '12px',
                border: '1px solid rgba(74,68,56,0.3)',
                backgroundColor: 'rgba(38,35,32,0.5)',
                overflow: 'hidden',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(90,172,166,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  padding: '10px 16px',
                  backgroundColor: '#5AACA6'
                }}>
                  <span style={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#fff'
                  }}>
                    Share
                  </span>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5AACA6' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Upload to TerraNova
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5AACA6' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Tag &amp; describe
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5AACA6' }}/>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Community discovers
                    </span>
                  </div>
                </div>
                <div style={{ position: 'relative', height: '12px' }}>
                  <div style={{ 
                    position: 'absolute',
                    left: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid #5AACA6',
                    backgroundColor: '#262320'
                  }}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ 
            fontFamily: "'Libre Baskerville', serif", 
            fontSize: '2rem', 
            marginBottom: '1.5rem',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Coming Soon
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginBottom: '2rem' }}>
            Features in development
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <div style={{ 
              padding: '24px', 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(181,146,76,0.4)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(181,146,76,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ 
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 10px',
                backgroundColor: 'rgba(181,146,76,0.2)',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#B8763C',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Soon
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C8 5.79 9.79 4 12 4H28C30.21 4 32 5.79 32 8V32C32 34.21 30.21 36 28 36H12C9.79 36 8 34.21 8 32V8Z" stroke="rgba(181,146,76,0.6)" strokeWidth="2"/>
                  <path d="M14 12H26M14 18H22M14 24H18" stroke="rgba(181,146,76,0.8)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>Documentation</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Comprehensive guides, API reference, and tutorials for TerraNova
              </p>
            </div>
            <div style={{ 
              padding: '24px', 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(181,146,76,0.4)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(181,146,76,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ 
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 10px',
                backgroundColor: 'rgba(181,146,76,0.2)',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#B8763C',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Soon
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="24" height="24" rx="4" stroke="rgba(181,146,76,0.6)" strokeWidth="2"/>
                  <path d="M16 16L20 20L16 24" stroke="rgba(181,146,76,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 24H28" stroke="rgba(181,146,76,0.8)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>Examples</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Sample templates and world generation examples to get started
              </p>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div style={{ 
          padding: '3rem', 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{ 
            fontFamily: "'Libre Baskerville', serif", 
            fontSize: '2rem', 
            marginBottom: '1rem',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Start building worlds
          </h2>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '1.1rem', 
            marginBottom: '2rem', 
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Download TerraNova for free and start creating stunning Hytale terrain with our visual node editor.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Free and open source — forever.
          </p>
          <a
            href="https://github.com/HyperSystems-Development/TerraNova/releases"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 40px',
              backgroundColor: '#fff',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1.1rem',
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Download TerraNova
          </a>
        </div>

        {/* Community Section */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ 
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#B8763C',
              marginBottom: '0.75rem'
            }}>
              Community
            </p>
            <h2 style={{ 
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '2rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              Join the community
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginTop: '1rem' }}>
              Connect with other worldgen creators and get help from the team.
            </p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Discord Card */}
            <a
              href="https://discord.gg/SNPjyfkYPc"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                border: '1px solid rgba(74,68,56,0.3)',
                backgroundColor: 'rgba(38,35,32,0.5)',
                padding: '2rem',
                textAlign: 'center',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
                opacity: 0,
                transform: 'translateY(20px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.borderColor = 'rgba(90, 172, 166, 0.5)';
                e.currentTarget.style.boxShadow = '0 16px 50px rgba(90, 172, 166, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'rgba(74,68,56,0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              }}
            >
              <div style={{ 
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                opacity: 0.06
              }}>
                <svg viewBox="0 0 300 250" fill="none" style={{ width: '100%', height: '100%', animation: 'float 6s ease-in-out infinite' }}>
                  <rect x="20" y="30" width="80" height="30" rx="4" fill="#5AACA6"/>
                  <rect x="200" y="160" width="80" height="30" rx="4" fill="#5AACA6"/>
                  <path d="M 100 45 C 140 45, 160 175, 200 175" stroke="#5AACA6" strokeWidth="2" strokeDasharray="6 4"/>
                </svg>
              </div>
              <div style={{ 
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                padding: '12px 20px',
                backgroundColor: 'rgba(90, 172, 166, 0.125)'
              }}>
                <div style={{ 
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: '4px',
                  borderRadius: '12px 12px 0 0',
                  backgroundColor: '#5AACA6'
                }}/>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5AACA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>
                </svg>
              </div>
              <h3 style={{ 
                marginTop: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)'
              }}>
                Discord Community
              </h3>
              <p style={{ 
                marginTop: '0.75rem',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                color: 'rgba(255,255,255,0.5)'
              }}>
                Join the HyperSystems Discord for help, feedback, and to share your creations with other builders.
              </p>
              <span style={{ 
                marginTop: '1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                border: '1px solid rgba(74,68,56,0.3)',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#B8763C',
                transition: 'all 0.2s'
              }}>
                Join Discord →
              </span>
            </a>

            {/* GitHub Card */}
            <a
              href="https://github.com/HyperSystems-Development/TerraNova"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                border: '1px solid rgba(74,68,56,0.3)',
                backgroundColor: 'rgba(38,35,32,0.5)',
                padding: '2rem',
                textAlign: 'center',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
                opacity: 0,
                transform: 'translateY(20px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.borderColor = 'rgba(107, 158, 90, 0.5)';
                e.currentTarget.style.boxShadow = '0 16px 50px rgba(107, 158, 90, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'rgba(74,68,56,0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              }}
            >
              <div style={{ 
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                opacity: 0.06
              }}>
                <svg viewBox="0 0 300 250" fill="none" style={{ width: '100%', height: '100%', animation: 'float 6s ease-in-out infinite 3s' }}>
                  <rect x="20" y="30" width="80" height="30" rx="4" fill="#6B9E5A"/>
                  <rect x="200" y="160" width="80" height="30" rx="4" fill="#6B9E5A"/>
                  <path d="M 100 45 C 140 45, 160 175, 200 175" stroke="#6B9E5A" strokeWidth="2" strokeDasharray="6 4"/>
                </svg>
              </div>
              <div style={{ 
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                padding: '12px 20px',
                backgroundColor: 'rgba(107, 158, 90, 0.125)'
              }}>
                <div style={{ 
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: '4px',
                  borderRadius: '12px 12px 0 0',
                  backgroundColor: '#6B9E5A'
                }}/>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B9E5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </div>
              <h3 style={{ 
                marginTop: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)'
              }}>
                GitHub
              </h3>
              <p style={{ 
                marginTop: '0.75rem',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                color: 'rgba(255,255,255,0.5)'
              }}>
                Contribute to TerraNova, report bugs, request features, or browse the full source code.
              </p>
              <span style={{ 
                marginTop: '1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                border: '1px solid rgba(74,68,56,0.3)',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#B8763C',
                transition: 'all 0.2s'
              }}>
                View on GitHub →
              </span>
            </a>
          </div>
        </div>

        {/* Contributor Section */}
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'rgba(255,255,255,0.03)', 
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
          opacity: 0,
          transform: 'translateY(20px)'
        }}>
          {/* Decorative background pattern */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            opacity: '0.03',
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none'
          }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <path d="M16 8V16L22 20" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              My Contribution
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
              Contributor (systems, tooling, UI) • <a href="https://github.com/HyperSystems-Development/TerraNova" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'underline' }}>HyperSystems Development</a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default TerranovaPage;
