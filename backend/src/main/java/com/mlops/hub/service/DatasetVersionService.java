package com.mlops.hub.service;

import com.mlops.hub.entity.Dataset;
import com.mlops.hub.entity.DatasetFile;
import com.mlops.hub.entity.DatasetVersion;
import com.mlops.hub.repository.DatasetFileRepository;
import com.mlops.hub.repository.DatasetRepository;
import com.mlops.hub.repository.DatasetVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DatasetVersionService {

    @Autowired
    private DatasetVersionRepository datasetVersionRepository;

    @Autowired
    private DatasetFileRepository datasetFileRepository;

    @Autowired
    private DatasetRepository datasetRepository;

    @Autowired
    private ObjectStorageService objectStorageService;

    // Dataset Version Management
    public DatasetVersion createVersion(Long datasetId, String description) {
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        // Get next version number
        Integer nextVersionNumber = datasetVersionRepository
                .findMaxVersionNumberByDatasetId(datasetId)
                .orElse(0) + 1;

        DatasetVersion version = new DatasetVersion();
        version.setVersionId(UUID.randomUUID().toString());
        version.setDatasetId(datasetId);
        version.setVersionNumber(nextVersionNumber);
        version.setDescription(description);
        version.setStatus(DatasetVersion.VersionStatus.DRAFT);

        return datasetVersionRepository.save(version);
    }

    public List<DatasetVersion> getVersionsByDatasetId(Long datasetId) {
        return datasetVersionRepository.findByDatasetIdOrderByVersionNumberDesc(datasetId);
    }

    public Optional<DatasetVersion> getVersionById(Long datasetId, String versionId) {
        return datasetVersionRepository.findByDatasetIdAndVersionId(datasetId, versionId);
    }

    public Optional<DatasetVersion> getVersionByNumber(Long datasetId, Integer versionNumber) {
        return datasetVersionRepository.findByDatasetIdAndVersionNumber(datasetId, versionNumber);
    }

    public DatasetVersion commitVersion(Long datasetId, String versionId) {
        DatasetVersion version = datasetVersionRepository
                .findByDatasetIdAndVersionId(datasetId, versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        if (version.getStatus() != DatasetVersion.VersionStatus.DRAFT) {
            throw new RuntimeException("Only draft versions can be committed");
        }

        version.setStatus(DatasetVersion.VersionStatus.COMMITTED);
        version.setCommittedAt(LocalDateTime.now());

        return datasetVersionRepository.save(version);
    }

    public DatasetVersion archiveVersion(Long datasetId, String versionId) {
        DatasetVersion version = datasetVersionRepository
                .findByDatasetIdAndVersionId(datasetId, versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        version.setStatus(DatasetVersion.VersionStatus.ARCHIVED);
        return datasetVersionRepository.save(version);
    }

    // File Management
    public DatasetFile uploadFile(Long datasetId, String versionId, MultipartFile file) throws Exception {
        DatasetVersion version = datasetVersionRepository
                .findByDatasetIdAndVersionId(datasetId, versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        if (version.getStatus() != DatasetVersion.VersionStatus.DRAFT) {
            throw new RuntimeException("Files can only be uploaded to draft versions");
        }

        // Create version-specific file path
        String filePath = String.format("datasets/%s/versions/%s/%s", 
                datasetId, versionId, file.getOriginalFilename());
        
        objectStorageService.uploadFile(filePath, file);

        DatasetFile datasetFile = new DatasetFile();
        datasetFile.setFileId(UUID.randomUUID().toString());
        datasetFile.setVersionId(version.getId());
        datasetFile.setFileName(file.getOriginalFilename());
        datasetFile.setFilePath(filePath);
        datasetFile.setFileSize(file.getSize());
               datasetFile.setFileFormat(detectFileFormat(file));
        datasetFile.setDigest(calculateFileDigest(file));

        return datasetFileRepository.save(datasetFile);
    }

    public List<DatasetFile> getFilesByVersion(Long datasetId, String versionId) {
        DatasetVersion version = datasetVersionRepository
                .findByDatasetIdAndVersionId(datasetId, versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        return datasetFileRepository.findByVersionIdOrderByCreatedAtAsc(version.getId());
    }

    public byte[] downloadFile(Long datasetId, String versionId, String fileId) throws Exception {
        DatasetVersion version = datasetVersionRepository
                .findByDatasetIdAndVersionId(datasetId, versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        DatasetFile file = datasetFileRepository
                .findByVersionIdAndFileId(version.getId(), fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return objectStorageService.downloadFile(file.getFilePath()).readAllBytes();
    }

    public void deleteFile(Long datasetId, String versionId, String fileId) {
        DatasetVersion version = datasetVersionRepository
                .findByDatasetIdAndVersionId(datasetId, versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        if (version.getStatus() != DatasetVersion.VersionStatus.DRAFT) {
            throw new RuntimeException("Files can only be deleted from draft versions");
        }

        DatasetFile file = datasetFileRepository
                .findByVersionIdAndFileId(version.getId(), fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        try {
            objectStorageService.deleteFile(file.getFilePath());
        } catch (Exception e) {
            // Log error but continue with database deletion
            System.err.println("Failed to delete file from MinIO: " + e.getMessage());
        }

        datasetFileRepository.delete(file);
    }

    public void deleteVersion(Long datasetId, String versionId) {
        DatasetVersion version = datasetVersionRepository
                .findByDatasetIdAndVersionId(datasetId, versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        if (version.getStatus() == DatasetVersion.VersionStatus.COMMITTED) {
            throw new RuntimeException("Committed versions cannot be deleted");
        }

        // Delete all files in this version
        List<DatasetFile> files = datasetFileRepository.findByVersionIdOrderByCreatedAtAsc(version.getId());
        for (DatasetFile file : files) {
            try {
                objectStorageService.deleteFile(file.getFilePath());
            } catch (Exception e) {
                System.err.println("Failed to delete file from MinIO: " + e.getMessage());
            }
        }
        datasetFileRepository.deleteByVersionId(version.getId());

        // Delete the version
        datasetVersionRepository.delete(version);
    }

    // Helper methods
    private String detectFileFormat(MultipartFile file) {
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();

        // Handle JSONL files specifically
        if (fileName != null && fileName.toLowerCase().endsWith(".jsonl")) {
            return "JSONL";
        }

        // Handle other file types
        if (contentType != null) {
            switch (contentType) {
                case "text/csv":
                    return "CSV";
                case "application/json":
                    return "JSON";
                case "application/jsonl":
                case "text/x-jsonl":
                case "application/x-jsonl":
                    return "JSONL";
                case "application/parquet":
                    return "Parquet";
                case "application/x-hdf":
                    return "HDF5";
                case "text/plain":
                    return "TXT";
                default:
                    return "Custom";
            }
        }

        // Fallback based on file extension
        if (fileName != null) {
            String extension = fileName.toLowerCase();
            if (extension.endsWith(".csv")) {
                return "CSV";
            } else if (extension.endsWith(".json")) {
                return "JSON";
            } else if (extension.endsWith(".jsonl")) {
                return "JSONL";
            } else if (extension.endsWith(".parquet")) {
                return "Parquet";
            } else if (extension.endsWith(".hdf5") || extension.endsWith(".h5")) {
                return "HDF5";
            } else if (extension.endsWith(".txt")) {
                return "TXT";
            }
        }

        return "Custom";
    }

    private String calculateFileDigest(MultipartFile file) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] fileBytes = file.getBytes();
            byte[] hashBytes = md.digest(fileBytes);

            // Convert bytes to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            // Fallback to a simple hash based on filename and size
            return "sha256:" + file.getOriginalFilename() + ":" + file.getSize();
        }
    }
}
