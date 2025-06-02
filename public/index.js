// public/index.js
// Generated on 2025-05-27 18:05 PM ET

document.addEventListener('DOMContentLoaded', () => {
  const lightbox    = document.getElementById('lightbox');
  const main        = document.getElementById('main');
  const urlInput    = document.getElementById('urlInput');
  const goBtn       = document.getElementById('goBtn');
  const pageHeader  = document.getElementById('pageHeader');
  const scoreEl     = document.getElementById('overallScore');
  const engineDiv   = document.getElementById('engineSections');
  const topEngines  = document.getElementById('engineList');
  const reportBtn   = document.getElementById('reportBtn');

  // Railway backend URL
  const BACKEND_URL = 'https://ai-seo-analyzer-v2-production.up.railway.app';

  // Normalize input URL (prepend https:// if missing)
  function normalizeUrl(u) {
    u = u.trim();
    if (!/^https?:\/\//i.test(u)) {
      u = 'https://' + u;
    }
    return u;
  }

  // Render the fetched data
  function renderData(url, data) {
    // 1. Header (URL tested)
    pageHeader.textContent = `Results for: ${url}`;

    // 2. Overall Score
    if (data.score === null || data.score === undefined) {
      scoreEl.textContent = 'N/A';
    } else {
      scoreEl.textContent = data.score;
    }

    // 3. ChatGPT & Gemini sections
    engineDiv.innerHTML = ''; // Clear previous
    ['ChatGPT', 'Gemini'].forEach(key => {
      if (data.ai_engine_insights[key]) {
        const info = data.ai_engine_insights[key];
        const card = document.createElement('div');
        card.className = 'insight';
        card.innerHTML = `
          <h3>${key} Readiness</h3>
          <p><strong>Score:</strong> ${info.score}</p>
          <p>${info.insight}</p>
        `;
        engineDiv.appendChild(card);
      }
    });

    // 4. Top 4 AI Search Engine Analysis (four engines exactly)
    topEngines.innerHTML = '';
    ['ChatGPT', 'Gemini', 'MS Copilot', 'Perplexity'].forEach(key => {
      if (data.ai_engine_insights[key]) {
        const info = data.ai_engine_insights[key];
        const li = document.createElement('li');
        li.innerHTML = `<strong>${key} — Score: ${info.score}</strong><p>${info.insight}</p>`;
        topEngines.appendChild(li);
      }
    });
  }

  // Fetch data from backend
  function fetchReady(url) {
    scoreEl.textContent = 'Loading…';
    engineDiv.innerHTML = '';
    topEngines.textContent = 'Loading…';

    fetch(`${BACKEND_URL}/friendly?type=summary&url=${encodeURIComponent(url)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Status ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        renderData(url, data);
      })
      .catch(err => {
        scoreEl.textContent = `Error: ${err.message}`;
        engineDiv.textContent = '';
        topEngines.textContent = '';
        console.error(err);
      });
  }

  // On load: if URL query param present, hide lightbox & show results
  const params = new URLSearchParams(window.location.search);
  let url = params.get('url') || '';
  if (url) {
    url = normalizeUrl(url);
    lightbox.style.display = 'none';
    main.style.display = 'block';
    fetchReady(url);
  }

  // Lightbox submission
  goBtn.addEventListener('click', () => {
    const input = normalizeUrl(urlInput.value);
    if (!input) return;
    window.location.href = `index.html?url=${encodeURIComponent(input)}`;
  });
  urlInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goBtn.click();
    }
  });

  // Contact form → redirect to full-report
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
