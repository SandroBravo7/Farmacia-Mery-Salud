package com.merysalud.service;

import com.merysalud.entity.DetallePedido;
import com.merysalud.entity.Pedido;
import com.merysalud.entity.Producto;
import com.merysalud.entity.Usuario;
import com.merysalud.repository.DetallePedidoRepository;
import com.merysalud.repository.PedidoRepository;
import com.merysalud.repository.ProductoRepository;
import com.merysalud.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@Service
public class PedidoService {
    public record ItemInput(Long id, Integer qty) {}
    public record CrearPedido(String clienteNombre, String clienteTelefono, String clienteEmail,
                              String direccionEntrega, String referencia, String tipoEntrega,
                              List<ItemInput> items) {}
    public record EstadoInput(String estado, Long repartidorId) {}
    public record ItemView(Long id, String name, BigDecimal price, Integer qty) {}
    public record PedidoView(Long id, String codigoOrden, String clienteNombre, String clienteTelefono,
                             String clienteEmail, String direccionEntrega, String referencia,
                             String tipoEntrega, BigDecimal total, String estado, String recetaEstado,
                             Long repartidorId, java.time.LocalDateTime createdAt, List<ItemView> items) {}

    private final PedidoRepository pedidos;
    private final DetallePedidoRepository detalles;
    private final ProductoRepository productos;
    private final UsuarioRepository usuarios;

    public PedidoService(PedidoRepository pedidos, DetallePedidoRepository detalles,
                         ProductoRepository productos, UsuarioRepository usuarios) {
        this.pedidos = pedidos;
        this.detalles = detalles;
        this.productos = productos;
        this.usuarios = usuarios;
    }

