import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token');
    const jira: string = core.getInput('jira-url');
    const projectPrefixList: string = core.getInput('project-prefixes');
		const projectPrefixes = projectPrefixList.split(',').map((prefix) => prefix.trim());
		console.log(projectPrefixes);
    const octokit = github.getOctokit(token);

    if (!github.context.payload.pull_request) {
      throw Error('No pull request payload');
    }

    if (!github.context.payload.repository) {
      throw Error('Error loading repo payload');
    }

    if (!github.context.payload.repository.owner.login) {
      throw Error('Error loading owner payload');
    }

    const branchName: string = github.context.payload.pull_request.head.ref;
    const issue_number: number = github.context.payload.pull_request.number;
    const owner: string = github.context.payload.repository.owner.login;
    const repo: string = github.context.payload.repository.name;
    const regexes: RegExp[] = projectPrefixes.map(projectPrefix => new RegExp(`(${projectPrefix}-[0-9]+)`, 'gm'));

		let ticketId: string = "";
		for (let i = 0; i < regexes.length; i++) {
			const regex = regexes[i];
			const ticketMatches: string[] = branchName.match(regex) || [];
			if (ticketMatches.length) {
				console.log(ticketMatches);
				ticketId = ticketMatches.reverse()[0]; // get last matching jira ticket
				break;
			}
		}

    if (ticketId) {
      const body: string = `Jira Ticket: [${jira}/browse/${ticketId}](${jira}/browse/${ticketId})`;

      const comments = await octokit.issues.listComments({
        issue_number,
        owner,
        repo
      });

      const foundComment: boolean = !!comments.data.find(it => it.body === body);

      if (!foundComment) {
        await octokit.issues.createComment({
          body,
          issue_number,
          repo,
          owner
        });
      } else {
        console.info('Jira ticket already assigned');
      }
    } else {
      console.info('No jira ticket found in branch');
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run().catch(reason => {
  core.setFailed(reason instanceof Error ? reason : new Error(reason));
});
