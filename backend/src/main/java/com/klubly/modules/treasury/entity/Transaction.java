package com.klubly.modules.treasury.entity;

import com.klubly.common.entities.BaseEntity;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.treasury.enums.PaymentMethod;
import com.klubly.modules.treasury.enums.TransactionType;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@SQLDelete(sql = "UPDATE transactions SET deleted_at = NOW(), active = false WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Transaction extends BaseEntity {

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String concept;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // Nullable por defecto: transacciones generales
    private User user;
}