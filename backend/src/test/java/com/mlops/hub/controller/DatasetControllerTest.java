package com.mlops.hub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlops.hub.entity.Dataset;
import com.mlops.hub.repository.DatasetRepository;
import com.mlops.hub.service.DatasetService;
import com.mlops.hub.service.DatasetVersionService;
import com.mlops.hub.config.TestSecurityConfig;
import com.mlops.hub.controller.DatasetController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DatasetController.class)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
public class DatasetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DatasetRepository datasetRepository;

    @MockBean
    private DatasetService datasetService;

    @MockBean
    private DatasetVersionService datasetVersionService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testCreateDataset() throws Exception {
        Dataset dataset = new Dataset();
        dataset.setName("Test Dataset");
        dataset.setDescription("Test Description");
        dataset.setId(1L);

        when(datasetService.createDataset(any(Dataset.class))).thenReturn(dataset);

        String json = objectMapper.writeValueAsString(dataset);

        mockMvc.perform(post("/api/datasets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Dataset"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void testGetAllDatasets() throws Exception {
        // Create test datasets
        Dataset dataset1 = new Dataset();
        dataset1.setId(1L);
        dataset1.setName("Dataset 1");
        dataset1.setDescription("Description 1");
        
        Dataset dataset2 = new Dataset();
        dataset2.setId(2L);
        dataset2.setName("Dataset 2");
        dataset2.setDescription("Description 2");
        
        when(datasetService.getAllDatasets()).thenReturn(List.of(dataset1, dataset2));

        mockMvc.perform(get("/api/datasets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Dataset 1"))
                .andExpect(jsonPath("$[1].name").value("Dataset 2"));
    }

    @Test
    void testGetDatasetById() throws Exception {
        Dataset dataset = new Dataset();
        dataset.setId(1L);
        dataset.setName("Test Dataset");
        dataset.setDescription("Test Description");
        
        when(datasetService.getDatasetById(1L)).thenReturn(Optional.of(dataset));

        mockMvc.perform(get("/api/datasets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Dataset"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void testGetDatasetByIdNotFound() throws Exception {
        when(datasetService.getDatasetById(999L)).thenReturn(Optional.empty());
        
        mockMvc.perform(get("/api/datasets/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateDataset() throws Exception {
        Dataset originalDataset = new Dataset();
        originalDataset.setId(1L);
        originalDataset.setName("Original Name");
        originalDataset.setDescription("Original Description");
        
        Dataset updatedDataset = new Dataset();
        updatedDataset.setId(1L);
        updatedDataset.setName("Updated Name");
        updatedDataset.setDescription("Updated Description");

        when(datasetService.getDatasetById(1L)).thenReturn(Optional.of(originalDataset));
        when(datasetService.updateDataset(any(Long.class), any(Dataset.class))).thenReturn(updatedDataset);

        String json = objectMapper.writeValueAsString(updatedDataset);

        mockMvc.perform(put("/api/datasets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.description").value("Updated Description"));
    }

    @Test
    void testDeleteDataset() throws Exception {
        when(datasetService.deleteDataset(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/datasets/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testSearchDatasets() throws Exception {
        Dataset mlDataset = new Dataset();
        mlDataset.setId(1L);
        mlDataset.setName("Machine Learning Dataset");
        mlDataset.setDescription("ML data");
        
        Dataset dlDataset = new Dataset();
        dlDataset.setId(2L);
        dlDataset.setName("Deep Learning Dataset");
        dlDataset.setDescription("DL data");
        
        when(datasetService.searchDatasets("Learning")).thenReturn(List.of(mlDataset, dlDataset));

        mockMvc.perform(get("/api/datasets/search?name=Learning"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value(containsString("Learning")))
                .andExpect(jsonPath("$[1].name").value(containsString("Learning")));
    }

    // Note: Removed tests for non-existent endpoints:
    // - testGetDatasetsByType() - /api/datasets/type/{type} doesn't exist
    // - testGetDatasetCount() - /api/datasets/count doesn't exist  
    // - testGetRecentDatasets() - /api/datasets/recent doesn't exist

    @Test
    void testCorsHeaders() throws Exception {
        mockMvc.perform(get("/api/datasets")
                        .header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }

    private Dataset createTestDataset(String name, String description) {
        Dataset dataset = new Dataset();
        dataset.setName(name);
        dataset.setDescription(description);
        // File properties are now managed at version level
        dataset.setCreatedAt(LocalDateTime.now());
        dataset.setUpdatedAt(LocalDateTime.now());
        return datasetRepository.save(dataset);
    }
}
