// index.js — Updated: 2025-05-30 — Valid, no regex errors

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('analyzerForm');
  const urlInput = document.getElementById('url');
  const status = document.getElementById('status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const raw = urlInput.value.trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    const endpoint = `/friendly?type=summary&url=${encodeURIComponent(url)}`;

    status.textContent = 'Analyzing...';

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Unknown error');

      // Store in localStorage and redirect
      localStorage.setItem('seoData', JSON.stringify(data));
      localStorage.setItem('seoUrl', url);
      window.location.href = 'full-report.html';
    } catch (err) {
      console.error('❌', err);
      status.textContent = `Error: ${err.message}`;
    }
  });
});
