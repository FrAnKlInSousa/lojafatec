package com.ads.lojinha;

import java.sql.Date;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin(origins = "*")
public class PedidoController {
    @Autowired private PedidoRepository bd;
    @Autowired private ClienteRepository clientes;
    @Autowired private LivroRepository livros;
    @Autowired private ObjectMapper objectMapper;

    @GetMapping("/api/pedidos/cliente/{codigoCliente}")
    public List<Pedido> listarDoCliente(@PathVariable int codigoCliente) {
        return bd.findByCodigoClienteOrderByCodigoPedidoDesc(codigoCliente);
    }

    @PostMapping("/api/pedidos")
    public ResponseEntity<?> criar(@RequestBody PedidoCriacao dados) {
        if (!clientes.existsById(dados.getCodigoCliente())) {
            return ResponseEntity.notFound().build();
        }
        if (dados.getEntrega() == null || dados.getEntrega().isBlank()
                || dados.getItens() == null || dados.getItens().isEmpty()) {
            return ResponseEntity.badRequest().body("Endereço e itens são obrigatórios.");
        }

        double total = 0;
        List<Map<String, Object>> itensSalvos = new ArrayList<>();
        for (PedidoCriacao.ItemPedidoCriacao item : dados.getItens()) {
            if (item.getQuantidade() <= 0) return ResponseEntity.badRequest().body("Quantidade inválida.");
            var livroOpt = livros.findById(item.getCodigoLivro());
            if (livroOpt.isEmpty()) return ResponseEntity.badRequest().body("Livro não encontrado.");

            Livro livro = livroOpt.get();
            double unitario = livro.getPrecoPromocional() > 0
                    ? livro.getPrecoPromocional() : livro.getPreco();
            double subtotal = unitario * item.getQuantidade();
            total += subtotal;
            Map<String, Object> itemSalvo = new LinkedHashMap<>();
            itemSalvo.put("codigoLivro", livro.getCodigo());
            itemSalvo.put("titulo", livro.getTitulo());
            itemSalvo.put("quantidade", item.getQuantidade());
            itemSalvo.put("valorUnitario", unitario);
            itemSalvo.put("subtotal", subtotal);
            itensSalvos.add(itemSalvo);
        }

        Pedido pedido = new Pedido();
        pedido.setCodigoCliente(dados.getCodigoCliente());
        pedido.setEntrega(dados.getEntrega());
        pedido.setValorTotal(total);
        pedido.setDataPedido(new Date(System.currentTimeMillis()));
        pedido.setStatus("A CAMINHO");
        try {
            pedido.setItens(objectMapper.writeValueAsString(itensSalvos));
        } catch (JacksonException erro) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(bd.save(pedido));
    }

    @PatchMapping("/api/pedidos/{codigoPedido}/entregue")
    public ResponseEntity<Pedido> marcarEntregue(
            @PathVariable int codigoPedido,
            @RequestParam int codigoCliente) {
        return bd.findById(codigoPedido).map(pedido -> {
            if (pedido.getCodigoCliente() != codigoCliente || !"A CAMINHO".equals(pedido.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).<Pedido>build();
            }
            pedido.setStatus("ENTREGUE");
            return ResponseEntity.ok(bd.save(pedido));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
