# orderly-skills

A small collection of focused "skill" guides for agents and automation. Each subfolder contains a `SKILL.md` describing a short, actionable task an agent can execute (for example: install a dependency, scaffold files, or configure an SDK).

Project structure

- `low-level-api/` — SKILL.md for working with low-level APIs
- `create-dex-from-template` — SKILL.md for creating a dex

Using these skills with Claude (Agent Skills)

1. Read the Agent Skills docs: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

Using these skills with VS Code custom agents

1. Read the VS Code docs: https://code.visualstudio.com/docs/copilot/customization/agent-skills

Quick usage

- In VS Code: Create a .github/skills directory in your workspace.
Create a subdirectory for your skill. Each skill should have its own directory.

- For Claude code: Create Skills as directories with SKILL.md files. Claude discovers and uses them automatically.