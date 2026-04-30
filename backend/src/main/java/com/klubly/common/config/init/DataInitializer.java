package com.klubly.common.config.init;

import com.klubly.common.config.SecurityConfig;
import com.klubly.modules.activities.entity.Activity;
import com.klubly.modules.activities.entity.Registration;
import com.klubly.modules.activities.repository.ActivityRepository;
import com.klubly.modules.activities.repository.RegistrationRepository;
import com.klubly.modules.identity.controller.AffiliationController;
import com.klubly.modules.identity.controller.AuthController;
import com.klubly.modules.identity.entity.Affiliation;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.AffiliationRepository;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.TeamRepository;
import com.klubly.modules.identity.repository.UserRepository;
import com.klubly.modules.identity.service.AffiliationService;
import com.klubly.modules.inventory.entity.Category;
import com.klubly.modules.inventory.entity.Item;
import com.klubly.modules.inventory.repository.CategoryRepository;
import com.klubly.modules.inventory.repository.ItemRepository;
import com.klubly.modules.treasury.entity.Transaction;
import com.klubly.modules.treasury.enums.PaymentMethod;
import com.klubly.modules.treasury.enums.TransactionType;
import com.klubly.modules.treasury.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner{

    private final SecurityConfig securityConfig;
    private final AuthenticationManager authenticationManager;
    private final AuthController authController;
    private final AffiliationService affiliationService;
    private final AffiliationController affiliationController;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TeamRepository teamRepository;
    private final AffiliationRepository affiliationRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final TransactionRepository transactionRepository;
    private final ActivityRepository activityRepository;
    private final RegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String...args){
        //Crear roles si no existen
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("STAFF");
        createRoleIfNotFound("MEMBER");
        createRoleIfNotFound("ROL INFORMATIVO");

        //Crear un usuario administrador por defecto
        if (!userRepository.existsByUsernameAndDeletedAtIsNull("admin")) {
            Role adminRole = roleRepository.findByNameAndDeletedAtIsNull("ADMIN").orElseThrow(() -> new RuntimeException("Error: El rol ADMIN no existe"));
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@klubly.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Administrador");
            admin.setLastName("Sistema");
            admin.setPhone("678901234");
            admin.setClubPosition("Director General");
            admin.setRole(adminRole);
            admin.setActive(true);

            userRepository.save(admin);
            log.info("Usuario administrador creado con éxito por el DataSeed.");
        }

        //Crear un usuario staff por defecto
        if (!userRepository.existsByUsernameAndDeletedAtIsNull("staff")) {
            Role staffRole = roleRepository.findByNameAndDeletedAtIsNull("STAFF").orElseThrow(() -> new RuntimeException("Error: El rol STAFF no existe"));
            User staff = new User();
            staff.setUsername("staff");
            staff.setEmail("staff@klubly.com");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setFirstName("Staff");
            staff.setLastName("Técnico");
            staff.setPhone("678901235");
            staff.setRole(staffRole);
            staff.setActive(true);

            userRepository.save(staff);
            log.info("Usuario staff creado con éxito por el DataSeed.");
        }

        //Crear un usuario member por defecto
        if (!userRepository.existsByUsernameAndDeletedAtIsNull("member")) {
            Role memberRole = roleRepository.findByNameAndDeletedAtIsNull("MEMBER").orElseThrow(() -> new RuntimeException("Error: El rol MEMBER no existe"));
            User member = new User();
            member.setUsername("member");
            member.setEmail("member@klubly.com");
            member.setPassword(passwordEncoder.encode("member123"));
            member.setFirstName("Member");
            member.setLastName("Socio");
            member.setPhone("678901236");
            member.setAvatarURL("https://i.pinimg.com/736x/7f/dc/ff/7fdcff5a6fda8eaf7656f3c5e9084d7f.jpg");
            member.setRole(memberRole);
            member.setActive(true);

            userRepository.save(member);
            log.info("Usuario member creado con éxito por el DataSeed.");
        }

        //Crear un equipo de prueba
        Team testTeam = new Team();
        if (!teamRepository.existsByNameAndDeletedAtIsNull("Equipo de Prueba")) {
        testTeam.setName("Equipo de Prueba");
        testTeam.setDescription("Este es un equipo creado por el DataSeed para pruebas.");
        testTeam = teamRepository.save(testTeam);
        log.info("Equipo de prueba creado con éxito por el DataSeed.");
        } else{
            testTeam = teamRepository.findByNameAndDeletedAtIsNull("Equipo de Prueba").get();
        }

         //Crear una afiliación de prueba para un STAFF
         User staffUser = userRepository.findByUsernameAndDeletedAtIsNull("staff")
            .orElseThrow(() -> new RuntimeException("Error: Usuario staff no encontrado"));

        if (!affiliationRepository.existsByUserIdAndTeamIdAndDeletedAtIsNull(staffUser.getId(), testTeam.getId())) {
            Affiliation testAffiliation = new Affiliation();
            testAffiliation.setUser(staffUser);
            testAffiliation.setTeam(testTeam);
            testAffiliation.setTeamPosition("SEGUNDO ENTRENADOR"); // Campo obligatorio que definimos
            testAffiliation.setActive(true);

            affiliationRepository.save(testAffiliation);
            log.info("Afiliación de prueba ('member' -> 'Equipo de Prueba') creada con éxito.");
        }

         //Crear una afiliación de prueba para un MEMBER
         User memberUser = userRepository.findByUsernameAndDeletedAtIsNull("member")
            .orElseThrow(() -> new RuntimeException("Error: Usuario member no encontrado"));

        if (!affiliationRepository.existsByUserIdAndTeamIdAndDeletedAtIsNull(memberUser.getId(), testTeam.getId())) {
            Affiliation testAffiliation = new Affiliation();
            testAffiliation.setUser(memberUser);
            testAffiliation.setTeam(testTeam);
            testAffiliation.setTeamPosition("JUGADOR"); // Campo obligatorio que definimos
            testAffiliation.setActive(true);

            affiliationRepository.save(testAffiliation);
            log.info("Afiliación de prueba ('member' -> 'Equipo de Prueba') creada con éxito.");
        }

        //Crear una categoría de inventario de prueba
        if (!categoryRepository.existsByNameAndDeletedAtIsNull("Categoría de prueba")){
            Category category = new Category();
            category.setName("Categoría de prueba");
            category.setDescription("Esto es una categoría de prueba");
            category.setActive(true);
            categoryRepository.save(category);
            log.info("Categoría: 'Categoría de prueba' creada con éxito por el DataSeed.");
        }

        //Crear un item de prueba
        Category testCategory = categoryRepository.findByNameAndDeletedAtIsNull("Categoría de prueba")
            .orElseThrow(() -> new RuntimeException("Error: Categoría 'Categoría de prueba' no encontrado"));

        if(!itemRepository.existsByNameAndDeletedAtIsNull("Item de prueba")){
            Item item = new Item();
            item.setName("Item de prueba");
            item.setDescription("Esto es un item de prueba");
            item.setStockQuantity(40);
            item.setMinStock(37);
            item.setLocation("Estantería 4 - Almacén B");
            item.setCategory(testCategory);
            item.setActive(true);
            itemRepository.save(item);
            log.info("Item: 'Item de prueba' creada con éxito por el DataSeed.");
        }

        //Crear un transaction INCOME de prueba
        User memberUserForTransaction = userRepository.findByUsernameAndDeletedAtIsNull("member")
            .orElseThrow(() -> new RuntimeException("Error: Usuario member no encontrado"));
        Transaction transaction1 = new Transaction();
        transaction1.setAmount(new BigDecimal("20.00"));
        transaction1.setConcept("Transacción de prueba 1");
        transaction1.setTransactionDate(LocalDateTime.now());
        transaction1.setType(TransactionType.INCOME);
        transaction1.setPaymentMethod(PaymentMethod.CARD);
        transaction1.setActive(true);
        transaction1.setUser(memberUserForTransaction);
        transactionRepository.save(transaction1);
        log.info("Transacción de prueba 1 creada con éxito por el DataSeed");
        
        //Crear un transaction EXPENSE de prueba
        Transaction transaction2 = new Transaction();
        transaction2.setAmount(new BigDecimal("45.32"));
        transaction2.setConcept("Transacción de prueba 2");
        transaction2.setTransactionDate(LocalDateTime.now());
        transaction2.setType(TransactionType.EXPENSE);
        transaction2.setPaymentMethod(PaymentMethod.CASH);
        transaction2.setActive(true);
        transaction2.setUser(memberUserForTransaction);
        transactionRepository.save(transaction2);
        log.info("Transacción de prueba 2 creada con éxito por el DataSeed");

        //Crear Actividades y registros
        if (activityRepository.count() == 0) {
            // Una actividad GLOBAL (sin equipos)
            Activity globalAct = new Activity();
            globalAct.setName("Asamblea General del Club");
            globalAct.setDescription("Reunión anual para todos los socios en el salón de actos.");
            globalAct.setStartDate(LocalDateTime.now().plusDays(10).withHour(18).withMinute(0));
            globalAct.setEndDate(LocalDateTime.now().plusDays(10).withHour(20).withMinute(0));
            globalAct.setCapacity(100);
            globalAct.setLocation("Sede Social - Salón Principal");
            globalAct.setActive(true);
            activityRepository.save(globalAct);

            // Una actividad para un equipo específico (usando un equipo ya creado)
            Team teamForActivity = teamRepository.findByNameAndDeletedAtIsNull("Equipo de Prueba")
                .orElse(null);

            if (teamForActivity != null) {
                Activity teamAct = new Activity();
                teamAct.setName("Entrenamiento Táctico Avanzado");
                teamAct.setDescription("Sesión a puerta cerrada para preparar el derbi.");
                teamAct.setStartDate(LocalDateTime.now().plusDays(2).withHour(19).withMinute(30));
                teamAct.setEndDate(LocalDateTime.now().plusDays(2).withHour(21).withMinute(0));
                teamAct.setCapacity(20);
                teamAct.setLocation("Campo de Entrenamiento 1");
                teamAct.setActive(true);
                teamAct.getTeams().add(teamForActivity);
                activityRepository.save(teamAct);

                // Una inscripción de prueba para esta actividad
                User miembroUser = userRepository.findByUsernameAndDeletedAtIsNull("member")
                    .orElse(null);
                    
                if (miembroUser != null) {
                    Registration reg = new Registration();
                    reg.setActivity(teamAct);
                    reg.setUser(miembroUser);
                    reg.setRegistrationDate(LocalDateTime.now());
                    reg.setActive(true);
                    registrationRepository.save(reg);
                }
            }

            // Una actividad pasada (para probar que el front no deja apuntarse)
            Activity pastAct = new Activity();
            pastAct.setName("Torneo de Navidad");
            pastAct.setDescription("Evento finalizado.");
            pastAct.setStartDate(LocalDateTime.now().minusDays(30));
            pastAct.setEndDate(LocalDateTime.now().minusDays(30).plusHours(4));
            pastAct.setCapacity(50);
            pastAct.setLocation("Pabellón Municipal");
            pastAct.setActive(true);
            activityRepository.save(pastAct);

            // 5. Actividad con CUPO LLENO (Capacity: 1, Registrations: 1)
            Activity fullAct = new Activity();
            fullAct.setName("Taller de Nutrición Deportiva");
            fullAct.setDescription("Charla exclusiva sobre suplementación. Plazas muy limitadas.");
            fullAct.setStartDate(LocalDateTime.now().plusDays(5).withHour(17).withMinute(0));
            fullAct.setEndDate(LocalDateTime.now().plusDays(5).withHour(18).withMinute(30));
            fullAct.setCapacity(1); // Solo una plaza
            fullAct.setLocation("Sala de Juntas");
            fullAct.setActive(true);
            activityRepository.save(fullAct);

            // Buscamos un usuario (el admin, por ejemplo) para que ocupe la única plaza
            User adminUser = userRepository.findByUsernameAndDeletedAtIsNull("admin")
                .orElse(null);

            if (adminUser != null) {
                Registration fullReg = new Registration();
                fullReg.setActivity(fullAct);
                fullReg.setUser(adminUser);
                fullReg.setRegistrationDate(LocalDateTime.now());
                fullReg.setActive(true);
                registrationRepository.save(fullReg);
            }

            log.info("Seeding de actividades e inscripciones completado.");
        }
    }

    //Método auxiliar para crear un role si no existe
    private void createRoleIfNotFound(String roleName) {
        if (!roleRepository.findByNameAndDeletedAtIsNull(roleName).isPresent()) {
            Role role = new Role();
            role.setName(roleName);
            role.setDescription("Rol de: " + roleName);
            role.setActive(true);
            roleRepository.save(role);
            log.info("Rol '" + roleName + "' creado con éxito por el DataSeed.");
        }
    }
}
