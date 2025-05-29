// full-report.js - Generated on 2025-05-27 10:45 AM ET

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let url = params.get('url') || '';
  const name = params.get('name') || '';
  const email = params.get('email') || '';
  const company = params.get('company') || '';
  const comment = params.get('comment') || '';

  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  document.getElementById('metadata').innerHTML = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Company:</strong> ${company}</p>
    <p><strong>URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
    <p><strong>Comment:</strong> ${comment || '—'}</p>
  `;

  fetch(`/friendly?type=summary&url=${encodeURIComponent(url)}`)
    .then(r => r.json())
    .then(data => renderReport(data))
    .catch(err => {
      document.getElementById('report').textContent = 'Error: ' + err;
    });

  function updateMail() {
    const phone = document.getElementById('phoneInput').value.trim();
    const time = document.getElementById('timeInput').value.trim();
    const body = `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nURL: ${url}\nComment: ${comment}\nPhone: ${phone}\nBest Time: ${time}`;
    document.getElementById('callLink').href = `mailto:yestrategies.dev@gmail.com?subject=Call%20Request&body=${encodeURIComponent(body)}`;
  }

  document.getElementById('phoneInput').addEventListener('input', updateMail);
  document.getElementById('timeInput').addEventListener('input', updateMail);
  updateMail();
});

function renderReport(d) {
  const rpt = document.getElementById('report');
  let html = `<h2>Overall Score: ${d.score ?? 'N/A'}</h2>`;
  html += '<h3>AI Superpowers</h3><ul>';
  (d.ai_superpowers || []).forEach(sp => {
    html += `<li><strong>${sp.title}</strong>: ${sp.explanation}</li>`;
  });
  html += '</ul>';
  html += '<h3>AI Opportunities</h3><ul>';
  (d.ai_opportunities || []).forEach(op => {
    html += `<li><strong>${op.title}</strong>: ${op.explanation}</li>`;
  });
  html += '</ul>';
  html += '<h3>AI Engine Insights</h3><ul>';
  if (d.ai_engine_insights) {
    Object.entries(d.ai_engine_insights).forEach(([engine, info]) => {
      html += `<li><strong>${engine} (Score ${info.score})</strong>: ${info.insight}</li>`;
    });
  }
  html += '</ul>';
  rpt.innerHTML = html;
}
