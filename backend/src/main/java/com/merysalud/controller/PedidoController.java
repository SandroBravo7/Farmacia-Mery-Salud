package com.merysalud.controller;

import com.merysalud.service.PedidoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PedidoService.PedidoView> todos() {
        return service.todos();
    }

    @GetMapping("/mios")
    @PreAuthorize("hasRole('CLIENTE')")
    public List<PedidoService.PedidoView> mios(Authentication auth) {
        return service.mios(auth);
    }

    @GetMapping("/asignados")
    @PreAuthorize("hasRole('REPARTIDOR')")
    public List<PedidoService.PedidoView> asignados(Authentication auth) {
        return service.asignados(auth);
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public PedidoService.PedidoView crear(@RequestBody PedidoService.CrearPedido input, Authentication auth) {
        return service.crear(input, auth);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPARTIDOR')")
    public PedidoService.PedidoView estado(@PathVariable Long id,
                                           @RequestBody PedidoService.EstadoInput input,
                                           Authentication auth) {
        return service.estado(id, input, auth);
    }
}
