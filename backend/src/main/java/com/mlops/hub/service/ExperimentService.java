package com.mlops.hub.service;

import com.mlops.hub.entity.Experiment;
import com.mlops.hub.entity.Run;
import com.mlops.hub.repository.ExperimentRepository;
import com.mlops.hub.repository.RunRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ExperimentService {

    @Autowired
    private ExperimentRepository experimentRepository;

    @Autowired
    private RunRepository runRepository;

    @Autowired
    private WebClient mlflowWebClient;

    public List<Experiment> getAllExperiments() {
        return experimentRepository.findAll();
    }

    public Optional<Experiment> getExperimentById(Long id) {
        return experimentRepository.findById(id);
    }

    public Experiment createExperiment(Experiment experiment) {
        // Create experiment in MLflow
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/experiments/create")
                .bodyValue(Map.of("name", experiment.getName()))
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    String mlflowExperimentId = (String) response.get("experiment_id");
                    experiment.setMlflowExperimentId(mlflowExperimentId);
                    return experimentRepository.save(experiment);
                })
                .block();
    }

    public Optional<Experiment> updateExperiment(Long id, Experiment experimentDetails) {
        Optional<Experiment> optionalExperiment = experimentRepository.findById(id);
        if (optionalExperiment.isPresent()) {
            Experiment experiment = optionalExperiment.get();
            experiment.setName(experimentDetails.getName());
            experiment.setDescription(experimentDetails.getDescription());
            return Optional.of(experimentRepository.save(experiment));
        }
        return Optional.empty();
    }

    public boolean deleteExperiment(Long id) {
        if (experimentRepository.existsById(id)) {
            experimentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Experiment> searchExperiments(String name) {
        return experimentRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Run> getRunsByExperiment(Long experimentId) {
        return runRepository.findByExperimentId(experimentId);
    }

    public Run createRun(Long experimentId, Run run) {
        Optional<Experiment> experiment = experimentRepository.findById(experimentId);
        if (experiment.isPresent()) {
            run.setExperiment(experiment.get());
            
            // Create run in MLflow
            return mlflowWebClient.post()
                    .uri("/api/2.0/mlflow/runs/create")
                    .bodyValue(Map.of("experiment_id", experiment.get().getMlflowExperimentId()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .map(response -> {
                        String mlflowRunId = (String) response.get("run_id");
                        run.setMlflowRunId(mlflowRunId);
                        return runRepository.save(run);
                    })
                    .block();
        }
        return null;
    }

    public Mono<Map> getMLflowExperiment(String experimentId) {
        return mlflowWebClient.get()
                .uri("/api/2.0/mlflow/experiments/get")
                .attribute("experiment_id", experimentId)
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getMLflowRun(String runId) {
        return mlflowWebClient.get()
                .uri("/api/2.0/mlflow/runs/get")
                .attribute("run_id", runId)
                .retrieve()
                .bodyToMono(Map.class);
    }
}
