package com.klubly.modules.treasury.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.klubly.modules.treasury.dto.TransactionDTO;
import com.klubly.modules.treasury.dto.TreasurySummaryDTO;
import com.klubly.modules.treasury.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private TransactionController transactionController;

    private TransactionDTO testTransactionDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(transactionController).build();

        testTransactionDTO = new TransactionDTO();
        testTransactionDTO.setId(1L);
        testTransactionDTO.setAmount(new BigDecimal("50.00"));
        testTransactionDTO.setConcept("Cuota mensual Mayo");
        testTransactionDTO.setUserId(10L);
    }

    @Test
    @DisplayName("GET /api/treasury/transactions - Listar todas")
    void getAllTransactionsShouldReturnList() throws Exception {
        List<TransactionDTO> list = Arrays.asList(testTransactionDTO);
        when(transactionService.getAllTransactions()).thenReturn(list);

        mockMvc.perform(get("/api/treasury/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].amount").value(50.00))
                .andExpect(jsonPath("$[0].concept").value("Cuota mensual Mayo"));
    }

    @Test
    @DisplayName("GET /api/treasury/transactions/summary - Obtener resumen global")
    void getGlobalSummaryShouldReturnDTO() throws Exception {

        TreasurySummaryDTO summary = new TreasurySummaryDTO(
                new BigDecimal("1500.00"), 
                new BigDecimal("500.00"), 
                new BigDecimal("1000.00")
        );
        
        when(transactionService.getGlobalSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/treasury/transactions/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").value(1500.00))
                .andExpect(jsonPath("$.totalExpense").value(500.00))
                .andExpect(jsonPath("$.balance").value(1000.00));
    }

    @Test
    @DisplayName("POST /api/treasury/transactions - Crear transacción")
    void createTransactionShouldReturnCreated() throws Exception {
        when(transactionService.createTransaction(any(TransactionDTO.class))).thenReturn(testTransactionDTO);

        mockMvc.perform(post("/api/treasury/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTransactionDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.concept").value("Cuota mensual Mayo"));
    }

    @Test
    @DisplayName("GET /api/treasury/transactions/user/{userId}/total - Total pagado por socio")
    void getMemberTotalPaidShouldReturnAmount() throws Exception {
        BigDecimal total = new BigDecimal("150.00");
        when(transactionService.getMemberTotalPaid(10L)).thenReturn(total);

        mockMvc.perform(get("/api/treasury/transactions/user/10/total"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(150.00)); 
    }

    @Test
    @DisplayName("DELETE /api/treasury/transactions/{id} - Borrado lógico")
    void deleteTransactionShouldReturnNoContent() throws Exception {
        doNothing().when(transactionService).deleteTransaction(1L);

        mockMvc.perform(delete("/api/treasury/transactions/1"))
                .andExpect(status().isNoContent());
    }
}