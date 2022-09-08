Uses the branch name to identify the JIRA ticket and adds a link to the ticket in the PR as a comment.

# Configuration

Filename: `.github/workflows/jira_assignment.yml`

Example v3 config:
```yml
name: jira-ticket-pr-comment
on: [pull_request]

jobs:
  pr-comment:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Link Jira Ticket
        uses: McCarthyFinch/jira-ticket-assigner@v2
        with:
          # Jira url domain
          jira-url: https://mccarthyfinch.atlassian.net
          # Ticket prefix such as MYPROJ in MYPROJ-1234
          project-prefixes: 'PA, ES'
```

Example v2 config:

```yml
name: jira-ticket-pr-comment
on: [pull_request]

jobs:
  pr-comment:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Link Jira Ticket
        uses: McCarthyFinch/jira-ticket-assigner@v2
        with:
          # Jira url domain
          jira-url: https://mccarthyfinch.atlassian.net
          # Ticket prefix such as MYPROJ in MYPROJ-1234
          project-prefix: PA
```
