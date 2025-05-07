package com.techtrove.productservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@EnableScheduling
public class ProductServiceApplication {

    private final RestTemplate restTemplate;
    private String serviceId;
    private final String serviceRegistryUrl;
    private final int servicePort;

    public ProductServiceApplication(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
        this.serviceRegistryUrl = System.getProperty("SERVICE_REGISTRY_URL", "http://localhost:8080");
        this.servicePort = Integer.parseInt(System.getProperty("SERVER_PORT", "8082"));
    }

    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @PostConstruct
    public void registerWithServiceRegistry() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> registrationRequest = new HashMap<>();
            registrationRequest.put("serviceName", "product-service");
            registrationRequest.put("serviceUrl", "http://localhost:" + servicePort);
            registrationRequest.put("healthCheckUrl", "http://localhost:" + servicePort + "/actuator/health");

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(registrationRequest, headers);

            Map response = restTemplate.postForObject(serviceRegistryUrl + "/register", entity, Map.class);

            if (response != null && response.containsKey("id")) {
                serviceId = (String) response.get("id");
                System.out.println("Registered with Service Registry. ID: " + serviceId);
            }
        } catch (Exception e) {
            System.err.println("Failed to register with Service Registry: " + e.getMessage());
        }
    }

    @PreDestroy
    public void deregisterFromServiceRegistry() {
        if (serviceId != null) {
            try {
                restTemplate.delete(serviceRegistryUrl + "/register/" + serviceId);
                System.out.println("Deregistered from Service Registry");
            } catch (Exception e) {
                System.err.println("Failed to deregister from Service Registry: " + e.getMessage());
            }
        }
    }

    @Scheduled(fixedRate = 30000) // Send heartbeat every 30 seconds
    public void sendHeartbeat() {
        if (serviceId != null) {
            try {
                Map response = restTemplate.getForObject(serviceRegistryUrl + "/service/" + serviceId, Map.class);
                System.out.println("Heartbeat sent to Service Registry");
            } catch (Exception e) {
                System.err.println("Failed to send heartbeat: " + e.getMessage());
                // Try to re-register
                registerWithServiceRegistry();
            }
        }
    }
}
