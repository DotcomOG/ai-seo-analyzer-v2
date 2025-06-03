// full-report.js — Last updated: 2025-06-02 18:20 ET

document.addEventListener('DOMContentLoaded', () => {
  const url = new URLSearchParams(window.location.search).get('url');

  if (!url) {
    document.getElementById('fullResultUrl').textContent = 'No URL provided.';
    return;
  }

  fetch(`https://ai-seo-backend-final.onrender.com/full?url=${encodeURIComponent(url)}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('fullResultUrl').textContent = `Analyzed URL: ${data.url || url}`;
      document.getElementById('fullScore').textContent = `Overall Score: ${data.score ?? 'N/A'}/100`;

      // Superpowers
      const fullSuperpowers = document.getElementById('fullSuperpowers');
      fullSuperpowers.innerHTML = '';
      (data.superpowers || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        fullSuperpowers.appendChild(li);
      });

      // Opportunities
      const fullOpportunities = document.getElementById('fullOpportunities');
      fullOpportunities.innerHTML = '';
      (data.opportunities || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        fullOpportunities.appendChild(li);
      });

      // AI Insights
      const fullInsights = document.getElementById('fullInsights');
      fullInsights.innerHTML = '';
      (data.insights || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        fullInsights.appendChild(li);
      });

      // Reveal contact form
      document.getElementById('fullContactForm').classList.remove('hidden');
    })
    .catch(err => {
      console.error('Failed to load full report:', err);
      document.getElementById('fullResultUrl').textContent = 'Error fetching report. Please try again.';
    });
});
