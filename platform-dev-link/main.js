import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = process.env["GITHUB_TOKEN"];
    if (!token) {
      core.setFailed("Requires: GITHUB_TOKEN");
      return;
    }

    const ctx = github.context;
    if (ctx.eventName !== "pull_request") {
      core.info(
        `Skipping PR: this isn't a pull_request event for us to handle`
      );
      return;
    }

    if (ctx.payload.action !== "opened") {
      core.info(
        `Skipping PR: this PR was already updated with a base branch label`
      );
      return;
    }

    const owner = ctx.repo.owner;
    const repo = ctx.repo.repo;
    const pull_number = ctx.payload.pull_request.number;

    const platform_url = core.getInput("platform_url", { required: true });
    let body = ctx.payload.pull_request.body;

    // Prepend platform URL to PR body
    body =
`${platform_url}

${body ? body : ""}`;

    const octokit = github.getOctokit(token);
    await octokit.rest.pulls.update({ owner, repo, pull_number, body });

  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
