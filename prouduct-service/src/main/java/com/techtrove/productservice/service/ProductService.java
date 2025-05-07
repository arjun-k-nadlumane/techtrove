package com.techtrove.productservice.service;

import com.techtrove.productservice.model.Product;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductService {
    List<Product> findProducts(String category, String brand, BigDecimal minPrice, BigDecimal maxPrice, Boolean inStock,
            String sortBy);

    Optional<Product> findById(Long id);

    Product save(Product product);

    Optional<Product> update(Long id, Product product);

    boolean delete(Long id);

    Optional<Product> updateInventory(Long id, int quantity);

    List<Product> findByCategory(String category);

    List<Product> findFeaturedProducts();

    List<Product> searchProducts(String keyword);

    List<Product> getRecommendations(Long id, int limit);

    boolean existsById(Long id);
}