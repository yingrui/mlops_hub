package com.mlops.hub.repository;

import com.mlops.hub.entity.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset, Long> {
    
    Optional<Dataset> findByName(String name);
    
    List<Dataset> findByNameContainingIgnoreCase(String name);
}
