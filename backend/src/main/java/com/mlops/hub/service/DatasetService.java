package com.mlops.hub.service;

import com.mlops.hub.entity.Dataset;
import com.mlops.hub.repository.DatasetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DatasetService {

    @Autowired
    private DatasetRepository datasetRepository;

    public List<Dataset> getAllDatasets() {
        return datasetRepository.findAll();
    }

    public Page<Dataset> getAllDatasets(Pageable pageable) {
        return datasetRepository.findAll(pageable);
    }

    public Optional<Dataset> getDatasetById(Long id) {
        return datasetRepository.findById(id);
    }

    public Dataset createDataset(Dataset dataset) {
        if (dataset.getDatasetUuid() == null) {
            dataset.setDatasetUuid(UUID.randomUUID().toString());
        }
        return datasetRepository.save(dataset);
    }

    public Dataset updateDataset(Long id, Dataset datasetDetails) {
        Optional<Dataset> optionalDataset = datasetRepository.findById(id);
        if (optionalDataset.isPresent()) {
            Dataset dataset = optionalDataset.get();
            dataset.setName(datasetDetails.getName());
            dataset.setDescription(datasetDetails.getDescription());
            dataset.setUpdatedAt(LocalDateTime.now());
            return datasetRepository.save(dataset);
        }
        return null;
    }

    public boolean deleteDataset(Long id) {
        Optional<Dataset> optionalDataset = datasetRepository.findById(id);
        if (optionalDataset.isPresent()) {
            datasetRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Dataset> searchDatasets(String name) {
        return datasetRepository.findByNameContainingIgnoreCase(name);
    }
}
