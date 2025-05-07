package com.techtrove.productservice.controller;

import com.techtrove.productservice.model.Product;
import com.techtrove.productservice.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Product API")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products", description = "Returns all products with optional filtering")
    @ApiResponse(responseCode = "200", description = "Products found")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(defaultValue = "popular") String sortBy) {
        return ResponseEntity.ok(productService.findProducts(category, brand, minPrice, maxPrice, inStock, sortBy));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Returns a product by its ID")
    @ApiResponse(responseCode = "200", description = "Product found")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<Product> getProductById(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new product", description = "Creates a new product")
    @ApiResponse(responseCode = "201", description = "Product created", content = @Content(schema = @Schema(implementation = Product.class)))
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product createdProduct = productService.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product", description = "Updates a product by its ID")
    @ApiResponse(responseCode = "200", description = "Product updated")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<Product> updateProduct(
            @Parameter(description = "Product ID") @PathVariable Long id,
            @Valid @RequestBody Product product) {
        return productService.update(id, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product", description = "Deletes a product by its ID")
    @ApiResponse(responseCode = "204", description = "Product deleted")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        if (productService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/inventory")
    @Operation(summary = "Update product inventory", description = "Updates product inventory quantity")
    @ApiResponse(responseCode = "200", description = "Inventory updated")
    @ApiResponse(responseCode = "404", description = "Product not found")
    @ApiResponse(responseCode = "400", description = "Invalid inventory update")
    public ResponseEntity<Product> updateInventory(
            @Parameter(description = "Product ID") @PathVariable Long id,
            @RequestBody Map<String, Integer> inventoryUpdate) {
        Integer quantity = inventoryUpdate.get("quantity");
        if (quantity == null) {
            return ResponseEntity.badRequest().build();
        }
        return productService.updateInventory(id, quantity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get products by category", description = "Returns products by category")
    @ApiResponse(responseCode = "200", description = "Products found")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @Parameter(description = "Category name") @PathVariable String category) {
        return ResponseEntity.ok(productService.findByCategory(category));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Returns featured products")
    @ApiResponse(responseCode = "200", description = "Featured products found")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.findFeaturedProducts());
    }

    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search products by keyword")
    @ApiResponse(responseCode = "200", description = "Search results")
    public ResponseEntity<List<Product>> searchProducts(
            @Parameter(description = "Search keyword") @RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    @GetMapping("/{id}/recommendations")
    @Operation(summary = "Get product recommendations", description = "Returns product recommendations")
    @ApiResponse(responseCode = "200", description = "Recommendations found")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<List<Product>> getRecommendations(
            @Parameter(description = "Product ID") @PathVariable Long id,
            @RequestParam(defaultValue = "5") int limit) {
        if (!productService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(productService.getRecommendations(id, limit));
    }
}