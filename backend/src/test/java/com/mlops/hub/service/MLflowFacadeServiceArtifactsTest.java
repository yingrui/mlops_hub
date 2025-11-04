package com.mlops.hub.service;

import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.isA;

@ExtendWith(MockitoExtension.class)
class MLflowFacadeServiceArtifactsTest {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private MLflowFacadeService mlflowFacadeService;

    @BeforeEach
    void setUp() {
        // Setup common mock chain using doReturn to avoid ambiguity
        doReturn(requestHeadersUriSpec).when(webClient).get();
        doReturn(requestHeadersSpec).when(requestHeadersUriSpec).uri(isA(java.util.function.Function.class));
        doReturn(responseSpec).when(requestHeadersSpec).retrieve();
    }

    @Test
    void testListArtifactsSuccess() {
        // Mock successful response
        Map<String, Object> mockResponse = Map.of(
            "root_uri", "s3://mlflow/1/test-run-id/artifacts",
            "files", new Object[]{
                Map.of("path", "iris_model", "is_dir", true),
                Map.of("path", "config.yaml", "is_dir", false, "file_size", 1024)
            }
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        StepVerifier.create(mlflowFacadeService.listArtifacts("test-run-id", "", ""))
                .expectNext(mockResponse)
                .verifyComplete();
    }

    @Test
    void testListArtifactsWithPath() {
        // Mock successful response for directory contents
        Map<String, Object> mockResponse = Map.of(
            "root_uri", "s3://mlflow/1/test-run-id/artifacts",
            "files", new Object[]{
                Map.of("path", "iris_model/MLmodel", "is_dir", false, "file_size", 927),
                Map.of("path", "iris_model/conda.yaml", "is_dir", false, "file_size", 262)
            }
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        StepVerifier.create(mlflowFacadeService.listArtifacts("test-run-id", "iris_model", ""))
                .expectNext(mockResponse)
                .verifyComplete();
    }

    @Test
    void testListArtifactsWithPageToken() {
        // Mock successful response with pagination
        Map<String, Object> mockResponse = Map.of(
            "root_uri", "s3://mlflow/1/test-run-id/artifacts",
            "files", new Object[]{
                Map.of("path", "file1.txt", "is_dir", false, "file_size", 100)
            },
            "next_page_token", "next-page-token"
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        StepVerifier.create(mlflowFacadeService.listArtifacts("test-run-id", "", "page-token"))
                .expectNext(mockResponse)
                .verifyComplete();
    }

    @Test
    void testListArtifactsError() {
        // Mock error response
        when(responseSpec.bodyToMono(Map.class))
                .thenReturn(Mono.error(new RuntimeException("MLflow service error")));

        StepVerifier.create(mlflowFacadeService.listArtifacts("test-run-id", "", ""))
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void testDownloadArtifactSuccess() {
        // Mock successful download
        byte[] mockContent = "test artifact content".getBytes();
        
        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.just(mockContent));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "iris_model/MLmodel"))
                .expectNext(mockContent)
                .verifyComplete();
    }

    @Test
    void testDownloadArtifactError() {
        // Mock download error
        when(responseSpec.bodyToMono(byte[].class))
                .thenReturn(Mono.error(new RuntimeException("Download failed")));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "nonexistent/file.txt"))
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void testListArtifactsEmptyResponse() {
        // Mock empty response
        Map<String, Object> mockResponse = Map.of(
            "root_uri", "s3://mlflow/1/test-run-id/artifacts",
            "files", new Object[]{}
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        StepVerifier.create(mlflowFacadeService.listArtifacts("test-run-id", "", ""))
                .expectNext(mockResponse)
                .verifyComplete();
    }

    @Test
    void testListArtifactsNullPath() {
        // Test with null path parameter
        Map<String, Object> mockResponse = Map.of(
            "root_uri", "s3://mlflow/1/test-run-id/artifacts",
            "files", new Object[]{
                Map.of("path", "root_file.txt", "is_dir", false, "file_size", 100)
            }
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        StepVerifier.create(mlflowFacadeService.listArtifacts("test-run-id", null, null))
                .expectNext(mockResponse)
                .verifyComplete();
    }

    @Test
    void testDownloadArtifactLargeFile() {
        // Test download of large file
        byte[] largeContent = new byte[1024 * 1024]; // 1MB
        for (int i = 0; i < largeContent.length; i++) {
            largeContent[i] = (byte) (i % 256);
        }

        when(responseSpec.bodyToMono(byte[].class)).thenReturn(Mono.just(largeContent));

        StepVerifier.create(mlflowFacadeService.downloadArtifact("test-run-id", "large_model.pkl"))
                .expectNext(largeContent)
                .verifyComplete();
    }
}
