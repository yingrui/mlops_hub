package com.mlops.hub.controller;

import com.mlops.hub.config.TestSecurityConfig;
import com.mlops.hub.service.MLflowFacadeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ModelController.class)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
public class ModelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MLflowFacadeService mlflowFacadeService;

    private Map<String, Object> sampleRegisteredModelsResponse;
    private Map<String, Object> sampleRegisteredModelResponse;
    private Map<String, Object> sampleModelVersionsResponse;

    @BeforeEach
    void setUp() {
        sampleRegisteredModelsResponse = new HashMap<>();
        sampleRegisteredModelsResponse.put("registered_models", List.of(
                Map.of("name", "test-model", "creation_timestamp", 1234567890L),
                Map.of("name", "another-model", "creation_timestamp", 1234567890L)
        ));

        sampleRegisteredModelResponse = new HashMap<>();
        sampleRegisteredModelResponse.put("name", "test-model");
        sampleRegisteredModelResponse.put("creation_timestamp", 1234567890L);

        sampleModelVersionsResponse = new HashMap<>();
        sampleModelVersionsResponse.put("model_versions", List.of(
                Map.of("name", "test-model", "version", "1", "stage", "Production"),
                Map.of("name", "test-model", "version", "2", "stage", "Staging")
        ));
    }

    @Test
    void testListRegisteredModels_Success() throws Exception {
        when(mlflowFacadeService.listRegisteredModels()).thenReturn(Mono.just(sampleRegisteredModelsResponse));

        mockMvc.perform(get("/api/models")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetRegisteredModel_Success() throws Exception {
        when(mlflowFacadeService.getRegisteredModel("test-model")).thenReturn(Mono.just(sampleRegisteredModelResponse));

        mockMvc.perform(get("/api/models/test-model")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateRegisteredModel_Success() throws Exception {
        when(mlflowFacadeService.createRegisteredModel("new-model")).thenReturn(Mono.just(sampleRegisteredModelResponse));

        mockMvc.perform(post("/api/models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"new-model\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateRegisteredModel_Success() throws Exception {
        when(mlflowFacadeService.updateRegisteredModel("test-model", "Updated description")).thenReturn(Mono.just(sampleRegisteredModelResponse));

        mockMvc.perform(put("/api/models/test-model")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\": \"Updated description\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteRegisteredModel_Success() throws Exception {
        when(mlflowFacadeService.deleteRegisteredModel("test-model")).thenReturn(Mono.just(sampleRegisteredModelResponse));

        mockMvc.perform(delete("/api/models/test-model")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testSearchRegisteredModels_Success() throws Exception {
        when(mlflowFacadeService.searchRegisteredModels(anyString())).thenReturn(Mono.just(sampleRegisteredModelsResponse));

        mockMvc.perform(get("/api/models/search")
                        .param("filter", "name LIKE 'test'")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testListModelVersions_Success() throws Exception {
        when(mlflowFacadeService.listModelVersions("test-model")).thenReturn(Mono.just(sampleModelVersionsResponse));

        mockMvc.perform(get("/api/models/test-model/versions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetModelVersion_Success() throws Exception {
        Map<String, Object> modelVersion = Map.of("name", "test-model", "version", "1", "stage", "Production");
        when(mlflowFacadeService.getModelVersion("test-model", "1")).thenReturn(Mono.just(modelVersion));

        mockMvc.perform(get("/api/models/test-model/versions/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateModelVersion_Success() throws Exception {
        when(mlflowFacadeService.createModelVersion("test-model", "s3://bucket/model", "run123")).thenReturn(Mono.just(sampleModelVersionsResponse));

        mockMvc.perform(post("/api/models/test-model/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"source\": \"s3://bucket/model\", \"run_id\": \"run123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateModelVersion_Success() throws Exception {
        when(mlflowFacadeService.updateModelVersion("test-model", "1", "Updated description", "Production")).thenReturn(Mono.just(sampleModelVersionsResponse));

        mockMvc.perform(put("/api/models/test-model/versions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\": \"Updated description\", \"stage\": \"Production\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testTransitionModelVersionStage_Success() throws Exception {
        when(mlflowFacadeService.transitionModelVersionStage("test-model", "1", "Production", "true")).thenReturn(Mono.just(sampleModelVersionsResponse));

        mockMvc.perform(post("/api/models/test-model/versions/1/transition-stage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stage\": \"Production\", \"archive_existing_versions\": \"true\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteModelVersion_Success() throws Exception {
        when(mlflowFacadeService.deleteModelVersion("test-model", "1")).thenReturn(Mono.just(sampleModelVersionsResponse));

        mockMvc.perform(delete("/api/models/test-model/versions/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetLatestModelVersions_Success() throws Exception {
        when(mlflowFacadeService.getLatestModelVersions("test-model", "Production")).thenReturn(Mono.just(sampleModelVersionsResponse));

        mockMvc.perform(get("/api/models/test-model/versions/latest")
                        .param("stages", "Production")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testSearchModelVersions_Success() throws Exception {
        when(mlflowFacadeService.searchModelVersions("name = 'test-model'")).thenReturn(Mono.just(sampleModelVersionsResponse));

        mockMvc.perform(get("/api/models/test-model/versions/search")
                        .param("filter", "name = 'test-model'")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testCorsHeaders() throws Exception {
        when(mlflowFacadeService.listRegisteredModels()).thenReturn(Mono.just(sampleRegisteredModelsResponse));

        mockMvc.perform(get("/api/models")
                        .header("Origin", "http://localhost:3000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }
}
