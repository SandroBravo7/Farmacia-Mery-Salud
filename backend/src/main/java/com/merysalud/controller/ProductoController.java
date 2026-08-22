package com.merysalud.controller;

import com.merysalud.entity.Producto;
import com.merysalud.repository.ProductoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepository.findByActivoTrue();
    }

    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre es obligatorio");
        }
        if (producto.getPrecio() == null || producto.getPrecio().doubleValue() <= 0) {
            return ResponseEntity.badRequest().body("El precio debe ser mayor a 0");
        }
        if (producto.getStock() == null || producto.getStock() < 0) {
            return ResponseEntity.badRequest().body("El stock no puede ser negativo");
        }
        if (producto.getCategoriaId() == null) {
            producto.setCategoriaId(1L);
        }
        producto.setActivo(true);
        Producto guardado = productoRepository.save(producto);
        return ResponseEntity.ok(guardado);
    }
}