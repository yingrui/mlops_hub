package com.mlops.hub.repository;

import com.mlops.hub.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    
    List<Model> findByName(String name);
    
    List<Model> findByNameContainingIgnoreCase(String name);
    
    List<Model> findByModelType(String modelType);
    
    Optional<Model> findByNameAndVersion(String name, String version);
}
