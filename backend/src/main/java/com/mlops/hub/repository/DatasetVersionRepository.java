package com.mlops.hub.repository;

import com.mlops.hub.entity.DatasetVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasetVersionRepository extends JpaRepository<DatasetVersion, Long> {
    
    List<DatasetVersion> findByDatasetIdOrderByVersionNumberDesc(Long datasetId);
    
    Optional<DatasetVersion> findByDatasetIdAndVersionId(Long datasetId, String versionId);
    
    Optional<DatasetVersion> findByDatasetIdAndVersionNumber(Long datasetId, Integer versionNumber);
    
    @Query("SELECT MAX(v.versionNumber) FROM DatasetVersion v WHERE v.datasetId = :datasetId")
    Optional<Integer> findMaxVersionNumberByDatasetId(@Param("datasetId") Long datasetId);
    
    List<DatasetVersion> findByDatasetIdAndStatusOrderByVersionNumberDesc(Long datasetId, DatasetVersion.VersionStatus status);
    
    Optional<DatasetVersion> findByDatasetIdAndStatus(Long datasetId, DatasetVersion.VersionStatus status);
}
