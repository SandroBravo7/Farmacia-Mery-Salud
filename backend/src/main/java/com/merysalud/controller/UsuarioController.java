package com.merysalud.controller;

import com.merysalud.entity.Usuario;
import com.merysalud.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {
    private final UsuarioRepository users;
    private final PasswordEncoder encoder;

    public UsuarioController(UsuarioRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @GetMapping
    public List<Map<String, Object>> listarTodos() {
        return users.findAll().stream().map(this::safe).toList();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Usuario input, Authentication auth) {
        String email = input.getEmail() == null ? "" : input.getEmail().trim().toLowerCase();
        if (input.getNombre() == null || input.getNombre().trim().length() < 3
                || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
                || input.getRolId() == null || input.getRolId() < 1 || input.getRolId() > 3) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nombre, correo o rol inválido."));
        }
        Usuario user = input.getId() == null ? new Usuario() : users.findById(input.getId()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (users.findByEmailIgnoreCase(email).filter(other -> !other.getId().equals(user.getId())).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo ya existe."));
        }
        if (auth.getName().equalsIgnoreCase(user.getEmail())
                && (!Boolean.TRUE.equals(input.getActivo()) || input.getRolId() != 1L)) {
            return ResponseEntity.badRequest().body(Map.of("message", "No puedes desactivar ni quitar tu propio rol."));
        }
        if (user.getId() == null && (input.getPassword() == null || input.getPassword().length() < 8)) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña debe tener al menos 8 caracteres."));
        }
        user.setNombre(input.getNombre().trim());
        user.setEmail(email);
        user.setTelefono(input.getTelefono());
        user.setRolId(input.getRolId());
        user.setActivo(input.getActivo() == null || input.getActivo());
        if (input.getPassword() != null && !input.getPassword().isBlank()) {
            if (input.getPassword().length() < 8) return ResponseEntity.badRequest().body(Map.of("message", "Contraseña muy corta."));
            user.setPassword(encoder.encode(input.getPassword()));
        }
        return ResponseEntity.ok(safe(users.save(user)));
    }

    private Map<String, Object> safe(Usuario u) {
        return Map.of("id", u.getId(), "nombre", u.getNombre(), "email", u.getEmail(),
                "telefono", u.getTelefono() == null ? "" : u.getTelefono(),
                "rolId", u.getRolId(), "activo", u.getActivo());
    }
}
