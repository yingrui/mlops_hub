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

@WebMvcTest(DataController.class)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
public class DataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MLflowFacadeService mlflowFacadeService;

    private Map<String, Object> sampleExperimentsResponse;
    private Map<String, Object> sampleRegisteredModelsResponse;

    @BeforeEach
    void setUp() {
        sampleExperimentsResponse = new HashMap<>();
        sampleExperimentsResponse.put("experiments", List.of(
                Map.of(
                        "experiment_id", "1",
                        "name", "test-experiment",
                        "lifecycle_stage", "active",
                        "run_count", 5
                ),
                Map.of(
                        "experiment_id", "2",
                        "name", "another-experiment",
                        "lifecycle_stage", "active",
                        "run_count", 3
                )
        ));

        sampleRegisteredModelsResponse = new HashMap<>();
        sampleRegisteredModelsResponse.put("registered_models", List.of(
                Map.of(
                        "name", "test-model",
                        "creation_timestamp", 1234567890L,
                        "version_count", 2
                ),
                Map.of(
                        "name", "another-model",
                        "creation_timestamp", 1234567890L,
                        "version_count", 1
                )
        ));
    }

    @Test
    void testGetDashboardOverview_Success() throws Exception {
        when(mlflowFacadeService.getCachedExperiments()).thenReturn(Mono.just(sampleExperimentsResponse));
        when(mlflowFacadeService.getCachedRegisteredModels()).thenReturn(Mono.just(sampleRegisteredModelsResponse));

        mockMvc.perform(get("/api/data/dashboard/overview")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetDashboardOverview_Error() throws Exception {
        when(mlflowFacadeService.getCachedExperiments()).thenReturn(Mono.error(new RuntimeException("MLflow error")));
        when(mlflowFacadeService.getCachedRegisteredModels()).thenReturn(Mono.just(sampleRegisteredModelsResponse));

        mockMvc.perform(get("/api/data/dashboard/overview")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetExperimentsWithSummary_Success() throws Exception {
        when(mlflowFacadeService.getCachedExperiments()).thenReturn(Mono.just(sampleExperimentsResponse));

        mockMvc.perform(get("/api/data/experiments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetModels_Success() throws Exception {
        when(mlflowFacadeService.getCachedRegisteredModels()).thenReturn(Mono.just(sampleRegisteredModelsResponse));

        mockMvc.perform(get("/api/data/models")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetRunsWithMetrics_Success() throws Exception {
        Map<String, Object> runsResponse = new HashMap<>();
        runsResponse.put("runs", List.of(
                Map.of("run_id", "run1", "experiment_id", "1", "status", "FINISHED"),
                Map.of("run_id", "run2", "experiment_id", "1", "status", "RUNNING")
        ));

        when(mlflowFacadeService.getRunsWithMetrics(anyString())).thenReturn(Mono.just(runsResponse));

        mockMvc.perform(get("/api/data/experiments/1/runs")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetModelVersionsWithDetails_Success() throws Exception {
        Map<String, Object> modelVersionsResponse = new HashMap<>();
        modelVersionsResponse.put("model_versions", List.of(
                Map.of("name", "test-model", "version", "1", "stage", "Production"),
                Map.of("name", "test-model", "version", "2", "stage", "Staging")
        ));

        when(mlflowFacadeService.getModelVersionsWithDetails(anyString())).thenReturn(Mono.just(modelVersionsResponse));

        mockMvc.perform(get("/api/data/models/test-model/versions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetExperimentsWithSummary_Error() throws Exception {
        when(mlflowFacadeService.getCachedExperiments()).thenReturn(Mono.error(new RuntimeException("MLflow error")));

        mockMvc.perform(get("/api/data/experiments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetModels_Error() throws Exception {
        when(mlflowFacadeService.getCachedRegisteredModels()).thenReturn(Mono.error(new RuntimeException("MLflow error")));

        mockMvc.perform(get("/api/data/models")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testCorsHeaders() throws Exception {
        when(mlflowFacadeService.getCachedExperiments()).thenReturn(Mono.just(sampleExperimentsResponse));
        when(mlflowFacadeService.getCachedRegisteredModels()).thenReturn(Mono.just(sampleRegisteredModelsResponse));

        mockMvc.perform(get("/api/data/dashboard/overview")
                        .header("Origin", "http://localhost:3000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }
}
