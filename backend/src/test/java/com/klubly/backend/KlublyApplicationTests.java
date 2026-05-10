package com.klubly.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Usa el profile de test (H2 en memoria) para no fallar por falta de DB real
class KlublyApplicationTests {

    @Test
    void contextLoads() {
    }

}