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

@WebMvcTest(ExperimentController.class)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
public class ExperimentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MLflowFacadeService mlflowFacadeService;

    private Map<String, Object> sampleExperimentsResponse;
    private Map<String, Object> sampleExperimentResponse;

    @BeforeEach
    void setUp() {
        sampleExperimentsResponse = new HashMap<>();
        sampleExperimentsResponse.put("experiments", List.of(
                Map.of("experiment_id", "1", "name", "test-experiment", "lifecycle_stage", "active"),
                Map.of("experiment_id", "2", "name", "another-experiment", "lifecycle_stage", "active")
        ));

        sampleExperimentResponse = new HashMap<>();
        sampleExperimentResponse.put("experiment_id", "1");
        sampleExperimentResponse.put("name", "test-experiment");
        sampleExperimentResponse.put("lifecycle_stage", "active");
    }

    @Test
    void testListExperiments_Success() throws Exception {
        when(mlflowFacadeService.listExperiments()).thenReturn(Mono.just(sampleExperimentsResponse));

        mockMvc.perform(get("/api/experiments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testListExperiments_Error() throws Exception {
        when(mlflowFacadeService.listExperiments()).thenReturn(Mono.error(new RuntimeException("MLflow server error")));

        mockMvc.perform(get("/api/experiments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetExperiment_Success() throws Exception {
        when(mlflowFacadeService.getExperiment("1")).thenReturn(Mono.just(sampleExperimentResponse));

        mockMvc.perform(get("/api/experiments/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testGetExperimentByName_Success() throws Exception {
        when(mlflowFacadeService.getExperimentByName("test-experiment")).thenReturn(Mono.just(sampleExperimentResponse));

        mockMvc.perform(get("/api/experiments/by-name/test-experiment")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateExperiment_Success() throws Exception {
        when(mlflowFacadeService.createExperiment("new-experiment")).thenReturn(Mono.just("123"));

        mockMvc.perform(post("/api/experiments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"new-experiment\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateExperiment_Success() throws Exception {
        when(mlflowFacadeService.updateExperiment("1", "updated-name")).thenReturn(Mono.just(sampleExperimentResponse));

        mockMvc.perform(put("/api/experiments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"new_name\": \"updated-name\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteExperiment_Success() throws Exception {
        when(mlflowFacadeService.deleteExperiment("1")).thenReturn(Mono.just(sampleExperimentResponse));

        mockMvc.perform(delete("/api/experiments/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testRestoreExperiment_Success() throws Exception {
        when(mlflowFacadeService.restoreExperiment("1")).thenReturn(Mono.just(sampleExperimentResponse));

        mockMvc.perform(post("/api/experiments/1/restore")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testSearchExperiments_Success() throws Exception {
        when(mlflowFacadeService.searchExperiments(anyString())).thenReturn(Mono.just(sampleExperimentsResponse));

        mockMvc.perform(get("/api/experiments/search")
                        .param("filter", "name LIKE 'test'")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testCorsHeaders() throws Exception {
        when(mlflowFacadeService.listExperiments()).thenReturn(Mono.just(sampleExperimentsResponse));

        mockMvc.perform(get("/api/experiments")
                        .header("Origin", "http://localhost:3000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }
}
