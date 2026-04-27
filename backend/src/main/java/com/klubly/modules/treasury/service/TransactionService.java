package com.klubly.modules.treasury.service;

import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.UserRepository;
import com.klubly.modules.treasury.dto.TransactionDTO;
import com.klubly.modules.treasury.dto.TreasurySummaryDTO;
import com.klubly.modules.treasury.entity.Transaction;
import com.klubly.modules.treasury.enums.TransactionType;
import com.klubly.modules.treasury.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private static final String TRANS_NOT_FOUND = "Transacción no encontrada";

    // SECCIÓN ADMIN
    @Transactional(readOnly = true)
    public List<TransactionDTO> getAllTransactions() {
        checkAdminRole();
        return transactionRepository.findByDeletedAtIsNullOrderByTransactionDateDesc()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getDeletedHistory() {
        checkAdminRole();
        return transactionRepository.findAllDeletedNative()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TreasurySummaryDTO getGlobalSummary() {
        checkAdminRole();
        BigDecimal income = transactionRepository.sumAmountByType(TransactionType.INCOME);
        BigDecimal expense = transactionRepository.sumAmountByType(TransactionType.EXPENSE);

        BigDecimal totalIncome = (income != null) ? income : BigDecimal.ZERO;
        BigDecimal totalExpense = (expense != null) ? expense : BigDecimal.ZERO;

        return new TreasurySummaryDTO(totalIncome, totalExpense, totalIncome.subtract(totalExpense));
    }

    @Transactional
    public TransactionDTO createTransaction(TransactionDTO dto) {
        checkAdminRole(); // Si el Staff no tiene sección, solo el Admin crea
        
        if (dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El importe debe ser positivo");
        }

        Transaction transaction = new Transaction();
        transaction.setAmount(dto.getAmount());
        transaction.setConcept(dto.getConcept());
        transaction.setTransactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDateTime.now());
        transaction.setType(dto.getType());
        transaction.setPaymentMethod(dto.getPaymentMethod());
        transaction.setActive(true);

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("Socio no encontrado"));
            transaction.setUser(user);
        }

        return convertToDTO(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(Long id) {
        checkAdminRole();
        Transaction transaction = transactionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(TRANS_NOT_FOUND));

        transaction.setDeletedAt(LocalDateTime.now());
        transaction.setActive(false);
        transactionRepository.save(transaction);
    }

    // SECCIÓN MEMBER (MIS PAGOS)

    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsByMember(Long userId) {
        checkAdminOrOwner(userId); // Seguridad: O eres Admin o eres tú mismo
        return transactionRepository.findByUserIdAndDeletedAtIsNullOrderByTransactionDateDesc(userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal getMemberTotalPaid(Long userId) {
        checkAdminOrOwner(userId);
        // Sumamos solo sus pagos (EXPENSE desde el punto de vista del flujo)
        BigDecimal total = transactionRepository.sumAmountByUserIdAndType(userId, TransactionType.EXPENSE);
        return (total != null) ? total : BigDecimal.ZERO;
    }

    // MÉTODOS AUXILIARES

    private void checkAdminRole() {
        if (!getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Acceso denegado: Solo administradores");
        }
    }

    private void checkAdminOrOwner(Long userId) {
        String role = getRole();
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Buscamos el username del ID que se intenta consultar
        User userToConsult = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isAdmin = role.equals("ROLE_ADMIN");
        boolean isOwner = currentUsername.equals(userToConsult.getUsername());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Acceso denegado: No puedes ver los pagos de otros socios");
        }
    }

    private String getRole() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .iterator().next().getAuthority();
    }

    private TransactionDTO convertToDTO(Transaction t) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(t.getId());
        dto.setAmount(t.getAmount());
        dto.setConcept(t.getConcept());
        dto.setTransactionDate(t.getTransactionDate());
        dto.setType(t.getType());
        dto.setPaymentMethod(t.getPaymentMethod());
        dto.setActive(t.getActive());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setDeletedAt(t.getDeletedAt());
        if (t.getUser() != null) {
            dto.setUserId(t.getUser().getId());
            dto.setUserFullName(t.getUser().getFirstName() + " " + t.getUser().getLastName());
        }
        return dto;
    }
}