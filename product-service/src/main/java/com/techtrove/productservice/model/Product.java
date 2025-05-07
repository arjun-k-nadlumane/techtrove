package com.techtrove.productservice.model;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Product name is required")
    private String name;
    @Column(length = 2000)
    private String description;
    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be greater than or equal to 0")
    private BigDecimal price;
    @NotBlank(message = "Category is required")
    private String category;
    private String brand;
    @Min(value = 0, message = "Stock quantity must be greater than or equal to 0")
    private Integer stockQuantity;
    private String imageUrl;
    @Builder.Default
    private Boolean featured = false;
    @Min(value = 0, message = "Average rating must be greater than or equal to 0")
    @Builder.Default
    private Double averageRating = 0.0;
    @Builder.Default
    private Integer reviewCount = 0;
    @ElementCollection
    @CollectionTable(name = "product_specs", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "spec_key")
    @Column(name = "spec_value")
    private Set<@NotBlank String> specs = new HashSet<>();
    @ElementCollection
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    @Builder.Default
    private Set<String> tags = new HashSet<>();
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    // Method to update inventory
    public boolean updateStock(int quantity) {
        if (this.stockQuantity + quantity < 0) {
            return false; // Can't reduce below 0
        }
        this.stockQuantity += quantity;
        this.updatedAt = LocalDateTime.now();
        return true;
    }

    // Method to update rating when new review is added
    public void updateRating(int rating) {
        double totalRating = this.averageRating * this.reviewCount;
        this.reviewCount++;
        this.averageRating = (totalRating + rating) / this.reviewCount;
        this.updatedAt = LocalDateTime.now();
    }

    // Method to check if product is in stock
    public boolean isInStock() {
        return this.stockQuantity > 0;
    }

    // Pre-update callback
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
