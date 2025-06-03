// index.js — Last updated: 2025-06-02 18:20 ET

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('urlInputModal');
  const urlInput = document.getElementById('urlInput');
  const submitBtn = document.getElementById('submitBtn');
  const loadingMessage = document.getElementById('loadingMessage');
  const resultContainer = document.getElementById('resultContainer');
  const contactForm = document.getElementById('contactForm');

  submitBtn.addEventListener('click', handleAnalyze);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAnalyze();
  });

  function handleAnalyze() {
    const url = urlInput.value.trim();
    if (!url) return alert('Please enter a valid URL');

    modal.classList.add('hidden');
    loadingMessage.textContent = 'SnipeRank is analyzing. It may take up to a minute.';

    fetch(`https://ai-seo-backend-final.onrender.com/friendly?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        console.log('Analysis result:', data);
        renderReport(data);
      })
      .catch(err => {
        console.error('Error fetching analysis:', err);
        loadingMessage.textContent = 'Something went wrong. Please try again.';
      });
  }

  function renderReport(data) {
    loadingMessage.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    document.getElementById('resultUrl').textContent = `Analyzed URL: ${data.url || 'N/A'}`;
    document.getElementById('scoreValue').textContent = data.score ?? 'N/A';

    // Superpowers
    const superpowersList = document.getElementById('superpowersList');
    superpowersList.innerHTML = '';
    (data.superpowers || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      superpowersList.appendChild(li);
    });

    // Opportunities
    const opportunitiesList = document.getElementById('opportunitiesList');
    opportunitiesList.innerHTML = '';
    (data.opportunities || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      opportunitiesList.appendChild(li);
    });

    // AI Engine Insights
    const insightsList = document.getElementById('aiInsightsList');
    insightsList.innerHTML = '';
    (data.insights || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      insightsList.appendChild(li);
    });

    // Show contact form now that everything loaded
    contactForm.classList.remove('hidden');
  }
});
