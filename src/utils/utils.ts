const { JsonRpcProvider } = require("@near-js/providers");
import { transactions, utils } from "near-api-js";
import BN from "bn.js";

export async function getBlockDetails(): Promise<{
  blockHash: string;
  blockHeight: number;
}> {
  const provider = new JsonRpcProvider({ url: "https://rpc.near.org" });
  const { sync_info } = await provider.status();
  return {
    blockHash: sync_info.latest_block_hash,
    blockHeight: sync_info.latest_block_height,
  };
}

export async function fetchNonce(
  accountId: string,
  publicKey: utils.key_pair.PublicKey,
): Promise<number> {
  const provider = new JsonRpcProvider({ url: "https://rpc.near.org" });
  const rawAccessKey = await provider.query({
    request_type: "view_access_key",
    account_id: accountId,
    public_key: publicKey.toString(),
    finality: "optimistic",
  });
  return rawAccessKey.nonce;
}

export async function fetchNearView(
  accountId: string,
  methodName: string,
  argsBase64: string,
): Promise<any> {
  const provider = new JsonRpcProvider({
    url: "https://free.rpc.fastnear.com/",
  });
  const rawAccessKey = await provider.query({
    request_type: "call_function",
    account_id: accountId,
    args_base64: argsBase64,
    method_name: methodName,
    finality: "optimistic",
  });
  const resultBytes = rawAccessKey.result;
  const resultString = String.fromCharCode(...resultBytes);
  return JSON.parse(resultString);
}

interface BaseProposalParams {
  title: string;
  description: string;
  summary: string;
  requestedSponsorshipAmount: string;
  requestedSponsorshipToken: string;
  receiverAccount: string;
  supervisor: string | null;
  category: string;
}

interface InfrastructureParams extends BaseProposalParams {
  linkedRfp?: string; // Optional linked RFP object
}

export async function createProposalTransaction(
  params: BaseProposalParams | InfrastructureParams,
  headers: any,
  requestedSponsor: string,
  contract: string,
): Promise<transactions.Transaction> {
  const config = JSON.parse(process.env.BITTE_KEY || "{}");
  const accountId = config.accountId;
  const publicKey = config?.publicKey || "";

  // const mbMetadata = JSON.parse(headers["mb-metadata"] || "{}");
  // const accountId = mbMetadata?.accountData?.accountId || "near";
  // const publicKey = mbMetadata?.accountData?.devicePublicKey || "";

  const {
    title,
    description,
    summary,
    requestedSponsorshipAmount,
    requestedSponsorshipToken,
    receiverAccount,
    supervisor,
    category,
  } = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      decodeURIComponent(value),
    ]),
  );

  // Common body structure
  const commonBody = {
    proposal_body_version: "V0",
    name: title,
    description: description,
    summary: summary,
    linked_proposals: [],
    requested_sponsorship_usd_amount: requestedSponsorshipAmount,
    requested_sponsorship_paid_in_currency: requestedSponsorshipToken,
    receiver_account: receiverAccount,
    supervisor: supervisor || null,
    timeline: { status: "DRAFT" },
    category,
    requested_sponsor: requestedSponsor,
  };

  let body;
  let args;

  if ("linkedRfp" in params) {
    // Infrastructure case
    body = {
      ...commonBody,
      proposal_body_version: "V1", // Update version for Infrastructure
      linked_rfp: params.linkedRfp,
    };
    args = {
      labels: [category], // Move category to labels
      body: body,
    };
  } else {
    // Devhub case
    body = {
      ...commonBody,
    };
    args = {
      labels: [], // Set to an empty array for Devhub case
      body: body,
    };
  }

  const nonce = await fetchNonce(accountId, publicKey);
  const blockDetails = await getBlockDetails();

  const actions: transactions.Action[] = [];
  actions.push(
    transactions.functionCall(
      "add_proposal",
      args,
      new BN("200000000000000"), // Gas limit
      new BN("0"), // Attached deposit
    ),
  );

  const transaction = transactions.createTransaction(
    accountId,
    publicKey,
    contract,
    nonce,
    actions,
    utils.serialize.base_decode(blockDetails.blockHash),
  );

  return transaction;
}

export async function createProject(
  args: any,
  headers: any,
): Promise<transactions.Transaction> {
  const config = JSON.parse(process.env.BITTE_CONFIG || "{}");
  const accountId = config.accountId;
  const publicKey = config?.publicKey || "";
  // const mbMetadata = JSON.parse(headers["mb-metadata"] || "{}");
  // const accountId = mbMetadata?.accountData?.accountId || "near";
  // const publicKey = mbMetadata?.accountData?.devicePublicKey || "";
  const nonce = await fetchNonce(accountId, publicKey);
  const blockDetails = await getBlockDetails();

  const actions: transactions.Action[] = [];
  actions.push(
    transactions.functionCall(
      "set",
      args,
      new BN("200000000000000"), // Gas limit
      new BN("100000000000000000000000"), // Attached deposit
    ),
  );

  const transaction = transactions.createTransaction(
    accountId,
    publicKey,
    "social.near",
    nonce,
    actions,
    utils.serialize.base_decode(blockDetails.blockHash),
  );

  return transaction;
}
