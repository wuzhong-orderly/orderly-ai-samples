# Orderly Network AI Agent Samples

This repository demonstrates the power of **AI Agent Skills** to accelerate development on the [Orderly Network](https://orderly.network/).

It showcases how custom agent skills—defined in the `.github/skills` directory—enable AI assistants (like GitHub Copilot with Gemini Models) to perform complex tasks, such as generating market data dashboards or scaffolding full Decentralized Exchanges (DEXs) from a single prompt.

## 🛠 Project Structure

- **`.github/skills/`**: Contains the skill definitions that teach the AI agent how to interact with Orderly.
    - `low-level-api`: Instructions for working with Orderly's public and private APIs.
    - `create-dex-from-template`: Automation for scaffolding a complete DEX using the Orderly One template.
- **`market-data-sample/`**: A sample project displaying public market data (prices, volumes, 24h changes).
- **`account-info-sample/`**: A sample project for viewing authenticated account data (assets, positions, PnL).
- **`dex-sample/`**: A fully scaffolded DEX generated using the "Create DEX" skill.

## 🤖 AI Agent Configuration

**Tested Environment:**
- **IDE:** Visual Studio Code
- **AI Model:** Gemini 3 Pro (via GitHub Copilot Chat)

## 🚀 How to Test

You can reproduce the results in this repository by using the following prompts with your AI assistant.

### Scenario 1: Low-Level API Integration (Public Data)
*Demonstrates fetching and displaying public market data.*

> **Prompt:** "Generate a page to display information of market data for different symbols on Orderly including its volume and Price."

### Scenario 2: Low-Level API Integration (Authenticated)
*Demonstrates fetching and displaying private account data with ed25519 authentication.*

> **Prompt:** "Create a web page to display a user's current assets and open positions on Orderly. User input is account id, secret key and network selection (mainnet/testnet)."

### Scenario 3: Full DEX Scaffolding & Theming
*Demonstrates complex project creation and customization.*

> **Prompt:** "Create an orderly dex for me."

*Follow-up Prompt:*
> "Make the theme an autumn theme with a logo of a beautiful tree."
