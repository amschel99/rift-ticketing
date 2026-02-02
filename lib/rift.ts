import Rift, { Environment } from "@rift-finance/wallet";

const rift = new Rift({
  apiKey: process.env.RIFT_API_KEY || "",
  environment: (process.env.RIFT_ENVIRONMENT as Environment) || Environment.PRODUCTION,
});

export default rift;
