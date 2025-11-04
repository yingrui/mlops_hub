package com.mlops.hub.controller;

import com.mlops.hub.service.ObjectStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/storage")
public class StorageController {

    @Autowired
    private ObjectStorageService objectStorageService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
                                           @RequestParam("path") String path) {
        try {
            objectStorageService.uploadFile(path, file);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{path}")
    public ResponseEntity<InputStream> downloadFile(@PathVariable String path) {
        try {
            InputStream fileStream = objectStorageService.downloadFile(path);
            return ResponseEntity.ok(fileStream);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{path}")
    public ResponseEntity<String> deleteFile(@PathVariable String path) {
        try {
            objectStorageService.deleteFile(path);
            return ResponseEntity.ok("File deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete file: " + e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> listFiles(@RequestParam(required = false) String prefix) {
        try {
            List<String> files = objectStorageService.listFiles(prefix != null ? prefix : "");
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
