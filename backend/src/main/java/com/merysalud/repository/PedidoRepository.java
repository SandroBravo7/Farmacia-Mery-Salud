package com.merysalud.repository;

import com.merysalud.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
    List<Pedido> findByRepartidorIdOrderByCreatedAtDesc(Long repartidorId);
}
