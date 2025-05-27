// public/index.js
document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('analyzeForm');
  const thankYou  = document.getElementById('thankYou');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Gather inputs
    let url     = document.getElementById('urlInput').value.trim();
    const name    = document.getElementById('nameInput').value.trim();
    const email   = document.getElementById('emailInput').value.trim();
    const company = document.getElementById('companyInput').value.trim();
    const comment = document.getElementById('commentInput').value.trim();

    // Normalize URL
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Send contact data
    try {
      await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, url, comment }),
      });
    } catch (err) {
      console.error('Contact submission failed:', err);
      // Continue anyway
    }

    // Show thank-you
    thankYou.style.display = 'block';

    // Redirect to full-report with all data
    const params = new URLSearchParams({ name, email, company, url, comment });
    setTimeout(() => {
      window.location.href = `full-report.html?${params.toString()}`;
    }, 2000); // give user a moment to see thank-you
  });
});