package com.ads.lojinha;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndCodigoNot(String email, int codigo);

    @Query(value = "select exists(select 1 from cliente where replace(replace(replace(replace(replace(replace(documento, '.', ''), '-', ''), ' ', ''), '(', ''), ')', ''), '/', '') = :documento)", nativeQuery = true)
    int existeDocumentoNormalizado(String documento);

    @Query(value = "select exists(select 1 from cliente where replace(replace(replace(replace(replace(replace(documento, '.', ''), '-', ''), ' ', ''), '(', ''), ')', ''), '/', '') = :documento and codigo <> :codigo)", nativeQuery = true)
    int existeDocumentoNormalizadoDeOutroCliente(String documento, int codigo);

    @Query(value = "select * from cliente where ativo=1 and lower(email)=lower(:email) and senha=:senha", nativeQuery = true)
    public Optional<Cliente> fazerLogin(String email, String senha);

    @Modifying
    @Transactional
    @Query(value = "update cliente set senha=:senhaTemp, ativo=0 where "+
    " email=:email", nativeQuery=true)
    int resetarSenha(String senhaTemp, String email);

    @Modifying
    @Transactional
    @Query(value = "update cliente set senha=:novaSenha, ativo=1 where "+
    " email=:email and senha=:antigaSenha", nativeQuery=true)
    int alterarSenha(String novaSenha, String antigaSenha, String email);
}
