package com.mlops.hub.controller;

import com.mlops.hub.entity.Dataset;
import com.mlops.hub.entity.DatasetFile;
import com.mlops.hub.entity.DatasetVersion;
import com.mlops.hub.service.DatasetService;
import com.mlops.hub.service.DatasetVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/datasets")
@CrossOrigin(origins = "*")
public class DatasetController {

    @Autowired
    private DatasetService datasetService;

    @Autowired
    private DatasetVersionService datasetVersionService;

    // Dataset Management
    @GetMapping
    public ResponseEntity<List<Dataset>> getAllDatasets() {
        List<Dataset> datasets = datasetService.getAllDatasets();
        return ResponseEntity.ok(datasets);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Dataset>> getAllDatasetsPaged(Pageable pageable) {
        Page<Dataset> datasets = datasetService.getAllDatasets(pageable);
        return ResponseEntity.ok(datasets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dataset> getDataset(@PathVariable Long id) {
        Optional<Dataset> dataset = datasetService.getDatasetById(id);
        return dataset.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Dataset> createDataset(@RequestBody Dataset dataset) {
        Dataset savedDataset = datasetService.createDataset(dataset);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDataset);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dataset> updateDataset(@PathVariable Long id, @RequestBody Dataset datasetDetails) {
        Dataset updatedDataset = datasetService.updateDataset(id, datasetDetails);
        if (updatedDataset != null) {
            return ResponseEntity.ok(updatedDataset);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDataset(@PathVariable Long id) {
        boolean deleted = datasetService.deleteDataset(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Dataset>> searchDatasets(@RequestParam String name) {
        List<Dataset> datasets = datasetService.searchDatasets(name);
        return ResponseEntity.ok(datasets);
    }

    // --- Dataset Version Management ---
    @PostMapping("/{datasetId}/versions")
    public ResponseEntity<DatasetVersion> createVersion(@PathVariable Long datasetId, 
                                                       @RequestParam(required = false) String description) {
        try {
            DatasetVersion version = datasetVersionService.createVersion(datasetId, description);
            return ResponseEntity.status(HttpStatus.CREATED).body(version);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{datasetId}/versions")
    public ResponseEntity<List<DatasetVersion>> getVersions(@PathVariable Long datasetId) {
        List<DatasetVersion> versions = datasetVersionService.getVersionsByDatasetId(datasetId);
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/{datasetId}/versions/{versionId}")
    public ResponseEntity<DatasetVersion> getVersion(@PathVariable Long datasetId, 
                                                    @PathVariable String versionId) {
        Optional<DatasetVersion> version = datasetVersionService.getVersionById(datasetId, versionId);
        return version.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{datasetId}/versions/{versionId}/commit")
    public ResponseEntity<DatasetVersion> commitVersion(@PathVariable Long datasetId, 
                                                       @PathVariable String versionId) {
        try {
            DatasetVersion version = datasetVersionService.commitVersion(datasetId, versionId);
            return ResponseEntity.ok(version);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{datasetId}/versions/{versionId}/archive")
    public ResponseEntity<DatasetVersion> archiveVersion(@PathVariable Long datasetId, 
                                                        @PathVariable String versionId) {
        try {
            DatasetVersion version = datasetVersionService.archiveVersion(datasetId, versionId);
            return ResponseEntity.ok(version);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{datasetId}/versions/{versionId}")
    public ResponseEntity<Void> deleteVersion(@PathVariable Long datasetId, 
                                             @PathVariable String versionId) {
        try {
            datasetVersionService.deleteVersion(datasetId, versionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // File Management
    @PostMapping("/{datasetId}/versions/{versionId}/files")
    public ResponseEntity<DatasetFile> uploadFile(@PathVariable Long datasetId, 
                                                 @PathVariable String versionId,
                                                 @RequestParam("file") MultipartFile file) {
        try {
            DatasetFile datasetFile = datasetVersionService.uploadFile(datasetId, versionId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(datasetFile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{datasetId}/versions/{versionId}/files")
    public ResponseEntity<List<DatasetFile>> getFiles(@PathVariable Long datasetId, 
                                                     @PathVariable String versionId) {
        try {
            List<DatasetFile> files = datasetVersionService.getFilesByVersion(datasetId, versionId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{datasetId}/versions/{versionId}/files/{fileId}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long datasetId, 
                                              @PathVariable String versionId,
                                              @PathVariable String fileId) {
        try {
            byte[] data = datasetVersionService.downloadFile(datasetId, versionId, fileId);
            
            // Get file info for proper headers
            List<DatasetFile> files = datasetVersionService.getFilesByVersion(datasetId, versionId);
            Optional<DatasetFile> file = files.stream()
                    .filter(f -> f.getFileId().equals(fileId))
                    .findFirst();
            
            if (file.isPresent()) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setContentDispositionFormData("attachment", file.get().getFileName());
                
                return ResponseEntity.ok()
                        .headers(headers)
                        .body(data);
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{datasetId}/versions/{versionId}/files/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long datasetId, 
                                          @PathVariable String versionId,
                                          @PathVariable String fileId) {
        try {
            datasetVersionService.deleteFile(datasetId, versionId, fileId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Legacy support - redirect to latest version
    @GetMapping("/{datasetId}/download")
    public ResponseEntity<byte[]> downloadLatestVersion(@PathVariable Long datasetId) {
        try {
            List<DatasetVersion> versions = datasetVersionService.getVersionsByDatasetId(datasetId);
            if (versions.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Get the latest committed version
            Optional<DatasetVersion> latestVersion = versions.stream()
                    .filter(v -> v.getStatus() == DatasetVersion.VersionStatus.COMMITTED)
                    .findFirst();
            
            if (!latestVersion.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            List<DatasetFile> files = datasetVersionService.getFilesByVersion(datasetId, latestVersion.get().getVersionId());
            if (files.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Download the first file (or you could implement logic to download all files as a zip)
            DatasetFile file = files.get(0);
            byte[] data = datasetVersionService.downloadFile(datasetId, latestVersion.get().getVersionId(), file.getFileId());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", file.getFileName());
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}