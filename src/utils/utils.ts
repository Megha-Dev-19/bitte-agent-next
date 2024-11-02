const { JsonRpcProvider } = require("@near-js/providers");
import BN from "bn.js";

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

interface TransactionResponse {
  methodName: string;
  args: any;
  gas: string;
  deposit: string;
  contractName: string;
}

export async function createProposalTransaction(
  params: BaseProposalParams | InfrastructureParams,
  requestedSponsor: string,
  contract: string,
): Promise<TransactionResponse> {
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

  return {
    methodName: "add_proposal",
    args: args,
    gas: "50000000000000",
    deposit: "0",
    contractName: contract,
  };
}

export async function createProject(args: any): Promise<TransactionResponse> {
  return {
    methodName: "set",
    args: args,
    gas: "50000000000000",
    deposit: "0",
    contractName: "social.near",
  };
}
