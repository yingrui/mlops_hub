package com.mlops.hub.controller;

import com.mlops.hub.service.MLflowFacadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/models")
@CrossOrigin(origins = "*")
public class ModelController {

    @Autowired
    private MLflowFacadeService mlflowFacadeService;

    // Registered Model endpoints
    @GetMapping
    public Mono<ResponseEntity<Map>> listRegisteredModels() {
        return mlflowFacadeService.listRegisteredModels()
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/{modelName}")
    public Mono<ResponseEntity<Map>> getRegisteredModel(@PathVariable String modelName) {
        return mlflowFacadeService.getRegisteredModel(modelName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<ResponseEntity<Map>> createRegisteredModel(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        return mlflowFacadeService.createRegisteredModel(name)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{modelName}")
    public Mono<ResponseEntity<Map>> updateRegisteredModel(@PathVariable String modelName, @RequestBody Map<String, String> request) {
        String description = request.get("description");
        return mlflowFacadeService.updateRegisteredModel(modelName, description)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{modelName}")
    public Mono<ResponseEntity<Map>> deleteRegisteredModel(@PathVariable String modelName) {
        return mlflowFacadeService.deleteRegisteredModel(modelName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<Map>> searchRegisteredModels(@RequestParam String filter) {
        return mlflowFacadeService.searchRegisteredModels(filter)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    // Model Version endpoints
    @GetMapping("/{modelName}/versions")
    public Mono<ResponseEntity<Map>> listModelVersions(@PathVariable String modelName) {
        return mlflowFacadeService.listModelVersions(modelName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/{modelName}/versions/{version}")
    public Mono<ResponseEntity<Map>> getModelVersion(@PathVariable String modelName, @PathVariable String version) {
        return mlflowFacadeService.getModelVersion(modelName, version)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @PostMapping("/{modelName}/versions")
    public Mono<ResponseEntity<Map>> createModelVersion(@PathVariable String modelName, @RequestBody Map<String, String> request) {
        String source = request.get("source");
        String runId = request.get("run_id");
        return mlflowFacadeService.createModelVersion(modelName, source, runId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{modelName}/versions/{version}")
    public Mono<ResponseEntity<Map>> updateModelVersion(@PathVariable String modelName, @PathVariable String version, @RequestBody Map<String, String> request) {
        String description = request.get("description");
        String stage = request.get("stage");
        return mlflowFacadeService.updateModelVersion(modelName, version, description, stage)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @PostMapping("/{modelName}/versions/{version}/transition-stage")
    public Mono<ResponseEntity<Map>> transitionModelVersionStage(@PathVariable String modelName, @PathVariable String version, @RequestBody Map<String, String> request) {
        String stage = request.get("stage");
        String archiveExistingVersions = request.get("archive_existing_versions");
        return mlflowFacadeService.transitionModelVersionStage(modelName, version, stage, archiveExistingVersions)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{modelName}/versions/{version}")
    public Mono<ResponseEntity<Map>> deleteModelVersion(@PathVariable String modelName, @PathVariable String version) {
        return mlflowFacadeService.deleteModelVersion(modelName, version)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/{modelName}/versions/latest")
    public Mono<ResponseEntity<Map>> getLatestModelVersions(@PathVariable String modelName, @RequestParam(required = false) String stages) {
        return mlflowFacadeService.getLatestModelVersions(modelName, stages)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/{modelName}/versions/search")
    public Mono<ResponseEntity<Map>> searchModelVersions(@PathVariable String modelName, @RequestParam String filter) {
        return mlflowFacadeService.searchModelVersions(filter)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }
}