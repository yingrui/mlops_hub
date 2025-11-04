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
public class DatasetRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DatasetRepository datasetRepository;

    private Dataset testDataset;

    @BeforeEach
    void setUp() {
        testDataset = new Dataset();
        testDataset.setName("Test Dataset");
        testDataset.setDescription("Test Description");
        // File properties are now managed at version level
        testDataset.setCreatedAt(LocalDateTime.now());
        testDataset.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testSaveDataset() {
        // When
        Dataset saved = datasetRepository.save(testDataset);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Test Dataset");
    }

    @Test
    void testFindById() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        Optional<Dataset> found = datasetRepository.findById(testDataset.getId());

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Dataset");
    }

    @Test
    void testFindAll() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        List<Dataset> all = datasetRepository.findAll();

        // Then
        assertThat(all).hasSize(1);
        assertThat(all.get(0).getName()).isEqualTo("Test Dataset");
    }

    @Test
    void testFindByName() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        Optional<Dataset> found = datasetRepository.findByName("Test Dataset");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Dataset");
    }

    @Test
    void testFindByNameContainingIgnoreCase() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        List<Dataset> found = datasetRepository.findByNameContainingIgnoreCase("test");

        // Then
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getName()).isEqualTo("Test Dataset");
    }

    @Test
    void testDeleteById() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        datasetRepository.deleteById(testDataset.getId());

        // Then
        Optional<Dataset> found = datasetRepository.findById(testDataset.getId());
        assertThat(found).isEmpty();
    }

    @Test
    void testCount() {
        // Given
        entityManager.persistAndFlush(testDataset);

        // When
        long count = datasetRepository.count();

        // Then
        assertThat(count).isEqualTo(1L);
    }
}
