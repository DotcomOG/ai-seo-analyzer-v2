// public/full-report.js
// Generated on 2025-05-27 13:00 PM ET

document.addEventListener('DOMContentLoaded', () => {
  const params  = new URLSearchParams(window.location.search);
  let url       = params.get('url') || '';
  const name    = params.get('name') || '';
  const email   = params.get('email') || '';
  const company = params.get('company') || '';
  const metaDiv = document.getElementById('meta');
  const thankDiv= document.getElementById('thankYou');
  const rptDiv  = document.getElementById('report');

  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  metaDiv.innerHTML = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Company/Org:</strong> ${company}</p>
    <p><strong>URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
  `;
  thankDiv.textContent = `Thank you, ${name}! We’ll reach out soon to schedule an appointment.`;

  fetch(`/friendly?type=summary&url=${encodeURIComponent(url)}`)
    .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
    .then(d => {
      let html = `<h2>Overall Score: ${d.score ?? 'N/A'}</h2>`;
      html += '<h2>AI Superpowers</h2><ul>';
      d.ai_superpowers.forEach(sp => {
        html += `<li><strong>${sp.title}</strong><p>${sp.explanation}</p></li>`;
      });
      html += '</ul><h2>AI Opportunities</h2><ul>';
      d.ai_opportunities.forEach(op => {
        html += `<li><strong>${op.title}</strong><p>${op.explanation}</p></li>`;
      });
      html += '</ul><h2>AI Engine Insights</h2><ul>';
      Object.entries(d.ai_engine_insights).forEach(([eng,info]) => {
        html += `<li><strong>${eng} — Score ${info.score}</strong><p>${info.insight}</p></li>`;
      });
      html += '</ul>';
      rptDiv.innerHTML = html;
    })
    .catch(err => {
      rptDiv.textContent = `Error loading report: ${err}`;
      console.error(err);
    });

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