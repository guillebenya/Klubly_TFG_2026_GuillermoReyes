package com.klubly.modules.treasury.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.klubly.modules.treasury.enums.PaymentMethod;
import com.klubly.modules.treasury.enums.TransactionType;

import lombok.Data;

@Data
public class TransactionDTO {
    private Long id;
    private BigDecimal amount;
    private String concept;
    private LocalDateTime transactionDate;
    private TransactionType type;
    private PaymentMethod paymentMethod;
    
    // Info del usuario vinculado
    private Long userId;
    private String userFullName;

    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
}
