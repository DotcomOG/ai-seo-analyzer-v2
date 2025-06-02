// public/full-report.js
// Generated on 2025-05-27 18:15 PM ET

document.addEventListener('DOMContentLoaded', () => {
  const params      = new URLSearchParams(window.location.search);
  let url           = params.get('url') || '';
  const name        = params.get('name') || '';
  const email       = params.get('email') || '';
  const company     = params.get('company') || '';
  const metaDiv     = document.getElementById('meta');
  const thankDiv    = document.getElementById('thankYou');
  const spList      = document.getElementById('superpowerList');
  const opList      = document.getElementById('opportunityList');
  const engList     = document.getElementById('engineInsightsList');

  // Railway backend URL
  const BACKEND_URL = 'https://ai-seo-analyzer-v2-production.up.railway.app';

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // 1. Render metadata banner
  metaDiv.innerHTML = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Company/Org:</strong> ${company}</p>
    <p><strong>URL Tested:</strong> <a href="${url}" target="_blank">${url}</a></p>
  `;

  thankDiv.textContent = `Thank you, ${name}! We’ll reach out shortly to schedule your appointment.`;

  // 2. Fetch the detailed analysis
  fetch(`${BACKEND_URL}/friendly?type=summary&url=${encodeURIComponent(url)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      // 2a. Top 5 AI Superpowers
      spList.innerHTML = '';
      data.ai_superpowers.forEach(sp => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${sp.title}</strong><p>${sp.explanation}</p>`;
        spList.appendChild(li);
      });

      // 2b. Top 10 AI Opportunities
      opList.innerHTML = '';
      data.ai_opportunities.forEach(op => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${op.title}</strong><p>${op.explanation}</p>`;
        opList.appendChild(li);
      });

      // 2c. Four AI Engine Insights
      engList.innerHTML = '';
      ['ChatGPT', 'Gemini', 'MS Copilot', 'Perplexity'].forEach(key => {
        if (data.ai_engine_insights[key]) {
          const info = data.ai_engine_insights[key];
          const li = document.createElement('li');
          li.innerHTML = `<strong>${key} — Score: ${info.score}</strong><p>${info.insight}</p>`;
          engList.appendChild(li);
        }
      });
    })
    .catch(err => {
      spList.textContent = `Error loading superpowers: ${err.message}`;
      opList.textContent = '';
      engList.textContent = '';
      console.error(err);
    });

  // 3. Schedule-a-call mailto
  document.getElementById('scheduleBtn').addEventListener('click', () => {
    const phone = document.getElementById('phoneInput').value.trim();
    const time  = document.getElementById('timeSelect').value;
    const subject = encodeURIComponent(`Call Request from ${name}`);
    const body    = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nPhone: ${phone}\nBest Time: ${time}\nURL: ${url}`
    );
    window.location.href = `mailto:you@yourdomain.com?subject=${subject}&body=${body}`;
  });
});
