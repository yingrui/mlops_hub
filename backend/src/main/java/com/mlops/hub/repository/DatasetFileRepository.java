package com.mlops.hub.repository;

import com.mlops.hub.entity.DatasetFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasetFileRepository extends JpaRepository<DatasetFile, Long> {
    
    List<DatasetFile> findByVersionIdOrderByCreatedAtAsc(Long versionId);
    
    Optional<DatasetFile> findByVersionIdAndFileId(Long versionId, String fileId);
    
    Optional<DatasetFile> findByVersionIdAndFileName(Long versionId, String fileName);
    
    @Query("SELECT f FROM DatasetFile f WHERE f.versionId = :versionId AND f.fileName LIKE %:fileName%")
    List<DatasetFile> findByVersionIdAndFileNameContaining(@Param("versionId") Long versionId, @Param("fileName") String fileName);
    
    void deleteByVersionId(Long versionId);
}
