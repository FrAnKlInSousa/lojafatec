package com.ads.lojinha;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Integer> {
    List<Livro> findByDestaqueTrueOrderByCodigoAsc();

    @Query("select l from Livro l where " +
        "lower(l.titulo) like lower(concat('%', :termo, '%')) or " +
        "lower(coalesce(l.autor, '')) like lower(concat('%', :termo, '%')) or " +
        "lower(coalesce(l.descricao, '')) like lower(concat('%', :termo, '%'))")
    List<Livro> fazerBusca(@Param("termo") String termo);
}
