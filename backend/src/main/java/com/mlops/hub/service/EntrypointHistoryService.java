package com.mlops.hub.service;

import com.mlops.hub.entity.EntrypointHistory;
import com.mlops.hub.repository.EntrypointHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class EntrypointHistoryService {
    
    @Autowired
    private EntrypointHistoryRepository historyRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public EntrypointHistory saveHistory(Long entrypointId, Object requestBody, Object responseBody, 
                                        Integer statusCode, String status, String errorMessage, Long elapsedTimeMs) {
        EntrypointHistory history = new EntrypointHistory();
        history.setEntrypointId(entrypointId);
        
        try {
            history.setRequestBody(objectMapper.writeValueAsString(requestBody));
        } catch (Exception e) {
            history.setRequestBody(String.valueOf(requestBody));
        }
        
        try {
            history.setResponseBody(objectMapper.writeValueAsString(responseBody));
        } catch (Exception e) {
            history.setResponseBody(String.valueOf(responseBody));
        }
        
        history.setStatusCode(statusCode);
        history.setStatus(status != null ? status : "success");
        history.setErrorMessage(errorMessage);
        history.setElapsedTimeMs(elapsedTimeMs);
        
        return historyRepository.save(history);
    }
    
    public List<EntrypointHistory> getHistoryByEntrypointId(Long entrypointId) {
        return historyRepository.findByEntrypointIdOrderByCreatedAtDesc(entrypointId);
    }
    
    public List<EntrypointHistory> getRecentHistory(Long entrypointId, int limit) {
        List<EntrypointHistory> all = historyRepository.findByEntrypointIdOrderByCreatedAtDesc(entrypointId);
        return all.stream().limit(limit).toList();
    }
    
    public Long countByEntrypointId(Long entrypointId) {
        return historyRepository.countByEntrypointId(entrypointId);
    }
    
    public void deleteHistoryByEntrypointId(Long entrypointId) {
        historyRepository.deleteByEntrypointId(entrypointId);
    }
    
    public Map<String, Object> getMetrics(Long entrypointId, int hours) {
        List<EntrypointHistory> allHistory = historyRepository.findByEntrypointIdOrderByCreatedAtDesc(entrypointId);
        
        LocalDateTime cutoff = LocalDateTime.now().minusHours(hours);
        List<EntrypointHistory> recentHistory = allHistory.stream()
                .filter(h -> h.getCreatedAt() != null && h.getCreatedAt().isAfter(cutoff))
                .toList();
        
        long totalRequests = recentHistory.size();
        long successfulRequests = recentHistory.stream()
                .filter(h -> "success".equals(h.getStatus()))
                .count();
        long errorRequests = recentHistory.stream()
                .filter(h -> "error".equals(h.getStatus()))
                .count();
        
        double errorRate = totalRequests > 0 ? (double) errorRequests / totalRequests * 100 : 0;
        
        double avgLatency = recentHistory.stream()
                .filter(h -> h.getElapsedTimeMs() != null)
                .mapToLong(EntrypointHistory::getElapsedTimeMs)
                .average()
                .orElse(0.0);
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalRequests", totalRequests);
        metrics.put("successfulRequests", successfulRequests);
        metrics.put("errorRequests", errorRequests);
        metrics.put("errorRate", errorRate);
        metrics.put("averageLatency", avgLatency);
        metrics.put("timeRangeHours", hours);
        
        return metrics;
    }
    
    public Map<String, Object> getDailyMetrics(Long entrypointId, int days) {
        List<EntrypointHistory> allHistory = historyRepository.findByEntrypointIdOrderByCreatedAtDesc(entrypointId);
        
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        List<EntrypointHistory> recentHistory = allHistory.stream()
                .filter(h -> h.getCreatedAt() != null && h.getCreatedAt().isAfter(cutoff))
                .toList();
        
        // Group by date
        Map<String, Map<String, Long>> dailyStats = recentHistory.stream()
                .collect(Collectors.groupingBy(
                        h -> h.getCreatedAt().toLocalDate().toString(),
                        Collectors.groupingBy(
                                EntrypointHistory::getStatus,
                                Collectors.counting()
                        )
                ));
        
        // Create time series data for the last N days
        List<Map<String, Object>> timeSeries = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            String date = LocalDateTime.now().minusDays(i).toLocalDate().toString();
            Map<String, Long> stats = dailyStats.getOrDefault(date, Map.of());
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date);
            dayData.put("total", stats.getOrDefault("success", 0L) + stats.getOrDefault("error", 0L));
            dayData.put("successful", stats.getOrDefault("success", 0L));
            dayData.put("errors", stats.getOrDefault("error", 0L));
            timeSeries.add(dayData);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("timeSeries", timeSeries);
        result.put("days", days);
        
        return result;
    }
}

