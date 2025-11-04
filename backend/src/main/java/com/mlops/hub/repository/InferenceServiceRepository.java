package com.mlops.hub.repository;

import com.mlops.hub.entity.InferenceService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InferenceServiceRepository extends JpaRepository<InferenceService, Long> {
    
    Optional<InferenceService> findByName(String name);
    
    List<InferenceService> findByStatus(String status);
    
    List<InferenceService> findByNamespace(String namespace);
    
    @Query("SELECT i FROM InferenceService i WHERE i.name LIKE %:name% OR i.description LIKE %:description%")
    List<InferenceService> findByNameOrDescriptionContaining(@Param("name") String name, @Param("description") String description);
}
