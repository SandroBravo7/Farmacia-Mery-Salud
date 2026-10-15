package com.merysalud.controller;

import com.merysalud.entity.Usuario;
import com.merysalud.repository.UsuarioRepository;
import com.merysalud.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UsuarioRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        String email = data.getOrDefault("email", "").trim();
        String password = data.getOrDefault("password", "");
        Usuario user = users.findByEmailIgnoreCase(email).orElse(null);
        if (user == null || !Boolean.TRUE.equals(user.getActivo()) || !encoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciales incorrectas."));
        }
        return ResponseEntity.ok(session(user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        String nombre = data.getOrDefault("nombre", "").trim();
        String email = data.getOrDefault("email", "").trim().toLowerCase();
        String password = data.getOrDefault("password", "");
        if (nombre.length() < 3 || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$") || password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Revisa nombre, correo y contraseña (mínimo 8 caracteres)."));
        }
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Este correo ya se encuentra registrado."));
        }
        Usuario user = new Usuario();
        user.setNombre(nombre);
        user.setEmail(email);
        user.setTelefono(data.getOrDefault("telefono", "").trim());
        user.setPassword(encoder.encode(password));
        user.setRolId(3L);
        user.setActivo(true);
        return ResponseEntity.ok(session(users.save(user)));
    }

    private Map<String, Object> session(Usuario user) {
        return Map.of("id", user.getId(), "nombre", user.getNombre(), "email", user.getEmail(),
                "telefono", user.getTelefono() == null ? "" : user.getTelefono(),
                "rol", JwtService.role(user.getRolId()), "token", jwt.issue(user));
    }
}
