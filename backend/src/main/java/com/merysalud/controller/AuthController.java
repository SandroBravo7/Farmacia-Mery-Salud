package com.merysalud.controller;

import com.merysalud.entity.Usuario;
import com.merysalud.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        String password = credenciales.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email y contraseña requeridos.");
        }

        Optional<Usuario> userOpt = usuarioRepository.findByEmail(email.trim());

        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Credenciales incorrectas.");
        }

        Usuario user = userOpt.get();
        if (!user.getActivo()) {
            return ResponseEntity.status(403).body("Usuario inactivo.");
        }

        String rolNombre = switch (user.getRolId().intValue()) {
            case 1 -> "ADMIN";
            case 2 -> "REPARTIDOR";
            default -> "CLIENTE";
        };

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("nombre", user.getNombre());
        response.put("email", user.getEmail());
        response.put("rol", rolNombre);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        if (usuario.getEmail() == null || usuario.getPassword() == null || usuario.getNombre() == null) {
            return ResponseEntity.badRequest().body("Completa todos los campos obligatorios.");
        }
        if (usuarioRepository.findByEmail(usuario.getEmail().trim()).isPresent()) {
            return ResponseEntity.badRequest().body("Este correo electrónico ya se encuentra registrado.");
        }

        usuario.setRolId(3L); // Rol CLIENTE automático en auto-registro
        usuario.setActivo(true);
        Usuario guardado = usuarioRepository.save(usuario);

        Map<String, Object> response = new HashMap<>();
        response.put("id", guardado.getId());
        response.put("nombre", guardado.getNombre());
        response.put("email", guardado.getEmail());
        response.put("rol", "CLIENTE");

        return ResponseEntity.ok(response);
    }
}