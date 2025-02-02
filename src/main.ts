import * as core from '@actions/core';
import * as github from '@actions/github';

function getTicketID(branchName: string, projectPrefixes: string[]) {
	core.info(branchName + " " + JSON.stringify(projectPrefixes));
	const regexes: RegExp[] = projectPrefixes
		.map(projectPrefix => new RegExp(`${projectPrefix}-[0-9]+`, 'gm'));
	let ticketID: string = "";
	for (let i = 0; i < regexes.length; i++) {
		const regex = regexes[i];
		const ticketMatches: string[] = branchName.match(regex) || [];
		if (ticketMatches.length) {
			ticketID = ticketMatches.reverse()[0]; // get last matching jira ticket
			break;
		}
	}
	return ticketID;
}

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token');
    const jira: string = core.getInput('jira-url');
    const projectPrefixes: string[] = core.getMultilineInput('project-prefixes');
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

		const ticketID = getTicketID(
			branchName,
			projectPrefixes.map(prefix => prefix.trim()).filter(prefix => !!prefix),
		);

		core.info("ticketID: " + ticketID);

    if (ticketID) {
      const body: string = `Jira Ticket: [${jira}/browse/${ticketID}](${jira}/browse/${ticketID})`;

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
