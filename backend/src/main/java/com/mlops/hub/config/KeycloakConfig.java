package com.mlops.hub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

    @Value("${keycloak.auth-server-url}")
    private String authServerUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    public String getAuthServerUrl() {
        return authServerUrl;
    }

    public String getRealm() {
        return realm;
    }

    public String getClientId() {
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public String getRealmUrl() {
        return authServerUrl + "/realms/" + realm;
    }

    public String getTokenUrl() {
        return getRealmUrl() + "/protocol/openid-connect/token";
    }

    public String getUserInfoUrl() {
        return getRealmUrl() + "/protocol/openid-connect/userinfo";
    }

    public String getLogoutUrl() {
        return getRealmUrl() + "/protocol/openid-connect/logout";
    }
}
