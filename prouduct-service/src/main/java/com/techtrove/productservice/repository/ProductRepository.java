package com.techtrove.productservice.repository;

import com.techtrove.productservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);

    List<Product> findByFeaturedTrue();

    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    List<Product> findByCategoryAndBrandAndPriceBetween(String category, String brand, BigDecimal min, BigDecimal max);
}