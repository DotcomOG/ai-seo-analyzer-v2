// public/index.js
// Generated on 2025-05-27 16:10 PM ET

document.addEventListener('DOMContentLoaded', () => {
  const lightbox  = document.getElementById('lightbox');
  const main      = document.getElementById('main');
  const urlInput  = document.getElementById('urlInput');
  const goBtn     = document.getElementById('goBtn');
  const readiness = document.getElementById('readiness');
  const reportBtn = document.getElementById('reportBtn');

  // Railway production backend URL:
  const BACKEND_URL = 'https://ai-seo-analyzer-v2-production.up.railway.app';

  // Normalize any input URL by prepending https:// if missing
  function normalize(u) {
    u = u.trim();
    if (!/^https?:\/\//i.test(u)) {
      u = 'https://' + u;
    }
    return u;
  }

  // Fetch and render readiness panels + overall score + top-5 engines
  function fetchReady(url) {
    readiness.textContent = 'Loading...';

    fetch(`${BACKEND_URL}/friendly?type=summary&url=${encodeURIComponent(url)}`)
      .then(response => {
        if (!response.ok) throw new Error(`Status ${response.status}: ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        // 1. Overall Score
        let html = `<h2>Overall Score: ${data.score ?? 'N/A'}</h2>`;

        // 2. ChatGPT & Gemini (focus on two-to-three lines each)
        const insights = data.ai_engine_insights || {};
        const chatKey  = Object.keys(insights).find(k => /chatgpt/i.test(k));
        const gemKey   = Object.keys(insights).find(k => /gemini/i.test(k));

        if (chatKey) {
          const c = insights[chatKey];
          html += `
            <div class="insight">
              <h3>ChatGPT Readiness</h3>
              <p><strong>Score:</strong> ${c.score}</p>
              <p>${c.insight}</p>
            </div>
          `;
        }
        if (gemKey) {
          const g = insights[gemKey];
          html += `
            <div class="insight">
              <h3>Gemini Readiness</h3>
              <p><strong>Score:</strong> ${g.score}</p>
              <p>${g.insight}</p>
            </div>
          `;
        }

        // 3. Top 5 AI Search Engines & analysis (score + impact-only insight)
        const entries = Object.entries(insights);
        html += `<h2>Top 5 AI Search Engine Analysis</h2><ul>`;
        entries.slice(0, 5).forEach(([engineName, info]) => {
          html += `
            <li>
              <strong>${engineName} — Score: ${info.score}</strong>
              <p>${info.insight}</p>
            </li>
          `;
        });
        html += `</ul>`;

        readiness.innerHTML = html;
      })
      .catch(err => {
        readiness.textContent = `Error: ${err.message || err}`;
        console.error(err);
      });
  }

  // On page load, check if URL query param exists
  const params = new URLSearchParams(window.location.search);
  let url = params.get('url') || '';
  if (url) {
    url = normalize(url);
    lightbox.style.display = 'none';
    main.style.display = 'block';
    fetchReady(url);
  }

  // Lightbox submission: reload with URL param
  goBtn.addEventListener('click', () => {
    const input = normalize(urlInput.value);
    if (!input) return;
    window.location.href = `index.html?url=${encodeURIComponent(input)}`;
  });
  urlInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goBtn.click();
    }
  });

  // Contact form “Get Full Report” redirect to full-report.html
  reportBtn.addEventListener('click', () => {
    const name    = document.getElementById('nameInput').value.trim();
    const email   = document.getElementById('emailInput').value.trim();
    const company = document.getElementById('companyInput').value.trim();
    if (!name || !email || !company) {
      alert('Please fill all fields.');
      return;
    }
    const qs = new URLSearchParams({ url, name, email, company });
    window.location.href = `full-report.html?${qs.toString()}`;
  });
});
