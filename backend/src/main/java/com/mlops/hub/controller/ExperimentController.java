package com.mlops.hub.controller;

import com.mlops.hub.service.MLflowFacadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/experiments")
@CrossOrigin(origins = "*")
public class ExperimentController {

    @Autowired
    private MLflowFacadeService mlflowFacadeService;

    // Experiment endpoints
    @GetMapping
    public Mono<ResponseEntity<Map>> listExperiments() {
        return mlflowFacadeService.listExperiments()
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/{experimentId}")
    public Mono<ResponseEntity<Map>> getExperiment(@PathVariable String experimentId) {
        return mlflowFacadeService.getExperiment(experimentId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name/{experimentName}")
    public Mono<ResponseEntity<Map>> getExperimentByName(@PathVariable String experimentName) {
        return mlflowFacadeService.getExperimentByName(experimentName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<ResponseEntity<Map>> createExperiment(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        return mlflowFacadeService.createExperiment(name)
                .map(experimentId -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("experiment_id", experimentId);
                    return ResponseEntity.ok((Map) response);
                })
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{experimentId}")
    public Mono<ResponseEntity<Map>> updateExperiment(@PathVariable String experimentId, @RequestBody Map<String, String> request) {
        String newName = request.get("new_name");
        return mlflowFacadeService.updateExperiment(experimentId, newName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{experimentId}")
    public Mono<ResponseEntity<Map>> deleteExperiment(@PathVariable String experimentId) {
        return mlflowFacadeService.deleteExperiment(experimentId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @PostMapping("/{experimentId}/restore")
    public Mono<ResponseEntity<Map>> restoreExperiment(@PathVariable String experimentId) {
        return mlflowFacadeService.restoreExperiment(experimentId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<Map>> searchExperiments(@RequestParam String filter) {
        return mlflowFacadeService.searchExperiments(filter)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }
}