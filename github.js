// github.js
// Generated on 2025-05-27 13:00 PM ET
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Create or update a file in GitHub
 * @param {object} args
 * @param {string} args.owner   - GitHub owner/org
 * @param {string} args.repo    - Repo name
 * @param {string} args.path    - File path to create/update
 * @param {string} args.content - File contents (string)
 * @param {string} args.message - Commit message
 */
async function upsertFile({ owner, repo, path, content, message }) {
  let sha;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    sha = data.sha;
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    sha
  });
}

module.exports = { upsertFile };