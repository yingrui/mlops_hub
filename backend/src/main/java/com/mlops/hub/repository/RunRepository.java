package com.mlops.hub.repository;

import com.mlops.hub.entity.Run;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RunRepository extends JpaRepository<Run, Long> {
    
    List<Run> findByExperimentId(Long experimentId);
    
    List<Run> findByStatus(String status);
    
    Optional<Run> findByMlflowRunId(String mlflowRunId);
    
    List<Run> findByNameContainingIgnoreCase(String name);
}
