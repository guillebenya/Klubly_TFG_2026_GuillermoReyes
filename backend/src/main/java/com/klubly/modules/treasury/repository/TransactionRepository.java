package com.klubly.modules.treasury.repository;

import com.klubly.modules.treasury.entity.Transaction;
import com.klubly.modules.treasury.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    //Listado principal ordenado por fecha (los más recientes primero)
    List<Transaction> findByDeletedAtIsNullOrderByTransactionDateDesc();

    //Historial de eliminados (Bypass del @SQLRestriction)
    @Query(value = "SELECT * FROM transactions WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC", nativeQuery = true)
    List<Transaction> findAllDeletedNative();

    // Búsqueda por ID asegurando que no esté borrado (para Updates)
    Optional<Transaction> findByIdAndDeletedAtIsNull(Long id);

    //Obtener transacciones de un usuario específico
    List<Transaction> findByUserIdAndDeletedAtIsNullOrderByTransactionDateDesc(Long userId);

    // SUMAS PARA EL BALANCE GLOBAL
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.deletedAt IS NULL")
    BigDecimal sumAmountByType(@Param("type") TransactionType type);

    //SUMAS PARA EL BALANCE DE UN USUARIO (Cuotas pagadas vs deudas si las hubiera)
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.deletedAt IS NULL")
    BigDecimal sumAmountByUserIdAndType(@Param("userId") Long userId, @Param("type") TransactionType type);

    //Saber si un usuario tiene historial económico
    boolean existsByUserIdAndDeletedAtIsNull(Long userId);
}