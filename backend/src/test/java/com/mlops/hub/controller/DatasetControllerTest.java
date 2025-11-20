package com.mlops.hub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlops.hub.entity.Dataset;
import com.mlops.hub.entity.DatasetVersion;
import com.mlops.hub.entity.DatasetFile;
import com.mlops.hub.repository.DatasetRepository;
import com.mlops.hub.service.DatasetService;
import com.mlops.hub.service.DatasetVersionService;
import com.mlops.hub.config.TestSecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    // ========== Contract/Integration Tests for Dataset API ==========

    @Test
    void testGetDatasetByIdWithVersions() throws Exception {
        // Given: Dataset with versions
        Dataset dataset = new Dataset();
        dataset.setId(1L);
        dataset.setName("Test Dataset");
        dataset.setDescription("Test Description");
        
        DatasetVersion version1 = new DatasetVersion();
        version1.setVersionId("v1.0");
        version1.setDatasetId(1L);
        version1.setVersionNumber(1);
        version1.setStatus(DatasetVersion.VersionStatus.COMMITTED);
        version1.setCreatedAt(LocalDateTime.now());
        
        DatasetVersion version2 = new DatasetVersion();
        version2.setVersionId("v2.0");
        version2.setDatasetId(1L);
        version2.setVersionNumber(2);
        version2.setStatus(DatasetVersion.VersionStatus.COMMITTED);
        version2.setCreatedAt(LocalDateTime.now());
        
        List<DatasetVersion> versions = new ArrayList<>();
        versions.add(version1);
        versions.add(version2);
        dataset.setVersions(versions);
        
        when(datasetService.getDatasetById(1L)).thenReturn(Optional.of(dataset));

        // When & Then: Verify dataset includes versions
        mockMvc.perform(get("/api/datasets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Dataset"))
                .andExpect(jsonPath("$.versions").exists())
                .andExpect(jsonPath("$.versions").isArray())
                .andExpect(jsonPath("$.versions.length()").value(2))
                .andExpect(jsonPath("$.versions[0].versionId").value("v1.0"))
                .andExpect(jsonPath("$.versions[1].versionId").value("v2.0"));
    }

    @Test
    void testGetFilesByVersion() throws Exception {
        // Given: Dataset version with files
        Long datasetId = 1L;
        String versionId = "v1.0";
        
        DatasetFile file1 = new DatasetFile();
        file1.setFileId("file-1");
        file1.setFileName("data.csv");
        file1.setFileSize(1024L);
        file1.setFileFormat("CSV");
        file1.setVersionId(1L);
        
        DatasetFile file2 = new DatasetFile();
        file2.setFileId("file-2");
        file2.setFileName("metadata.json");
        file2.setFileSize(512L);
        file2.setFileFormat("JSON");
        file2.setVersionId(1L);
        
        List<DatasetFile> files = List.of(file1, file2);
        when(datasetVersionService.getFilesByVersion(datasetId, versionId)).thenReturn(files);

        // When & Then: Verify file list structure matches CLI expectations
        mockMvc.perform(get("/api/datasets/{datasetId}/versions/{versionId}/files", datasetId, versionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].fileId").value("file-1"))
                .andExpect(jsonPath("$[0].fileName").value("data.csv"))
                .andExpect(jsonPath("$[0].fileSize").value(1024))
                .andExpect(jsonPath("$[0].fileFormat").value("CSV"))
                .andExpect(jsonPath("$[1].fileId").value("file-2"))
                .andExpect(jsonPath("$[1].fileName").value("metadata.json"))
                .andExpect(jsonPath("$[1].fileSize").value(512))
                .andExpect(jsonPath("$[1].fileFormat").value("JSON"));
    }

    @Test
    void testDownloadFileWithCorrectHeaders() throws Exception {
        // Given: File to download
        Long datasetId = 1L;
        String versionId = "v1.0";
        String fileId = "file-1";
        byte[] fileContent = "test file content".getBytes();
        
        DatasetFile file = new DatasetFile();
        file.setFileId(fileId);
        file.setFileName("test-data.csv");
        file.setFileSize((long) fileContent.length);
        file.setVersionId(1L);
        
        List<DatasetFile> files = List.of(file);
        when(datasetVersionService.getFilesByVersion(datasetId, versionId)).thenReturn(files);
        when(datasetVersionService.downloadFile(datasetId, versionId, fileId)).thenReturn(fileContent);

        // When & Then: Verify download endpoint returns correct headers and content
        mockMvc.perform(get("/api/datasets/{datasetId}/versions/{versionId}/files/{fileId}/download",
                        datasetId, versionId, fileId))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .andExpect(header().string("Content-Disposition", containsString("attachment")))
                .andExpect(header().string("Content-Disposition", containsString("test-data.csv")))
                .andExpect(content().bytes(fileContent));
    }

    @Test
    void testGetFilesByVersionNotFound() throws Exception {
        // Given: Non-existent version
        Long datasetId = 1L;
        String versionId = "non-existent";
        
        when(datasetVersionService.getFilesByVersion(datasetId, versionId))
                .thenThrow(new RuntimeException("Version not found"));

        // When & Then: Should return bad request (as per controller implementation)
        mockMvc.perform(get("/api/datasets/{datasetId}/versions/{versionId}/files", datasetId, versionId))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDownloadFileNotFound() throws Exception {
        // Given: Non-existent file
        Long datasetId = 1L;
        String versionId = "v1.0";
        String fileId = "non-existent-file";
        
        // Return empty file list (file not found)
        when(datasetVersionService.getFilesByVersion(datasetId, versionId)).thenReturn(List.of());
        when(datasetVersionService.downloadFile(datasetId, versionId, fileId))
                .thenReturn(new byte[0]);

        // When & Then: Should return 404
        mockMvc.perform(get("/api/datasets/{datasetId}/versions/{versionId}/files/{fileId}/download",
                        datasetId, versionId, fileId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetVersionNotFound() throws Exception {
        // Given: Non-existent version
        Long datasetId = 1L;
        String versionId = "non-existent";
        
        when(datasetVersionService.getVersionById(datasetId, versionId)).thenReturn(Optional.empty());

        // When & Then: Should return 404
        mockMvc.perform(get("/api/datasets/{datasetId}/versions/{versionId}", datasetId, versionId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetVersionsByDataset() throws Exception {
        // Given: Dataset with multiple versions
        Long datasetId = 1L;
        
        DatasetVersion version1 = new DatasetVersion();
        version1.setVersionId("v1.0");
        version1.setDatasetId(datasetId);
        version1.setVersionNumber(1);
        version1.setStatus(DatasetVersion.VersionStatus.COMMITTED);
        version1.setCreatedAt(LocalDateTime.now());
        
        DatasetVersion version2 = new DatasetVersion();
        version2.setVersionId("v2.0");
        version2.setDatasetId(datasetId);
        version2.setVersionNumber(2);
        version2.setStatus(DatasetVersion.VersionStatus.COMMITTED);
        version2.setCreatedAt(LocalDateTime.now());
        
        List<DatasetVersion> versions = List.of(version1, version2);
        when(datasetVersionService.getVersionsByDatasetId(datasetId)).thenReturn(versions);

        // When & Then: Verify versions endpoint structure
        mockMvc.perform(get("/api/datasets/{datasetId}/versions", datasetId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].versionId").value("v1.0"))
                .andExpect(jsonPath("$[0].datasetId").value(1))
                .andExpect(jsonPath("$[0].versionNumber").value(1))
                .andExpect(jsonPath("$[1].versionId").value("v2.0"))
                .andExpect(jsonPath("$[1].datasetId").value(1))
                .andExpect(jsonPath("$[1].versionNumber").value(2));
    }

    @Test
    void testGetDatasetByIdWithEmptyVersions() throws Exception {
        // Given: Dataset without versions
        Dataset dataset = new Dataset();
        dataset.setId(1L);
        dataset.setName("Test Dataset");
        dataset.setDescription("Test Description");
        dataset.setVersions(new ArrayList<>());
        
        when(datasetService.getDatasetById(1L)).thenReturn(Optional.of(dataset));

        // When & Then: Verify dataset with empty versions array
        mockMvc.perform(get("/api/datasets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.versions").exists())
                .andExpect(jsonPath("$.versions").isArray())
                .andExpect(jsonPath("$.versions.length()").value(0));
    }

    @Test
    void testGetFilesByVersionEmptyList() throws Exception {
        // Given: Version with no files
        Long datasetId = 1L;
        String versionId = "v1.0";
        
        when(datasetVersionService.getFilesByVersion(datasetId, versionId)).thenReturn(List.of());

        // When & Then: Should return empty array
        mockMvc.perform(get("/api/datasets/{datasetId}/versions/{versionId}/files", datasetId, versionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
