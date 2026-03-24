import Layout from '@/components/Layout/Layout';
import '@/styles/about-widget.css';

const AboutPage = () => (
  <Layout>
    <div className="ss-about-section">
      {/* Header */}
      <div className="ss-about-header">
        <h1>About</h1>
      </div>

      {/* Bio Section */}
      <div className="ss-about-bio">
        <div className="ss-about-content">
          {/* Photo */}
          <div className="ss-about-photo">
            <img
              src="https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/assets/images/caleb-mccartney-photo.jpg"
              alt="Caleb McCartney - Professional Photographer"
            />
          </div>
          {/* Bio Text */}
          <div className="ss-about-text">
            <p>
              Caleb McCartney is a Pittsburgh‑based photojournalist and commercial storyteller who is finishing a BFA in Photography at{' '}
              <a href="https://pointpark.edu" target="_blank" rel="noopener">Point Park University</a>. After serving as Photo Editor of{' '}
              <a href="https://ppuglobe.com" target="_blank" rel="noopener">The Globe</a> for several months, he stepped back in March 2025 to devote full focus to his capstone thesis, <strong>"One Nation Divided,"</strong> a visual study of political polarization during the 2024 election cycle.
            </p>
            <p>
              Caleb leads <strong>McCal Media</strong>, the studio he founded to craft event coverage, corporate campaigns, and brand visuals rooted in authentic human connection. In 2025 he broadened his skill set by joining Pittsburgh production company{' '}
              <a href="https://wearecovalent.com/" target="_blank" rel="noopener">Covalent</a> as a Creative Production Intern, collaborating on projects that blend stills, motion, and sound.
            </p>
            <p>
              He also hosts the weekly podcast <a href="/podcast">"Caffeinated Connections,"</a> where he chats over coffee with creators and industry pros about turning ideas into impact.
            </p>
            <div className="ss-about-buttons">
              <a href="mailto:contact@mcc-cal.com" className="ss-about-btn ss-about-btn-primary">
                Get In Touch
              </a>
              <a
                href="https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/assets/downloads/caleb-mccartney-resume.pdf"
                download="Caleb-McCartney-Resume-August-2025.pdf"
                className="ss-about-btn ss-about-btn-secondary"
              >
                📄 Resume
              </a>
              <a
                href="#"
                onClick={e => { e.preventDefault(); alert('CV coming soon! Currently being updated.'); }}
                className="ss-about-btn ss-about-btn-secondary"
                style={{ opacity: 0.6, color: '#a0a0a0', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                📋 CV (Offline)
              </a>
              <a href="/work" className="ss-about-btn ss-about-btn-secondary">
                View Work
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="ss-reviews-section">
        <div className="ss-reviews-content">
          <h2 className="ss-reviews-title">What Clients Say</h2>
          <div className="ss-reviews-grid">
            {/* LinkedIn Review */}
            <blockquote className="ss-review-card">
              <div className="ss-review-platform">
                <div className="ss-platform-badge ss-platform-linkedin">LinkedIn</div>
              </div>
              <p className="ss-review-text">
                "Caleb is great to work with, always prompt and professional. His work speaks for itself. A hard working and talented young man sure to impress."
              </p>
              <cite className="ss-review-author">— Logan Spiker</cite>
              <div className="ss-review-title">Former Argo AI, Business Owner</div>
            </blockquote>
            {/* Google Review */}
            <blockquote className="ss-review-card">
              <div className="ss-review-platform">
                <div className="ss-platform-badge ss-platform-google">Google</div>
              </div>
              <div className="ss-review-stars">★★★★★</div>
              <p className="ss-review-text">
                "Caleb is an incredibly talented photographer. I'm always blown away by the quality of his work—so is everyone who sees it."
              </p>
              <cite className="ss-review-author">— Ben Orr</cite>
              <div className="ss-review-title">Concert Photography Client</div>
            </blockquote>
          </div>
          <div className="ss-reviews-cta">
            <p className="ss-reviews-rating">⭐ 5.0 Star Rating on Google</p>
            <a
              href="https://maps.app.goo.gl/CKztLDxynn6mwSwS8"
              target="_blank"
              rel="noopener"
              className="ss-reviews-btn"
            >
              📍 View All Reviews
            </a>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default AboutPage;