    @Transactional
    public PedidoView crear(CrearPedido input, Authentication auth) {
        Usuario cliente = usuario(auth);
        if (input == null || !cliente.getEmail().equalsIgnoreCase(input.clienteEmail())
                || input.clienteNombre() == null || input.clienteNombre().trim().length() < 3
                || input.clienteTelefono() == null || !input.clienteTelefono().matches("9[0-9]{8}")
                || input.items() == null || input.items().isEmpty()
                || input.tipoEntrega() == null || !List.of("DELIVERY", "RECOJO").contains(input.tipoEntrega())
                || ("DELIVERY".equals(input.tipoEntrega())
                    && (input.direccionEntrega() == null || input.direccionEntrega().trim().length() < 6))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datos de pedido inválidos.");
        }
        Map<Long, Integer> quantities = new TreeMap<>();
        for (ItemInput item : input.items()) {
            if (item == null || item.id() == null || item.qty() == null || item.qty() < 1 || item.qty() > 100) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad inválida.");
            }
            quantities.merge(item.id(), item.qty(), Integer::sum);
        }
        List<DetallePedido> lines = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (var entry : quantities.entrySet()) {
            Producto product = productos.lockById(entry.getKey()).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.BAD_REQUEST, "Producto no encontrado."));
            if (!Boolean.TRUE.equals(product.getActivo()) || product.getStock() < entry.getValue()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock insuficiente.");
            }
            if (Boolean.TRUE.equals(product.getRequiereReceta())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Los productos con receta aún no se pueden confirmar en esta versión local.");
            }
            product.setStock(product.getStock() - entry.getValue());
            DetallePedido line = new DetallePedido();
            line.setProductoId(product.getId());
            line.setProductoNombre(product.getNombre());
            line.setCantidad(entry.getValue());
            line.setPrecioUnitario(product.getPrecio());
            lines.add(line);
            subtotal = subtotal.add(product.getPrecio().multiply(BigDecimal.valueOf(entry.getValue())));
        }
        Pedido order = new Pedido();
        order.setCodigoOrden("ORD-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        order.setUsuarioId(cliente.getId());
        order.setClienteNombre(input.clienteNombre().trim());
        order.setClienteTelefono(input.clienteTelefono());
        order.setClienteEmail(cliente.getEmail());
        order.setDireccionEntrega("RECOJO".equals(input.tipoEntrega()) ? "Recojo en tienda" : input.direccionEntrega().trim());
        order.setReferencia(input.referencia() == null ? "" : input.referencia().trim());
        order.setTipoEntrega(input.tipoEntrega());
        order.setTotal(subtotal.add("DELIVERY".equals(input.tipoEntrega()) ? new BigDecimal("5.00") : BigDecimal.ZERO));
        order.setEstado("PENDIENTE");
        pedidos.saveAndFlush(order);
        for (DetallePedido line : lines) line.setPedidoId(order.getId());
        detalles.saveAll(lines);
        return view(order, lines);
    }

    @Transactional(readOnly = true)
    public List<PedidoView> todos() {
        return pedidos.findAll().stream().map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoView> mios(Authentication auth) {
        return pedidos.findByUsuarioIdOrderByCreatedAtDesc(usuario(auth).getId()).stream().map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoView> asignados(Authentication auth) {
        return pedidos.findByRepartidorIdOrderByCreatedAtDesc(usuario(auth).getId()).stream().map(this::view).toList();
    }

    @Transactional
    public PedidoView estado(Long id, EstadoInput input, Authentication auth) {
        Pedido order = pedidos.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Usuario actor = usuario(auth);
        if (input == null || input.estado() == null || input.estado().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indica el nuevo estado.");
        }
        String next = input.estado();
        boolean admin = actor.getRolId() == 1L;
        if (admin) {
            boolean allowed = switch (order.getEstado()) {
                case "PENDIENTE" -> List.of("ASIGNADO", "LISTO_RECOJO", "CANCELADO").contains(next);
                case "ASIGNADO", "EN_RUTA", "LISTO_RECOJO" -> "CANCELADO".equals(next)
                        || ("LISTO_RECOJO".equals(order.getEstado()) && "ENTREGADO".equals(next));
                default -> false;
            };
            if (!allowed) throw new ResponseStatusException(HttpStatus.CONFLICT, "Transición de estado inválida.");
            if ("ASIGNADO".equals(next)) {
                Usuario driver = usuarios.findById(input.repartidorId() == null ? -1L : input.repartidorId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Repartidor no encontrado."));
                if (driver.getRolId() != 2L || !Boolean.TRUE.equals(driver.getActivo())
                        || !"DELIVERY".equals(order.getTipoEntrega())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Repartidor o tipo de entrega inválido.");
                }
                order.setRepartidorId(driver.getId());
            }
        } else if (actor.getRolId() == 2L && actor.getId().equals(order.getRepartidorId())) {
            if (!("ASIGNADO".equals(order.getEstado()) && "EN_RUTA".equals(next))
                    && !("EN_RUTA".equals(order.getEstado()) && "ENTREGADO".equals(next))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Transición de entrega inválida.");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        if ("CANCELADO".equals(next)) {
            for (DetallePedido line : detalles.findByPedidoIdOrderById(id)) {
                Producto p = productos.lockById(line.getProductoId()).orElseThrow();
                p.setStock(p.getStock() + line.getCantidad());
            }
        }
        order.setEstado(next);
        return view(pedidos.save(order));
    }

    private Usuario usuario(Authentication auth) {
        return usuarios.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private PedidoView view(Pedido order) {
        return view(order, detalles.findByPedidoIdOrderById(order.getId()));
    }

    private PedidoView view(Pedido order, List<DetallePedido> lines) {
        return new PedidoView(order.getId(), order.getCodigoOrden(), order.getClienteNombre(),
                order.getClienteTelefono(), order.getClienteEmail(), order.getDireccionEntrega(),
                order.getReferencia(), order.getTipoEntrega(), order.getTotal(), order.getEstado(),
                order.getRecetaEstado(), order.getRepartidorId(), order.getCreatedAt(),
                lines.stream().map(line -> new ItemView(line.getProductoId(), line.getProductoNombre(),
                        line.getPrecioUnitario(), line.getCantidad())).toList());
    }
}
