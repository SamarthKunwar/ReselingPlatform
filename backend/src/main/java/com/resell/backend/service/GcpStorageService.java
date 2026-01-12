package com.resell.backend.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "gcp")
public class GcpStorageService implements StorageService {

    @Autowired
    private Storage storage;

    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        System.out.println("Uploading to GCP bucket: " + bucketName + ", file: " + filename);

        try {
            BlobId blobId = BlobId.of(bucketName, filename);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(file.getContentType()).build();

            storage.create(blobInfo, file.getBytes());

            String url = "https://storage.googleapis.com/" + bucketName + "/" + filename;
            System.out.println("Upload successful. URL: " + url);
            return url;
        } catch (com.google.cloud.storage.StorageException e) {
            System.err.println("GCP Storage Error: " + e.getMessage());
            System.err.println("Error Code: " + e.getCode());
            System.err.println("Reason: " + e.getReason());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error during GCP upload: " + e.getMessage());
            throw new IOException("Failed to upload to GCP", e);
        }
    }
}
