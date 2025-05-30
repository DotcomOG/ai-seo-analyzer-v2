// public/index.js
// Generated on 2025-05-27 13:00 PM ET

document.addEventListener('DOMContentLoaded', () => {
  const lightbox    = document.getElementById('lightbox');
  const main        = document.getElementById('main');
  const urlInput    = document.getElementById('urlInput');
  const goBtn       = document.getElementById('goBtn');
  const readiness   = document.getElementById('readiness');
  const reportBtn   = document.getElementById('reportBtn');

  // Normalize URL helper
  function normalize(u) {
    u = u.trim();
    if (!/^https?:\\/\\//i.test(u)) u = 'https://' + u;
    return u;
  }

  // Fetch and render readiness
  function fetchReady(url) {
    readiness.textContent = 'Loading...';
    fetch(`/friendly?type=summary&url=${encodeURIComponent(url)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => {
        const insights = data.ai_engine_insights || {};
        const chatKey  = Object.keys(insights).find(k => /chatgpt/i.test(k));
        const gemKey   = Object.keys(insights).find(k => /gemini/i.test(k));
        let html = '';
        if (chatKey) {
          const c = insights[chatKey];
          html += `<div class="insight">
                     <h2>ChatGPT Readiness</h2>
                     <p><strong>Score:</strong> ${c.score}</p>
                     <p>${c.insight}</p>
                   </div>`;
        }
        if (gemKey) {
          const g = insights[gemKey];
          html += `<div class="insight">
                     <h2>Gemini Readiness</h2>
                     <p><strong>Score:</strong> ${g.score}</p>
                     <p>${g.insight}</p>
                   </div>`;
        }
        readiness.innerHTML = html || '<p>No ChatGPT or Gemini insights available.</p>';
      })
      .catch(err => {
        readiness.textContent = `Error: ${err}`;
        console.error(err);
      });
  }

  // Entry point
  const params = new URLSearchParams(window.location.search);
  let url = params.get('url') || '';
  if (url) {
    url = normalize(url);
    lightbox.style.display = 'none';
    main.style.display = 'block';
    fetchReady(url);
  }

  // Lightbox submit
  goBtn.addEventListener('click', () => {
    const u = normalize(urlInput.value);
    if (!u) return;
    window.location.href = `index.html?url=${encodeURIComponent(u)}`;
  });
  urlInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goBtn.click();
    }
  });

  // Contact form submit
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
