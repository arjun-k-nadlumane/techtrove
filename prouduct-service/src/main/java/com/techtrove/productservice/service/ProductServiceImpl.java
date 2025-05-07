package com.techtrove.productservice.service;

import com.techtrove.productservice.model.Product;
import com.techtrove.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;

    @Override
    public List<Product> findProducts(String category, String brand, BigDecimal minPrice, BigDecimal maxPrice,
            Boolean inStock, String sortBy) {

        List<Product> products = productRepository.findAll();
        return products.stream()
                .filter(p -> category == null || p.getCategory().equalsIgnoreCase(category))
                .filter(p -> brand == null || (p.getBrand() != null && p.getBrand().equalsIgnoreCase(brand)))
                .filter(p -> minPrice == null || p.getPrice().compareTo(minPrice) >= 0)
                .filter(p -> maxPrice == null || p.getPrice().compareTo(maxPrice) <= 0)
                .filter(p -> inStock == null || (inStock && p.isInStock()))
                .sorted(getComparator(sortBy))
                .collect(Collectors.toList());
    }

    private Comparator<Product> getComparator(String sortBy) {
        return switch (sortBy) {
            case "priceAsc" -> Comparator.comparing(Product::getPrice);
            case "priceDesc" -> Comparator.comparing(Product::getPrice).reversed();
            case "latest" -> Comparator.comparing(Product::getCreatedAt).reversed();
            default -> Comparator.comparing(Product::getAverageRating).reversed();
        };
    }

    @Override
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public Product save(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Optional<Product> update(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existing -> {
            updatedProduct.setId(id);
            updatedProduct.setCreatedAt(existing.getCreatedAt());
            return productRepository.save(updatedProduct);
        });
    }

    @Override
    public boolean delete(Long id) {
        return productRepository.findById(id).map(product -> {
            productRepository.delete(product);
            return true;
        }).orElse(false);
    }

    @Override
    public Optional<Product> updateInventory(Long id, int quantity) {
        return productRepository.findById(id).map(product -> {
            if (!product.updateStock(quantity))
                return null;
            return productRepository.save(product);
        });
    }

    @Override
    public List<Product> findByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Override
    public List<Product> findFeaturedProducts() {
        return productRepository.findByFeaturedTrue();
    }

    @Override
    public List<Product> searchProducts(String keyword) {
        return productRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                        p.getDescription().toLowerCase().contains(keyword.toLowerCase()) ||
                        p.getBrand().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsById(Long id) {
        return productRepository.existsById(id);
    }

    @Override
    public List<Product> getRecommendations(Long id, int limit) {
        return productRepository.findById(id)
                .map(product -> productRepository.findAll().stream()
                        .filter(p -> !p.getId().equals(id) &&
                                p.getCategory().equalsIgnoreCase(product.getCategory()))
                        .limit(limit)
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

}
