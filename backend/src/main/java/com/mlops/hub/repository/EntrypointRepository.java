package com.mlops.hub.repository;

import com.mlops.hub.entity.Entrypoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntrypointRepository extends JpaRepository<Entrypoint, Long> {
    
    Optional<Entrypoint> findByName(String name);
    
    List<Entrypoint> findByStatus(String status);
    
    List<Entrypoint> findByType(String type);
    
    List<Entrypoint> findByModelId(Long modelId);
    
    List<Entrypoint> findByInferenceServiceId(Long inferenceServiceId);
    
    List<Entrypoint> findByOwnerId(Long ownerId);
    
    @Query("SELECT e FROM Entrypoint e WHERE e.name LIKE %:query% OR e.description LIKE %:query%")
    List<Entrypoint> searchByNameOrDescription(@Param("query") String query);
    
    @Query("SELECT e FROM Entrypoint e WHERE e.modelId = :modelId")
    List<Entrypoint> findByModel(@Param("modelId") Long modelId);
    
    @Query("SELECT e FROM Entrypoint e WHERE e.inferenceServiceId = :serviceId")
    List<Entrypoint> findByInferenceService(@Param("serviceId") Long serviceId);
    
    @Query("SELECT e FROM Entrypoint e WHERE e.status = :status AND e.type = :type")
    List<Entrypoint> findByStatusAndType(@Param("status") String status, @Param("type") String type);
}

