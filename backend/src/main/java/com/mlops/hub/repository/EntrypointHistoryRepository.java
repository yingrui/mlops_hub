package com.mlops.hub.repository;

import com.mlops.hub.entity.EntrypointHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntrypointHistoryRepository extends JpaRepository<EntrypointHistory, Long> {
    
    List<EntrypointHistory> findByEntrypointIdOrderByCreatedAtDesc(Long entrypointId);
    
    @Query("SELECT h FROM EntrypointHistory h WHERE h.entrypointId = :entrypointId ORDER BY h.createdAt DESC")
    List<EntrypointHistory> findRecentByEntrypointId(@Param("entrypointId") Long entrypointId);
    
    @Query("SELECT COUNT(h) FROM EntrypointHistory h WHERE h.entrypointId = :entrypointId")
    Long countByEntrypointId(@Param("entrypointId") Long entrypointId);
    
    void deleteByEntrypointId(Long entrypointId);
}

