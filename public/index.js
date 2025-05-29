// index.js - Generated on 2025-05-27 10:45 AM ET

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let url = params.get('url');
  const lightbox = document.getElementById('lightbox');
  const main = document.getElementById('main');

  if (url) {
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    lightbox.style.display = 'none';
    main.style.display = 'block';
    fetch(`/friendly?type=summary&url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(data => renderReadiness(data))
      .catch(err => {
        document.getElementById('readiness').textContent = 'Error: ' + err;
      });
  }

  document.getElementById('lightboxBtn').addEventListener('click', () => {
    let entered = document.getElementById('lightboxInput').value.trim();
    if (!entered) return;
    if (!/^https?:\/\//i.test(entered)) entered = 'https://' + entered;
    window.location.search = '?url=' + encodeURIComponent(entered);
  });

  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('nameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const company = document.getElementById('companyInput').value.trim();
    const comment = document.getElementById('commentInput').value.trim();
    if (!name || !email || !company) return;
    const q = new URLSearchParams({ url, name, email, company, comment });
    window.location.href = 'full-report.html?' + q.toString();
  });
});

function renderReadiness(d) {
  const div = document.getElementById('readiness');
  if (d.ai_engine_insights) {
    let html = '';
    const chat = d.ai_engine_insights.ChatGPT || d.ai_engine_insights.chatgpt;
    if (chat) html += `<div class="insight"><h2>ChatGPT</h2><p>${chat.insight}</p><p>Score: ${chat.score}</p></div>`;
    const gem = d.ai_engine_insights.Gemini || d.ai_engine_insights.gemini;
    if (gem) html += `<div class="insight"><h2>Gemini</h2><p>${gem.insight}</p><p>Score: ${gem.score}</p></div>`;
    div.innerHTML = html;
  } else {
    div.textContent = 'No readiness data';
  }
}
