import { NextResponse } from "next/server";
import { DEPLOYMENT_URL } from "vercel-url";

const key = JSON.parse(process.env.BITTE_KEY || "{}");
const config = JSON.parse(process.env.BITTE_CONFIG || "{}");

if (!key?.accountId) {
  console.warn("Missing account info.");
}
if (!config || !config.url) {
  console.warn("Missing config or url in config.");
}

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Project and Proposal Gateway API",
      description:
        "API for creating and managing projects and proposals, you can generate a proposal and post it on devhub, events or infrastructure portal to get sponsorship or create a project and add it to the near catalog.",
      version: "1.0.0",
    },
    servers: [
      {
        url:
          config?.url ||
          "https://project-proposal-bitte-agent-n2sqysr46.vercel.app/",
      },
    ],
    "x-mb": {
      "account-id": key.accountId || "megha-bitte.near",
      assistant: {
        name: "Project and Proposal Agent",
        description:
          "Facilitates the creation and submission of projects and proposals for various sponsorship opportunities.",
        instructions:
          "Use this API to submit project details and sponsorship requests to the relevant portals.",
        tools: [{ type: "generate-transaction" }],
      },
    },
    paths: {
      "/api/create/proposal/{projectDetails}/{requestedSponsorshipAmount}/{requestedSponsorshipToken}/{receiverAccount}/{supervisor}":
        {
          get: {
            description:
              "Create a proposal with specified details and sponsorship.",
            tags: ["create proposal"],
            operationId: "createProposal",
            parameters: [
              {
                in: "path",
                name: "projectDetails",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Details of the project for the proposal.",
              },
              {
                in: "path",
                name: "requestedSponsorshipAmount",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Amount of sponsorship requested.",
              },
              {
                in: "path",
                name: "requestedSponsorshipToken",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Token for the requested sponsorship.",
              },
              {
                in: "path",
                name: "receiverAccount",
                required: true,
                schema: {
                  type: "string",
                },
                description: "NEAR account that will receive the sponsorship.",
              },
              {
                in: "path",
                name: "supervisor",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "NEAR account of supervisor responsible for the proposal.",
              },
            ],
            responses: {
              "200": {
                description: "Proposal created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        Supervisor: {
                          type: "string",
                          description: "The supervisor's name or ID.",
                        },
                        Receiver: {
                          type: "string",
                          description: "The receiver's name or ID.",
                        },
                        "Requested Sponsorship Token": {
                          type: "string",
                          description: "The token requested for sponsorship.",
                        },
                        proposalDetails: {
                          type: "object",
                          description: "Details of the proposal.",
                          properties: {
                            title: {
                              type: "string",
                              description: "Title of the proposal.",
                            },
                            description: {
                              type: "string",
                              description:
                                "Detailed description of the proposal.",
                            },
                            // Add other properties of new_generation as needed
                          },
                        },
                      },
                      required: [
                        "Supervisor",
                        "Receiver",
                        "Requested Sponsorship Token",
                        "proposalDetails",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      "/api/get/transaction/devhub/{title}/{description}/{category}/{summary}/{requestedSponsorshipAmount}/{requestedSponsorshipToken}/{receiverAccount}/{supervisor}":
        {
          get: {
            description:
              "Creates a NEAR transaction payload to sign by user, it contains a proposal with the specified details to the DevHub portal.",
            operationId: "getDevhubTransaction",
            tags: ["Devhub portal"],
            parameters: [
              {
                name: "title",
                in: "path",
                required: true,
                description: "The title of the proposal.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "description",
                in: "path",
                required: true,
                description: "A detailed description of the proposal.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "category",
                in: "path",
                required: true,
                description: "The category under which the proposal falls.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "summary",
                in: "path",
                required: true,
                description: "A brief summary of the proposal.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "requestedSponsorshipAmount",
                in: "path",
                required: true,
                description: "The amount of sponsorship requested.",
                schema: {
                  type: "number",
                },
              },
              {
                name: "requestedSponsorshipToken",
                in: "path",
                required: true,
                description: "The token requested for sponsorship.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "receiverAccount",
                in: "path",
                required: true,
                description: "The account of the receiver.",
                schema: {
                  type: "string",
                },
              },
              {
                name: "supervisor",
                in: "path",
                required: true,
                description: "The account of the supervisor.",
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              "200": {
                description:
                  "Use this transaction data to call generate-transaction tool to generate a transaction.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        signerId: {
                          type: "string",
                          description:
                            "The account ID that should sign this transaction.",
                        },
                        publicKey: {
                          type: "string",
                          description:
                            "The public key associated with the signer account.",
                        },
                        nonce: {
                          type: "string",
                          description:
                            "A unique number to ensure the uniqueness of the transaction.",
                        },
                        receiverId: {
                          type: "string",
                          description:
                            "The account ID of the DAO contract that will receive this transaction.",
                        },
                        actions: {
                          type: "array",
                          description:
                            "The list of actions to be performed in this transaction.",
                          items: {
                            type: "object",
                            properties: {
                              functionCall: {
                                type: "object",
                                properties: {
                                  methodName: {
                                    type: "string",
                                    description:
                                      "The name of the contract method to be called.",
                                  },
                                  args: {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        description:
                                          "The type of the arguments data.",
                                      },
                                      data: {
                                        type: "array",
                                        items: {
                                          type: "integer",
                                        },
                                        description:
                                          "The encoded arguments for the function call.",
                                      },
                                    },
                                  },
                                  gas: {
                                    type: "string",
                                    description:
                                      "The amount of gas attached to this function call.",
                                  },
                                  deposit: {
                                    type: "string",
                                    description:
                                      "The amount of NEAR tokens attached to this function call.",
                                  },
                                },
                              },
                              enum: {
                                type: "string",
                                description:
                                  "The type of action being performed.",
                              },
                            },
                          },
                        },
                        blockHash: {
                          type: "object",
                          additionalProperties: {
                            type: "integer",
                          },
                          description:
                            "The hash of the block used as a reference for this transaction.",
                        },
                      },
                      required: [
                        "signerId",
                        "publicKey",
                        "nonce",
                        "receiverId",
                        "actions",
                        "blockHash",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      "/api/get/transaction/events/{title}/{description}/{category}/{summary}/{requestedSponsorshipAmount}/{requestedSponsorshipToken}/{receiverAccount}/{supervisor}":
        {
          get: {
            description:
              "Creates a NEAR transaction payload to sign by user, it contains a proposal with the specified details to the Events portal.",
            tags: ["Events portal"],
            operationId: "getEventsTransaction",
            parameters: [
              {
                in: "path",
                name: "title",
                required: true,
                schema: {
                  type: "string",
                },
                description: "The title of the event proposal.",
              },
              {
                in: "path",
                name: "description",
                required: true,
                schema: {
                  type: "string",
                },
                description: "A detailed description of the event.",
              },
              {
                in: "path",
                name: "category",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "The category under which the event proposal falls.",
              },
              {
                in: "path",
                name: "summary",
                required: true,
                schema: {
                  type: "string",
                },
                description: "A brief summary of the event proposal.",
              },
              {
                in: "path",
                name: "requestedSponsorshipAmount",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "The amount of sponsorship requested for the event.",
              },
              {
                in: "path",
                name: "requestedSponsorshipToken",
                required: true,
                schema: {
                  type: "string",
                },
                description: "The token requested for sponsorship.",
              },
              {
                in: "path",
                name: "receiverAccount",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "The NEAR account that will receive the sponsorship.",
              },
              {
                in: "path",
                name: "supervisor",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "NEAR account of the supervisor responsible for the proposal.",
              },
            ],
            responses: {
              "200": {
                description:
                  "Use this transaction data to call generate-transaction tool to generate a transaction.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        signerId: {
                          type: "string",
                          description:
                            "The account ID that should sign this transaction.",
                        },
                        publicKey: {
                          type: "string",
                          description:
                            "The public key associated with the signer account.",
                        },
                        nonce: {
                          type: "string",
                          description:
                            "A unique number to ensure the uniqueness of the transaction.",
                        },
                        receiverId: {
                          type: "string",
                          description:
                            "The account ID of the DAO contract that will receive this transaction.",
                        },
                        actions: {
                          type: "array",
                          description:
                            "The list of actions to be performed in this transaction.",
                          items: {
                            type: "object",
                            properties: {
                              functionCall: {
                                type: "object",
                                properties: {
                                  methodName: {
                                    type: "string",
                                    description:
                                      "The name of the contract method to be called.",
                                  },
                                  args: {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        description:
                                          "The type of the arguments data.",
                                      },
                                      data: {
                                        type: "array",
                                        items: {
                                          type: "integer",
                                        },
                                        description:
                                          "The encoded arguments for the function call.",
                                      },
                                    },
                                  },
                                  gas: {
                                    type: "string",
                                    description:
                                      "The amount of gas attached to this function call.",
                                  },
                                  deposit: {
                                    type: "string",
                                    description:
                                      "The amount of NEAR tokens attached to this function call.",
                                  },
                                },
                              },
                              enum: {
                                type: "string",
                                description:
                                  "The type of action being performed.",
                              },
                            },
                          },
                        },
                        blockHash: {
                          type: "object",
                          additionalProperties: {
                            type: "integer",
                          },
                          description:
                            "The hash of the block used as a reference for this transaction.",
                        },
                      },
                      required: [
                        "signerId",
                        "publicKey",
                        "nonce",
                        "receiverId",
                        "actions",
                        "blockHash",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      "/api/get/transaction/infrastructure/{title}/{description}/{category}/{summary}/{requestedSponsorshipAmount}/{requestedSponsorshipToken}/{receiverAccount}/{supervisor}":
        {
          get: {
            description:
              "Creates a NEAR transaction payload to sign by user, it contains a proposal with the specified details to the Infrastructure portal.",
            tags: ["Infrastructure portal"],
            operationId: "getInfrastructureTransaction",
            parameters: [
              {
                in: "path",
                name: "title",
                required: true,
                schema: {
                  type: "string",
                },
                description: "The title of the infrastructure proposal.",
              },
              {
                in: "path",
                name: "description",
                required: true,
                schema: {
                  type: "string",
                },
                description: "A detailed description of the infrastructure.",
              },
              {
                in: "path",
                name: "category",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "The category under which the infrastructure proposal falls.",
              },
              {
                in: "path",
                name: "summary",
                required: true,
                schema: {
                  type: "string",
                },
                description: "A brief summary of the infrastructure proposal.",
              },
              {
                in: "path",
                name: "requestedSponsorshipAmount",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "The amount of sponsorship requested for the infrastructure.",
              },
              {
                in: "path",
                name: "requestedSponsorshipToken",
                required: true,
                schema: {
                  type: "string",
                },
                description: "The token requested for sponsorship.",
              },
              {
                in: "path",
                name: "receiverAccount",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "The NEAR account that will receive the sponsorship.",
              },
              {
                in: "path",
                name: "supervisor",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "NEAR account of the supervisor responsible for the proposal.",
              },
            ],
            responses: {
              "200": {
                description:
                  "Use this transaction data to call generate-transaction tool to generate a transaction.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        signerId: {
                          type: "string",
                          description:
                            "The account ID that should sign this transaction.",
                        },
                        publicKey: {
                          type: "string",
                          description:
                            "The public key associated with the signer account.",
                        },
                        nonce: {
                          type: "string",
                          description:
                            "A unique number to ensure the uniqueness of the transaction.",
                        },
                        receiverId: {
                          type: "string",
                          description:
                            "The account ID of the DAO contract that will receive this transaction.",
                        },
                        actions: {
                          type: "array",
                          description:
                            "The list of actions to be performed in this transaction.",
                          items: {
                            type: "object",
                            properties: {
                              functionCall: {
                                type: "object",
                                properties: {
                                  methodName: {
                                    type: "string",
                                    description:
                                      "The name of the contract method to be called.",
                                  },
                                  args: {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        description:
                                          "The type of the arguments data.",
                                      },
                                      data: {
                                        type: "array",
                                        items: {
                                          type: "integer",
                                        },
                                        description:
                                          "The encoded arguments for the function call.",
                                      },
                                    },
                                  },
                                  gas: {
                                    type: "string",
                                    description:
                                      "The amount of gas attached to this function call.",
                                  },
                                  deposit: {
                                    type: "string",
                                    description:
                                      "The amount of NEAR tokens attached to this function call.",
                                  },
                                },
                              },
                              enum: {
                                type: "string",
                                description:
                                  "The type of action being performed.",
                              },
                            },
                          },
                        },
                        blockHash: {
                          type: "object",
                          additionalProperties: {
                            type: "integer",
                          },
                          description:
                            "The hash of the block used as a reference for this transaction.",
                        },
                      },
                      required: [
                        "signerId",
                        "publicKey",
                        "nonce",
                        "receiverId",
                        "actions",
                        "blockHash",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      "/api/create/project/{projectDetails}/{discord}/{medium}/{twitter}/{logo}/{websiteLink}/{whitepaper}":
        {
          get: {
            description:
              "Create a detailed project with specified details and links.",
            tags: ["create project"],
            operationId: "createProject",
            parameters: [
              {
                in: "path",
                name: "projectDetails",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Details of the project.",
              },
              {
                in: "path",
                name: "discord",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the project's Discord server.",
              },
              {
                in: "path",
                name: "medium",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the project's Medium article.",
              },
              {
                in: "path",
                name: "twitter",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the project's Twitter account.",
              },

              {
                in: "path",
                name: "logo",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the project's logo image.",
              },
              {
                in: "path",
                name: "websiteLink",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the project's official website.",
              },
              {
                in: "path",
                name: "whitepaper",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the project's whitepaper.",
              },
            ],
            responses: {
              "200": {
                description: "Project created successfully.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        discord: {
                          type: "string",
                          description: "Link to the project's Discord server.",
                        },
                        medium: {
                          type: "string",
                          description: "Link to the project's Medium article.",
                        },
                        twitter: {
                          type: "string",
                          description: "Link to the project's Twitter account.",
                        },
                        logo: {
                          type: "string",
                          description: "Link to the project's logo image.",
                        },
                        website: {
                          type: "string",
                          description:
                            "Link to the project's official website.",
                        },
                        whitepaper: {
                          type: "string",
                          description: "Link to the project's whitepaper.",
                        },
                        project: {
                          type: "object",
                          description: "Details of the new generation project.",
                          properties: {
                            title: {
                              type: "string",
                              description: "Title of the project.",
                            },
                            description: {
                              type: "string",
                              description:
                                "Detailed description of the project.",
                            },
                            oneliner: {
                              type: "string",
                              description: "Oneliner of the project.",
                            },
                          },
                        },
                      },
                      required: [
                        "discord",
                        "medium",
                        "twitter",
                        "logo",
                        "website",
                        "whitepaper",
                        "project",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      "/api/get/transaction/nearcatalog/{title}/{description}/{categories}/{oneliner}/{logo}/{website}/{twitter}/{medium}/{discord}/{whitepaper}":
        {
          get: {
            description: "Post a project to NEAR Catalog.",
            tags: ["NEAR Catalog"],
            operationId: "getNearCatalogTransaction",
            parameters: [
              {
                in: "path",
                name: "title",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Title of the NEAR catalog project.",
              },
              {
                in: "path",
                name: "description",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Description of the NEAR catalog project.",
              },
              {
                in: "path",
                name: "categories",
                required: true,
                schema: {
                  type: "string",
                },
                description:
                  "Categories associated with the NEAR catalog project.",
              },
              {
                in: "path",
                name: "oneliner",
                required: true,
                schema: {
                  type: "string",
                },
                description: "A brief one-liner about the project.",
              },
              {
                in: "path",
                name: "logo",
                required: true,
                schema: {
                  type: "string",
                },
                description: "URL of the project logo.",
              },
              {
                in: "path",
                name: "website",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the official website of the project.",
              },
              {
                in: "path",
                name: "twitter",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the project's Twitter account.",
              },
              {
                in: "path",
                name: "medium",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the Medium article about the project.",
              },
              {
                in: "path",
                name: "discord",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the Discord server for the project.",
              },
              {
                in: "path",
                name: "whitepaper",
                required: true,
                schema: {
                  type: "string",
                },
                description: "Link to the whitepaper of the project.",
              },
            ],
            responses: {
              "200": {
                description:
                  "Use this transaction data to call generate-transaction tool to generate a transaction.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        signerId: {
                          type: "string",
                          description:
                            "The account ID that should sign this transaction.",
                        },
                        publicKey: {
                          type: "string",
                          description:
                            "The public key associated with the signer account.",
                        },
                        nonce: {
                          type: "string",
                          description:
                            "A unique number to ensure the uniqueness of the transaction.",
                        },
                        receiverId: {
                          type: "string",
                          description:
                            "The account ID of the DAO contract that will receive this transaction.",
                        },
                        actions: {
                          type: "array",
                          description:
                            "The list of actions to be performed in this transaction.",
                          items: {
                            type: "object",
                            properties: {
                              functionCall: {
                                type: "object",
                                properties: {
                                  methodName: {
                                    type: "string",
                                    description:
                                      "The name of the contract method to be called.",
                                  },
                                  args: {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        description:
                                          "The type of the arguments data.",
                                      },
                                      data: {
                                        type: "array",
                                        items: {
                                          type: "integer",
                                        },
                                        description:
                                          "The encoded arguments for the function call.",
                                      },
                                    },
                                  },
                                  gas: {
                                    type: "string",
                                    description:
                                      "The amount of gas attached to this function call.",
                                  },
                                  deposit: {
                                    type: "string",
                                    description:
                                      "The amount of NEAR tokens attached to this function call.",
                                  },
                                },
                              },
                              enum: {
                                type: "string",
                                description:
                                  "The type of action being performed.",
                              },
                            },
                          },
                        },
                        blockHash: {
                          type: "object",
                          additionalProperties: {
                            type: "integer",
                          },
                          description:
                            "The hash of the block used as a reference for this transaction.",
                        },
                      },
                      required: [
                        "signerId",
                        "publicKey",
                        "nonce",
                        "receiverId",
                        "actions",
                        "blockHash",
                      ],
                    },
                  },
                },
              },
            },
          },
        },
    },
  };
  return NextResponse.json(pluginData);
}
