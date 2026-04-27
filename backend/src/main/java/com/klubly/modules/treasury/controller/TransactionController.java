package com.klubly.modules.treasury.controller;

import com.klubly.modules.treasury.dto.TransactionDTO;
import com.klubly.modules.treasury.dto.TreasurySummaryDTO;
import com.klubly.modules.treasury.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/treasury/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // ENDPOINTS DE ADMIN

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/summary")
    public ResponseEntity<TreasurySummaryDTO> getGlobalSummary() {
        return ResponseEntity.ok(transactionService.getGlobalSummary());
    }

    @GetMapping("/history/deleted")
    public ResponseEntity<List<TransactionDTO>> getDeletedHistory() {
        return ResponseEntity.ok(transactionService.getDeletedHistory());
    }

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionDTO dto) {
        return new ResponseEntity<>(transactionService.createTransaction(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    // ENDPOINTS PARA MEMBER (MIS PAGOS)

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionDTO>> getMemberTransactions(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByMember(userId));
    }

    @GetMapping("/user/{userId}/total")
    public ResponseEntity<BigDecimal> getMemberTotalPaid(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getMemberTotalPaid(userId));
    }
}