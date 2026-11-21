package com.ads.lojinha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido,Integer> {
    java.util.List<Pedido> findByCodigoClienteOrderByCodigoPedidoDesc(int codigoCliente);

}
