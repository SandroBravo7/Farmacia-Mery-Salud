package com.merysalud.controller;

import com.merysalud.entity.Usuario;
import com.merysalud.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crearUsuarioAdmin(@RequestBody Usuario usuario) {
        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El email es obligatorio.");
        }
        if (usuarioRepository.findByEmail(usuario.getEmail().trim()).isPresent()) {
            return ResponseEntity.badRequest().body("El correo ya está registrado.");
        }
        if (usuario.getRolId() == null) {
            usuario.setRolId(3L); // Por defecto cliente
        }
        usuario.setActivo(true);
        Usuario guardado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(guardado);
    }
}