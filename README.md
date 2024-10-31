# Project and Proposal Gateway Agent

API for creating and managing projects and proposals. You can generate a proposal and post it on the devhub, events, or infrastructure portal to get sponsorship or create a project and add it to the NEAR catalog.

[![Demo](https://img.shields.io/badge/Demo-Visit%20Demo-brightgreen)](https://ref-finance-agent-next.vercel.app/)
[![Deploy](https://img.shields.io/badge/Deploy-on%20Vercel-blue)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMintbase%2Fref-finance-agent-next)

**Tooling:**

[![Use Case](https://img.shields.io/badge/Use%20Case-AI-blue)](#)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2014-blue)](#)

## Project Walkthrough

Facilitates the creation and submission of projects and proposals for various sponsorship opportunities

#### Endpoints

**Create Proposal**

- **Endpoint:** `/api/create/proposal/:proposalDetails/:requestedSponsorshipAmount/:requestedSponsorshipToken/:receiverAccount/:supervisor`
- **Description:** Create a proposal to apply for sponsorship by posting it on the devhub, events, or infrastructure portal.

**Create DevHub Proposal**

- **Endpoint:** `/api/get/transaction/devhub/:title/:description/:category/:summary/:requestedSponsorshipAmount/:requestedSponsorshipToken/:receiverAccount/:supervisor`
- **Description:** Create a proposal to apply for sponsorship through the devhub.

**Create Events Proposal**

- **Endpoint:** `/api/get/transaction/events/:title/:description/:category/:summary/:requestedSponsorshipAmount/:requestedSponsorshipToken/:receiverAccount/:supervisor`
- **Description:** Create a proposal for events sponsorship.

**Create Infrastructure Proposal**

- **Endpoint:** `/api/get/transaction/infrastructure/:title/:description/:category/:summary/:requestedSponsorshipAmount/:requestedSponsorshipToken/:receiverAccount/:supervisor`
- **Description:** Create a proposal for infrastructure sponsorship.

**Create Project**

- **Endpoint:** `/api/create/project/:projectDetails/:discord/:medium/:twitter/:logo/:websiteLink/:whitepaper`
- **Description:** Create a detailed project.

**Create NEAR Catalogue Project**

- **Endpoint:** `/api/get/transaction/nearcatalog/:title/:description/:categories/:oneliner/:logo/:website/:dapp/:twitter/:medium/:discord/:whitepaper`
- **Description:** Create a NEAR catalogue project entry.

## Getting Started

[Docs to integrate](https://docs.mintbase.xyz/ai/assistant-plugins)

### Installation

Set `NEAR_ENV="mainnet"` in your `.env.local` file, you'll also need to add the `WORDWARE_API_KEY`.

```bash
# install dependencies
pnpm i

# start the development server
pnpm dev
```
