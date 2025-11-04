package com.mlops.hub.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArtifactFileHandlingTest {

    @Mock
    private WebClient mlflowWebClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private MLflowFacadeService mlflowFacadeService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        // Setup common mock chain using doReturn to avoid ambiguity
        doReturn(requestHeadersUriSpec).when(mlflowWebClient).get();
        doReturn(requestHeadersSpec).when(requestHeadersUriSpec).uri(isA(java.util.function.Function.class));
        doReturn(responseSpec).when(requestHeadersSpec).retrieve();
    }

    @Test
    void testDownloadTextFile() {
        // Mock successful download of a text file
        String textContent = "python: 3.11.4\nbuild_dependencies:\n- pip==25.0";
        byte[] contentBytes = textContent.getBytes();
        
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.just(contentBytes));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "python_env.yaml"))
            .expectNext(contentBytes)
            .verifyComplete();
    }

    @Test
    void testDownloadMLmodelFile() {
        // Mock successful download of MLmodel file
        String mlmodelContent = "artifact_path: iris_model\nflavors:\n  python_function:\n    env:\n      conda: conda.yaml";
        byte[] contentBytes = mlmodelContent.getBytes();
        
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.just(contentBytes));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "iris_model/MLmodel"))
            .expectNext(contentBytes)
            .verifyComplete();
    }

    @Test
    void testDownloadBinaryFile() {
        // Mock successful download of a binary file
        byte[] binaryContent = new byte[]{0x50, 0x4B, 0x03, 0x04}; // ZIP file header
        
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.just(binaryContent));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "model.pkl"))
            .expectNext(binaryContent)
            .verifyComplete();
    }

    @Test
    void testDownloadLargeFile() {
        // Mock successful download of a large file (> 1MB)
        byte[] largeContent = new byte[2 * 1024 * 1024]; // 2MB
        for (int i = 0; i < largeContent.length; i++) {
            largeContent[i] = (byte) (i % 256);
        }
        
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.just(largeContent));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "large_file.bin"))
            .expectNext(largeContent)
            .verifyComplete();
    }

    @Test
    void testDownloadFileNotFound() {
        // Mock 404 error for non-existent file
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.error(new RuntimeException("404 Not Found")));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "nonexistent.txt"))
            .expectError(RuntimeException.class)
            .verify();
    }

    @Test
    void testListArtifactsWithMixedFileTypes() {
        // Mock artifacts list with mixed file types
        Map<String, Object> artifactsResponse = Map.of(
            "root_uri", "s3://mlflow/1/test-run-id/artifacts",
            "files", new Object[]{
                Map.of("path", "iris_model", "is_dir", true),
                Map.of("path", "iris_model/MLmodel", "is_dir", false, "file_size", 927),
                Map.of("path", "iris_model/model.pkl", "is_dir", false, "file_size", 1024),
                Map.of("path", "iris_model/python_env.yaml", "is_dir", false, "file_size", 120),
                Map.of("path", "iris_model/requirements.txt", "is_dir", false, "file_size", 135),
                Map.of("path", "iris_model/large_file.bin", "is_dir", false, "file_size", 2 * 1024 * 1024),
                Map.of("path", "iris_model/config.json", "is_dir", false, "file_size", 256),
                Map.of("path", "iris_model/image.png", "is_dir", false, "file_size", 512)
            }
        );
        
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(artifactsResponse));

        StepVerifier.create(mlflowFacadeService.listArtifacts("test-run-id", null, null))
            .expectNext(artifactsResponse)
            .verifyComplete();
    }

    @Test
    void testListArtifactsInDirectory() {
        // Mock artifacts list for a specific directory
        Map<String, Object> directoryResponse = Map.of(
            "root_uri", "s3://mlflow/1/test-run-id/artifacts",
            "files", new Object[]{
                Map.of("path", "iris_model/MLmodel", "is_dir", false, "file_size", 927),
                Map.of("path", "iris_model/model.pkl", "is_dir", false, "file_size", 1024),
                Map.of("path", "iris_model/python_env.yaml", "is_dir", false, "file_size", 120)
            }
        );
        
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(directoryResponse));

        StepVerifier.create(mlflowFacadeService.listArtifacts("test-run-id", "iris_model", null))
            .expectNext(directoryResponse)
            .verifyComplete();
    }

    @Test
    void testDownloadWithSpecialCharacters() {
        // Test downloading files with special characters in path
        String content = "test content with special chars";
        byte[] contentBytes = content.getBytes();
        
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.just(contentBytes));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "folder with spaces/file.txt"))
            .expectNext(contentBytes)
            .verifyComplete();
    }

    @Test
    void testDownloadEmptyFile() {
        // Test downloading an empty file
        byte[] emptyContent = new byte[0];
        
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.just(emptyContent));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "empty.txt"))
            .expectNext(emptyContent)
            .verifyComplete();
    }

    @Test
    void testDownloadWithNetworkError() {
        // Test handling of network errors
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.error(new RuntimeException("Connection timeout")));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "file.txt"))
            .expectError(RuntimeException.class)
            .verify();
    }
}
