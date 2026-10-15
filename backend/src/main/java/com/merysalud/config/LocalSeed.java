package com.merysalud.config;

import com.merysalud.entity.Usuario;
import com.merysalud.repository.UsuarioRepository;
import com.merysalud.repository.ProductoRepository;
import com.merysalud.entity.Producto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;

@Configuration
public class LocalSeed {
    @Bean
    @ConditionalOnProperty(name = "mery.seed.demo", havingValue = "true")
    ApplicationRunner seedUsers(UsuarioRepository users, ProductoRepository products, PasswordEncoder encoder,
                                @Value("${MERY_ADMIN_PASSWORD:}") String adminPassword,
                                @Value("${MERY_DRIVER_PASSWORD:}") String driverPassword) {
        if (adminPassword.length() < 8 || driverPassword.length() < 8) {
            throw new IllegalArgumentException("Configura MERY_ADMIN_PASSWORD y MERY_DRIVER_PASSWORD con al menos 8 caracteres.");
        }
        return args -> {
            seed(users, encoder, "Administrador local", "admin@demo.local", adminPassword, 1L);
            seed(users, encoder, "Repartidor local", "repartidor@demo.local", driverPassword, 2L);
            if (products.count() == 0) {
                product(products, "Paracetamol 500 mg", "Paracetamol", "Caja de 20", "12.90", 24, 1L, false);
                product(products, "Vitamina C 1000 mg", "Ácido ascórbico", "Tubo de 20", "24.90", 18, 3L, false);
                product(products, "Gasas estériles", "Material de curación", "Paquete de 10", "6.00", 12, 2L, false);
                product(products, "Producto con receta de prueba", "Solo demostración", "Caja", "10.00", 4, 1L, true);
            }
        };
    }

    private void seed(UsuarioRepository users, PasswordEncoder encoder, String name,
                      String email, String password, Long role) {
        if (users.findByEmailIgnoreCase(email).isPresent()) return;
        Usuario user = new Usuario();
        user.setNombre(name);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRolId(role);
        user.setActivo(true);
        users.save(user);
    }

    private void product(ProductoRepository products, String name, String active, String presentation,
                         String price, int stock, Long category, boolean prescription) {
        Producto p = new Producto();
        p.setNombre(name);
        p.setPrincipioActivo(active);
        p.setPresentacion(presentation);
        p.setPrecio(new BigDecimal(price));
        p.setStock(stock);
        p.setCategoriaId(category);
        p.setRequiereReceta(prescription);
        p.setActivo(true);
        p.setDestacado(true);
        products.save(p);
    }
}
