package com.ads.lojinha;

import java.util.List;
import java.util.Base64;
import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class LivroController {
    @Autowired
    private LivroRepository bd;

    @GetMapping("/api/livros")
    public List<Livro> listar() {
        return bd.findAll();
    }

    @GetMapping("/api/livros/vitrine")
    public List<Livro> carregaVitrine() {
        return bd.findByDestaqueTrueOrderByCodigoAsc();
    }

    @GetMapping("/api/livros/busca/{termo}")
    public List<Livro> buscar(@PathVariable("termo") String termo) {
        return bd.fazerBusca(termo);
    }

    @GetMapping("/api/livro/{codigo}")
    public ResponseEntity<Livro> buscarPorCodigo(@PathVariable int codigo) {
        return bd.findById(codigo)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/api/livro/{codigo}/capa")
    public ResponseEntity<?> buscarCapa(@PathVariable int codigo) {
        return bd.findById(codigo).map(livro -> {
            String capa = livro.getCapa();
            if (capa == null || capa.isBlank()) return ResponseEntity.notFound().build();
            if (capa.startsWith("http://") || capa.startsWith("https://")) {
                return ResponseEntity.status(302).location(URI.create(capa)).build();
            }
            int separador = capa.indexOf(',');
            if (separador < 0 || !capa.startsWith("data:image/")) return ResponseEntity.notFound().build();
            String metadados = capa.substring(0, separador).toLowerCase();
            MediaType tipo = metadados.startsWith("data:image/png")
                    ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;
            try {
                byte[] imagem = Base64.getDecoder().decode(capa.substring(separador + 1));
                return ResponseEntity.ok()
                    .contentType(tipo)
                    .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(30)).cachePublic())
                    .body(imagem);
            } catch (IllegalArgumentException erro) {
                return ResponseEntity.badRequest().build();
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/api/livro")
    public ResponseEntity<Livro> cadastrar(@RequestBody Livro livro) {
        livro.setCodigo(0);
        return ResponseEntity.status(HttpStatus.CREATED).body(bd.save(livro));
    }

    @PutMapping("/api/livro")
    public ResponseEntity<Livro> atualizar(@RequestBody Livro livro) {
        if (livro.getCodigo() <= 0 || !bd.existsById(livro.getCodigo())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bd.save(livro));
    }

    @DeleteMapping("/api/livro/{codigo}")
    public ResponseEntity<Void> apagar(@PathVariable int codigo) {
        if (!bd.existsById(codigo)) {
            return ResponseEntity.notFound().build();
        }
        bd.deleteById(codigo);
        return ResponseEntity.noContent().build();
    }
}
