// public/full-report.js
document.addEventListener('DOMContentLoaded', () => {
  const params   = new URLSearchParams(window.location.search);
  let rawUrl      = params.get('url') || '';
  const name      = params.get('name') || '';
  const email     = params.get('email') || '';
  const company   = params.get('company') || '';
  const comment   = params.get('comment') || '';
  const metaDiv   = document.getElementById('meta');
  const thankDiv  = document.getElementById('thankYou');
  const rptDiv    = document.getElementById('report');

  // Normalize URL
  if (!/^https?:\/\//i.test(rawUrl)) {
    rawUrl = 'https://' + rawUrl;
  }

  // Show metadata + comment + thank you
  metaDiv.innerHTML = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Company/Org:</strong> ${company}</p>
    <p><strong>URL:</strong> <a href="${rawUrl}" target="_blank">${rawUrl}</a></p>
    <p><strong>Comment:</strong> ${comment || '—'}</p>
  `;
  thankDiv.textContent = `Thank you, ${name}! We’ll reach out soon to schedule an appointment.`;

  // Fetch and render analysis
  fetch(`/friendly?type=summary&url=${encodeURIComponent(rawUrl)}`)
    .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
    .then(data => renderFullReport(data))
    .catch(err => {
      rptDiv.textContent = `Error loading report: ${err}`;
      console.error(err);
    });

  // Schedule button
  document.getElementById('scheduleBtn').addEventListener('click', () => {
    const phone = document.getElementById('phoneInput').value.trim();
    const time  = document.getElementById('timeSelect').value;
    const subject = encodeURIComponent(`Call Request from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nPhone: ${phone}\nBest Time: ${time}\n\nComment: ${comment}\nURL: ${rawUrl}`
    );
    window.location.href = `mailto:yestrategies.dev@gmail.com?subject=${subject}&body=${body}`;
  });
});

function renderFullReport(d) {
  const rptDiv = document.getElementById('report');
  let html = `<h2>Overall Score: ${d.score ?? 'N/A'}</h2>`;

  html += '<h2>AI Superpowers</h2><ul>';
  d.ai_superpowers.forEach(sp => {
    html += `<li><strong>${sp.title}</strong><p>${sp.explanation}</p></li>`;
  });
  html += '</ul>';

  html += '<h2>AI Opportunities</h2><ul>';
  d.ai_opportunities.forEach(op => {
    html += `<li><strong>${op.title}</strong><p>${op.explanation}</p></li>`;
  });
  html += '</ul>';

  html += '<h2>AI Engine Insights</h2><ul>';
  Object.entries(d.ai_engine_insights).forEach(([engine, info]) => {
    html += `<li><strong>${engine} — Score ${info.score}</strong><p>${info.insight}</p></li>`;
  });
  html += '</ul>';

  rptDiv.innerHTML = html;
}