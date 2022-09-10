import { baseUrls } from "../models/types";

const stagingEnvironments: Record<string, string> = {
    staging: baseUrls.staging,
    goerli: baseUrls.goerli,
};

export const getEnvironmentBaseUrl = (environment = ""): string => {
    const productionValues = ["prod", "production"];
    // Staging Whitelist Check
    if (stagingEnvironments[environment]) return stagingEnvironments[environment];

    if (productionValues.includes(environment) || !environment) return baseUrls.prod;
    return environment;
};
