package com.mlops.hub.service;

import com.mlops.hub.entity.Dataset;
import com.mlops.hub.repository.DatasetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class DatasetServiceTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DatasetRepository datasetRepository;

    private DatasetService datasetService;
    private Dataset testDataset;

    @BeforeEach
    void setUp() {
        // Create a simple DatasetService for testing
        datasetService = new DatasetService();
        
        // Set the repository manually
        try {
            java.lang.reflect.Field repositoryField = DatasetService.class.getDeclaredField("datasetRepository");
            repositoryField.setAccessible(true);
            repositoryField.set(datasetService, datasetRepository);
        } catch (Exception e) {
            // Fallback: create a new instance with repository
            datasetService = new DatasetService();
            try {
                java.lang.reflect.Field repositoryField = DatasetService.class.getDeclaredField("datasetRepository");
                repositoryField.setAccessible(true);
                repositoryField.set(datasetService, datasetRepository);
            } catch (Exception ex) {
                throw new RuntimeException("Could not inject repository", ex);
            }
        }

        testDataset = new Dataset();
        testDataset.setName("Test Dataset");
        testDataset.setDescription("Test Description");
        // File properties are now managed at version level
        testDataset.setCreatedAt(LocalDateTime.now());
        testDataset.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testGetAllDatasets() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        List<Dataset> result = datasetService.getAllDatasets();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Dataset");
    }

    @Test
    void testGetDatasetById() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        Optional<Dataset> result = datasetService.getDatasetById(testDataset.getId());

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Test Dataset");
    }

    @Test
    void testGetDatasetByIdNotFound() {
        // When
        Optional<Dataset> result = datasetService.getDatasetById(999L);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void testCreateDataset() {
        // When
        Dataset result = datasetService.createDataset(testDataset);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Dataset");
        assertThat(result.getId()).isNotNull();
    }

    @Test
    void testUpdateDataset() {
        // Given
        entityManager.persistAndFlush(testDataset);
        
        Dataset updateData = new Dataset();
        updateData.setName("Updated Name");
        updateData.setDescription("Updated Description");

        // When
        Dataset result = datasetService.updateDataset(testDataset.getId(), updateData);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Name");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
    }

    @Test
    void testUpdateDatasetNotFound() {
        // Given
        Dataset updateData = new Dataset();
        updateData.setName("Updated Name");

        // When
        Dataset result = datasetService.updateDataset(999L, updateData);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void testDeleteDataset() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        boolean result = datasetService.deleteDataset(testDataset.getId());

        // Then
        assertThat(result).isTrue();
        assertThat(datasetRepository.findById(testDataset.getId())).isEmpty();
    }

    @Test
    void testDeleteDatasetNotFound() {
        // When
        boolean result = datasetService.deleteDataset(999L);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void testSearchDatasets() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        List<Dataset> result = datasetService.searchDatasets("test");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Dataset");
    }
}