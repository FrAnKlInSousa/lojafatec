package com.ads.lojinha;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Locale;

@RestController
@CrossOrigin(origins = "*")
public class ClienteController {
    @Autowired
    ClienteRepository bd;

    
    @GetMapping("/api/cliente/{codigo}")
    public Cliente retorna(@PathVariable("codigo") int id){
        if(bd.existsById(id)){
            return bd.findById(id).get();
        } else {
            return new Cliente();
        }
    }

    @PostMapping("/api/cliente")
    public ResponseEntity<String> gravar(@RequestBody Cliente obj){
        String email = normalizar(obj.getEmail()).toLowerCase(Locale.ROOT);
        String documento = somenteDigitos(obj.getDocumento());
        String telefone = somenteDigitos(obj.getTelefone());
        String erro = validarDados(obj.getNome(), email, documento, telefone);
        if (erro != null) return ResponseEntity.badRequest().body(erro);
        if (bd.existsByEmailIgnoreCase(email)) return ResponseEntity.status(HttpStatus.CONFLICT).body("EMAIL_DUPLICADO");
        if (bd.existeDocumentoNormalizado(documento) > 0) return ResponseEntity.status(HttpStatus.CONFLICT).body("CPF_DUPLICADO");
        obj.setEmail(email);
        obj.setDocumento(documento);
        obj.setTelefone(telefone);
        obj.setAtivo(1);
        obj.setTipo("human");
        bd.save(obj);
        return ResponseEntity.status(HttpStatus.CREATED).body("Cliente gravado com sucesso! "+ obj.getCodigo());
    }
   
    @PutMapping("/api/cliente")
    public String alterar(@RequestBody Cliente obj){
        if(bd.existsById(obj.getCodigo())){
            bd.save(obj);
            return "Cliente alterado com sucesso! "+ obj.getCodigo();
        } else {
            return "Cliente não encontrado!";
        }
    }

    @DeleteMapping("/api/cliente/{codigo}")
    public String apagar(@PathVariable("codigo") int id){
        bd.deleteById(id);
        return "Cliente removido com sucesso!";
    }

    @PostMapping("/api/cliente/login")
    public ResponseEntity<Cliente> fazerLogin(@RequestBody Cliente obj){
        Optional<Cliente> objCliente = bd.fazerLogin(obj.getEmail(), obj.getSenha());
        if(objCliente.isPresent()){
            return ResponseEntity.ok(objCliente.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PutMapping("/api/cliente/{codigo}/perfil")
    public ResponseEntity<String> atualizarPerfil(@PathVariable int codigo, @RequestBody Cliente dados) {
        Optional<Cliente> existente = bd.findById(codigo);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        String email = normalizar(dados.getEmail()).toLowerCase(Locale.ROOT);
        String documento = somenteDigitos(dados.getDocumento());
        String telefone = somenteDigitos(dados.getTelefone());
        String erro = validarDados(dados.getNome(), email, documento, telefone);
        if (erro != null) return ResponseEntity.badRequest().body(erro);
        if (bd.existsByEmailIgnoreCaseAndCodigoNot(email, codigo)) return ResponseEntity.status(HttpStatus.CONFLICT).body("EMAIL_DUPLICADO");
        if (bd.existeDocumentoNormalizadoDeOutroCliente(documento, codigo) > 0) return ResponseEntity.status(HttpStatus.CONFLICT).body("CPF_DUPLICADO");

        Cliente cliente = existente.get();
        cliente.setNome(dados.getNome());
        cliente.setEmail(email);
        cliente.setDocumento(documento);
        cliente.setTelefone(telefone);
        cliente.setLogradouro(dados.getLogradouro());
        bd.save(cliente);
        return ResponseEntity.noContent().build();
    }

    private static String validarDados(String nome, String email, String documento, String telefone) {
        if (nome == null || nome.isBlank()) return "NOME_OBRIGATORIO";
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$")) return "EMAIL_INVALIDO";
        if (!cpfValido(documento)) return "CPF_INVALIDO";
        if (!telefone.matches("(?:[1-9]{2}9\\d{8}|[1-9]{2}[2-5]\\d{7})")) return "TELEFONE_INVALIDO";
        return null;
    }

    private static String normalizar(String texto) {
        return texto == null ? "" : texto.trim();
    }

    private static String somenteDigitos(String texto) {
        return texto == null ? "" : texto.replaceAll("\\D", "");
    }

    private static boolean cpfValido(String cpf) {
        if (cpf.length() != 11 || cpf.matches("(\\d)\\1{10}")) return false;
        for (int digito = 9; digito < 11; digito++) {
            int soma = 0;
            for (int i = 0; i < digito; i++) soma += Character.digit(cpf.charAt(i), 10) * (digito + 1 - i);
            int resto = (soma * 10) % 11;
            int calculado = resto == 10 ? 0 : resto;
            if (calculado != Character.digit(cpf.charAt(digito), 10)) return false;
        }
        return true;
    }

    @PutMapping("/api/cliente/{codigo}/senha")
    public ResponseEntity<Void> alterarSenha(@PathVariable int codigo, @RequestBody AlteracaoSenha dados) {
        Optional<Cliente> existente = bd.findById(codigo);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        Cliente cliente = existente.get();
        if (dados.getSenhaAtual() == null || !dados.getSenhaAtual().equals(cliente.getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (dados.getNovaSenha() == null || dados.getNovaSenha().length() < 6) {
            return ResponseEntity.badRequest().build();
        }
        cliente.setSenha(dados.getNovaSenha());
        bd.save(cliente);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/cliente/resetarSenha")
    public String resetarSenha(@RequestBody Cliente obj){
        String senhaTemp = "Senha1234";
        bd.resetarSenha(senhaTemp, obj.getEmail());
        //TODO ENVIAR EMAIL
        return "Sua senha foi reiniciada, verifique o seu email!";
    }

    @PatchMapping("/api/cliente/alterarSenha")
    public String alterarSenha(@RequestBody Cliente obj){
        bd.alterarSenha(obj.getSenha(), obj.getDocumento(), obj.getEmail());
        //TODO ENVIAR EMAIL
        return "Sua senha foi alterada, verifique o seu email!";
    }


}
