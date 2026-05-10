package com.klubly.modules.treasury.repository;

import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.UserRepository;
import com.klubly.modules.treasury.entity.Transaction;
import com.klubly.modules.treasury.enums.PaymentMethod;
import com.klubly.modules.treasury.enums.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@EntityScan(basePackages = "com.klubly")
@EnableJpaRepositories(basePackages = "com.klubly")
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Creamos un rol para el usuario de prueba
        Role role = new Role();
        role.setName("MEMBER");
        role.setActive(true);
        role.setCreatedAt(LocalDateTime.now());
        role.setUpdatedAt(LocalDateTime.now());
        role = roleRepository.save(role);

        // Creamos el usuario que será dueño de las transacciones
        testUser = new User();
        testUser.setUsername("tesorero.test");
        testUser.setEmail("tesorero@klubly.com");
        testUser.setPassword("123456");
        testUser.setFirstName("Juan");
        testUser.setLastName("Pérez");
        testUser.setRole(role);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        testUser.setActive(true);
        testUser = userRepository.save(testUser);
    }

    private Transaction createValidTransaction(BigDecimal amount, TransactionType type, User user) {
        Transaction t = new Transaction();
        t.setAmount(amount);
        t.setConcept("Pago de cuota mensual");
        t.setTransactionDate(LocalDateTime.now());
        t.setType(type);
        t.setPaymentMethod(PaymentMethod.CASH);
        t.setUser(user);
        
        // Campos de auditoría manual para el test
        t.setCreatedAt(LocalDateTime.now());
        t.setUpdatedAt(LocalDateTime.now());
        t.setActive(true);
        return t;
    }

    @Test
    @DisplayName("Debe guardar y recuperar una transacción con precisión decimal")
    void shouldSaveAndRetrieveTransactionWithPrecision() {
        // GIVEN
        BigDecimal amount = new BigDecimal("150.55");
        Transaction t = createValidTransaction(amount, TransactionType.INCOME, testUser);
        transactionRepository.save(t);

        // WHEN
        List<Transaction> transactions = transactionRepository.findAll();

        // THEN
        assertThat(transactions).hasSize(1);
        // Usamos isEqualByComparingTo para BigDecimals (ignora ceros a la derecha innecesarios)
        assertThat(transactions.get(0).getAmount()).isEqualByComparingTo("150.55");
    }

    @Test
    @DisplayName("El Soft Delete automático (@SQLRestriction) debe filtrar las borradas")
    void shouldApplySoftDeleteRestrictionAutomatically() {
        // GIVEN: Dos transacciones
        Transaction t1 = createValidTransaction(new BigDecimal("50.00"), TransactionType.INCOME, testUser);
        Transaction t2 = createValidTransaction(new BigDecimal("20.00"), TransactionType.EXPENSE, testUser);
        transactionRepository.save(t1);
        transactionRepository.save(t2);

        // Borrado lógico de t1
        t1.setDeletedAt(LocalDateTime.now());
        t1.setActive(false);
        transactionRepository.save(t1);

        // WHEN
        List<Transaction> activeTransactions = transactionRepository.findAll();

        // THEN: Solo debe aparecer t2
        assertThat(activeTransactions).hasSize(1);
        assertThat(activeTransactions.get(0).getAmount()).isEqualByComparingTo("20.00");
    }
}