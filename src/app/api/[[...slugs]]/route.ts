import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import axios from "axios";
import { createProject, createProposalTransaction } from "@/utils/utils";

const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  .get(
    "/create/proposal/:proposalDetails/:requestedSponsorshipAmount/:requestedSponsorshipToken/:receiverAccount/:supervisor",
    async ({ params }) => {
      const {
        proposalDetails,
        requestedSponsorshipAmount,
        requestedSponsorshipToken,
        receiverAccount,
        supervisor,
      } = params;

      const requestData = {
        inputs: {
          Supervisor: supervisor,
          "Requested Sponsorship Amount": requestedSponsorshipAmount,
          Receiver: receiverAccount,
          "Requested Sponsorship Token": requestedSponsorshipToken,
          "Proposal Details": proposalDetails,
        },
        version: "^2.0",
      };
      try {
        const response = await axios.post(
          "https://app.wordware.ai/api/released-app/9be6bbf8-6964-4430-97b8-a71b1a3aab76/run",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${process.env.WORDWARE_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );
        const rawData = response.data;

        // Split the response into lines and filter out empty lines
        const lines = rawData.split("\n").filter((line: any) => line.trim());
        let completeObject = null;

        // Parse each line
        for (const line of lines) {
          try {
            const parsedChunk = JSON.parse(line);
            if (
              parsedChunk.type === "chunk" &&
              parsedChunk.value.state === "complete"
            ) {
              completeObject = parsedChunk.value.output;
              break; // Exit the loop when complete object is found
            }
          } catch (error) {
            console.error("Failed to parse JSON:", error);
          }
        }

        // Check if a complete object was found
        if (completeObject) {
          return {
            Supervisor: completeObject.Supervisor,
            Receiver: completeObject.Receiver,
            "Requested Sponsorship Token":
              completeObject["Requested Sponsorship Token"],
            proposalDetails: completeObject.new_generation,
          };
        } else {
          return { error: "No complete state found", rawData };
        }
      } catch (error) {
        console.error("Error sending request to API:", error);
        return { error: "Failed to create proposal" };
      }
    },
  )
  .get(
    "/get/transaction/devhub/:title/:description/:category/:summary/:requestedSponsorshipAmount/:requestedSponsorshipToken/:receiverAccount/:supervisor",
    async ({ params, headers }) => {
      const transaction = await createProposalTransaction(
        params,
        headers,
        "neardevdao.near",
        "devhub.near",
      );
      return JSON.stringify(transaction);
    },
  )
  .get(
    "/get/transaction/events/:title/:description/:category/:summary/:requestedSponsorshipAmount/:requestedSponsorshipToken/:receiverAccount/:supervisor",
    async ({ params, headers }) => {
      const transaction = await createProposalTransaction(
        params,
        headers,
        "events-committee.near",
        "events-committee.near",
      );
      return transaction;
    },
  )
  .get(
    "/get/transaction/infrastructure/:title/:description/:category/:summary/:requestedSponsorshipAmount/:requestedSponsorshipToken/:receiverAccount/:supervisor",
    async ({ params, headers }) => {
      const transaction = await createProposalTransaction(
        { ...params, linkedRfp: undefined },
        headers,
        "infrastructure-committee.near",
        "infrastructure-committee.near",
      );
      return transaction;
    },
  )
  .get(
    "/create/project/:projectDetails/:discord/:medium/:twitter/:logo/:websiteLink/:whitepaper",
    async ({ params }) => {
      const {
        projectDetails,
        discord,
        medium,
        twitter,
        logo,
        websiteLink,
        whitepaper,
      } = params;

      const requestData = {
        inputs: {
          "project details": projectDetails,
          discord: discord,
          medium: medium,
          twitter: twitter,
          logo: logo,
          website: websiteLink,
          whitepaper,
        },
        version: "^2.0",
      };

      try {
        const response = await axios.post(
          "https://app.wordware.ai/api/released-app/3fa70666-cda8-4f47-8d34-2c5618ec92f7/run",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${process.env.WORDWARE_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );
        const rawData = response.data;

        // Split the response into lines and filter out empty lines
        const lines = rawData.split("\n").filter((line: any) => line.trim());
        let completeObject = null;

        // Parse each line
        for (const line of lines) {
          try {
            const parsedChunk = JSON.parse(line);
            if (
              parsedChunk.type === "chunk" &&
              parsedChunk.value.state === "complete"
            ) {
              completeObject = parsedChunk.value.output;
              break; // Exit the loop when complete object is found
            }
          } catch (error) {
            console.error("Failed to parse JSON:", error);
          }
        }

        // Check if a complete object was found
        if (completeObject) {
          console.log(completeObject);
          return {
            discord: completeObject.discord,
            medium: completeObject.medium,
            twitter: completeObject.twitter,
            logo: completeObject.logo,
            website: completeObject.websiteLink,
            whitepaper: completeObject.whitepaper,
            project: completeObject.new_generation,
          };
        }
      } catch (error) {
        console.error("Error sending request to API:", error);
        return { error: "Failed to create project" };
      }
    },
  )
  .get(
    "/get/transaction/nearcatalog/{title}/{description}/{categories}/{oneliner}/{logo}/{website}/{twitter}/{medium}/{discord}/{whitepaper}",
    async ({ params, headers }) => {
      // const mbMetadata = JSON.parse(headers["mb-metadata"] || "{}");
      // const accountId = mbMetadata?.accountData?.accountId || "near";
      const config = JSON.parse(process.env.BITTE_KEY || "{}");
      const accountId = config.accountId;
      const {
        title,
        description,
        categories,
        oneliner,
        logo,
        website,
        twitter,
        medium,
        discord,
        whitepaper,
      } = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [
          key,
          decodeURIComponent(value as any),
        ]),
      );
      return await createProject(
        {
          [accountId]: {
            nearcatalog: {
              categories,
              title,
              oneliner,
              logo,
              description,
              website,
              dapp: "",
              twitter,
              medium,
              discord,
              whitepaper,
              tokenAddress: "",
              cgcAddress: "",
              uid: accountId,
            },
          },
        },
        headers,
      );
    },
  )
  .compile();

export const GET = app.handle;
export const POST = app.handle;
