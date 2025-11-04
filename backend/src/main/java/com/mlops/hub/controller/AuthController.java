package com.mlops.hub.controller;

import com.mlops.hub.service.KeycloakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private KeycloakService keycloakService;

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        try {
            Map<String, Object> userInfo = keycloakService.getUserInfo(jwt.getTokenValue());
            
            Map<String, Object> response = new HashMap<>();
            response.put("sub", jwt.getSubject());
            response.put("preferred_username", jwt.getClaimAsString("preferred_username"));
            response.put("email", jwt.getClaimAsString("email"));
            response.put("given_name", jwt.getClaimAsString("given_name"));
            response.put("family_name", jwt.getClaimAsString("family_name"));
            response.put("realm_access", jwt.getClaimAsMap("realm_access"));
            response.put("resource_access", jwt.getClaimAsMap("resource_access"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to get user info");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/token-info")
    public ResponseEntity<Map<String, Object>> getTokenInfo(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> tokenInfo = new HashMap<>();
        tokenInfo.put("subject", jwt.getSubject());
        tokenInfo.put("issuedAt", jwt.getIssuedAt());
        tokenInfo.put("expiresAt", jwt.getExpiresAt());
        tokenInfo.put("issuer", jwt.getIssuer());
        tokenInfo.put("audience", jwt.getAudience());
        tokenInfo.put("claims", jwt.getClaims());
        
        return ResponseEntity.ok(tokenInfo);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@AuthenticationPrincipal Jwt jwt) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        response.put("logoutUrl", keycloakService.getLogoutUrl());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/keycloak-info")
    public ResponseEntity<Map<String, String>> getKeycloakInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("realmUrl", keycloakService.getRealmUrl());
        info.put("logoutUrl", keycloakService.getLogoutUrl());
        
        return ResponseEntity.ok(info);
    }
}
