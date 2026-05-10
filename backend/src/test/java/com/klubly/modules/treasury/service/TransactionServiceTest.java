package com.klubly.modules.treasury.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.UserRepository;
import com.klubly.modules.treasury.dto.TransactionDTO;
import com.klubly.modules.treasury.dto.TreasurySummaryDTO;
import com.klubly.modules.treasury.entity.Transaction;
import com.klubly.modules.treasury.enums.TransactionType;
import com.klubly.modules.treasury.repository.TransactionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User testUser;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("socio.test");
        testUser.setFirstName("Juan");
        testUser.setLastName("Perez");

        testTransaction = new Transaction();
        testTransaction.setId(10L);
        testTransaction.setAmount(new BigDecimal("50.00"));
        testTransaction.setType(TransactionType.INCOME);
        testTransaction.setUser(testUser);
        testTransaction.setActive(true);
    }

    @AfterEach
    void tearDown() {
        // Limpiamos el contexto para evitar colisiones de seguridad
        SecurityContextHolder.clearContext();
    }

    /**
     * Helper para simular un usuario autenticado con nombre y rol
     */
    private void mockAuthenticatedUser(String username, String role) {
        Authentication auth = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(auth.getName()).thenReturn(username);
        when(auth.isAuthenticated()).thenReturn(true);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority(role)))
            .when(auth).getAuthorities();
            
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Debería calcular el balance global correctamente (Ingresos - Gastos)")
    void shouldCalculateGlobalSummaryCorrectly() {
        mockAuthenticatedUser("admin", "ROLE_ADMIN");

        when(transactionRepository.sumAmountByType(TransactionType.INCOME)).thenReturn(new BigDecimal("100.00"));
        when(transactionRepository.sumAmountByType(TransactionType.EXPENSE)).thenReturn(new BigDecimal("40.00"));

        TreasurySummaryDTO summary = transactionService.getGlobalSummary();

        assertEquals(0, new BigDecimal("100.00").compareTo(summary.getTotalIncome()));
        assertEquals(0, new BigDecimal("40.00").compareTo(summary.getTotalExpense()));
        assertEquals(0, new BigDecimal("60.00").compareTo(summary.getBalance()));
    }

    @Test
    @DisplayName("Debería lanzar error si el importe de la transacción es negativo o cero")
    void shouldThrowExceptionWhenAmountIsInvalid() {
        mockAuthenticatedUser("admin", "ROLE_ADMIN");

        TransactionDTO dto = new TransactionDTO();
        dto.setAmount(new BigDecimal("-10.00"));

        assertThrows(BadRequestException.class, () -> transactionService.createTransaction(dto));
    }

    @Test
    @DisplayName("Un socio debería poder ver sus propias transacciones")
    void memberShouldSeeOwnTransactions() {
        // Autenticamos como "socio.test" (ID 1)
        mockAuthenticatedUser("socio.test", "ROLE_MEMBER");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertDoesNotThrow(() -> transactionService.getTransactionsByMember(1L));
        verify(transactionRepository).findByUserIdAndDeletedAtIsNullOrderByTransactionDateDesc(1L);
    }

    @Test
    @DisplayName("Un socio no debería poder ver las transacciones de otro socio")
    void memberShouldNotSeeOthersTransactions() {
        // Autenticamos como "socio.test" (ID 1)
        mockAuthenticatedUser("socio.test", "ROLE_MEMBER");

        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otro.socio");

        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));

        assertThrows(UnauthorizedException.class, () -> transactionService.getTransactionsByMember(2L));
    }

    @Test
    @DisplayName("Debería realizar borrado lógico de una transacción")
    void shouldPerformSoftDeleteOnTransaction() {
        mockAuthenticatedUser("admin", "ROLE_ADMIN");

        when(transactionRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testTransaction));

        transactionService.deleteTransaction(10L);

        assertNotNull(testTransaction.getDeletedAt());
        assertFalse(testTransaction.getActive());
        verify(transactionRepository).save(testTransaction);
    }
}