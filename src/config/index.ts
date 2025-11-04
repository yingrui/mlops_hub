// Configuration for the MLOps Hub frontend
export const config = {
  keycloak: {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8081',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'mlops-hub',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'mlops-frontend',
  },
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  },
};
