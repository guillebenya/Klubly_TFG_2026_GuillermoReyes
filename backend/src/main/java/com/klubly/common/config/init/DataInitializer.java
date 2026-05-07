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
        
        //ROLES

        //Crear roles si no existen
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("STAFF");
        createRoleIfNotFound("MEMBER");
        createRoleIfNotFound("ROL INFORMATIVO");

        //USUARIOS

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

        // Usuario pendiente de aprobación
        if (!userRepository.existsByUsernameAndDeletedAtIsNull("aspirante")) {
            Role memberRole = roleRepository.findByNameAndDeletedAtIsNull("MEMBER").get();
            User pendingUser = new User();
            pendingUser.setUsername("aspirante");
            pendingUser.setEmail("aspirante@test.com");
            pendingUser.setPassword(passwordEncoder.encode("aspirante123"));
            pendingUser.setFirstName("Juan");
            pendingUser.setLastName("Novato");
            pendingUser.setRole(memberRole);
            pendingUser.setActive(false);  
            pendingUser.setIsPending(true);
            userRepository.save(pendingUser);
            log.info("Usuario aspirante (pendiente) creado.");
        }

        //Usuario borrado para verlo en historial
        if (!userRepository.existsByUsernameAndDeletedAtIsNull("usuario.borrado")) {
            User deletedUser = new User();
            deletedUser.setUsername("usuario.borrado");
            deletedUser.setEmail("borrado@test.com");
            deletedUser.setPassword(passwordEncoder.encode("123"));
            deletedUser.setFirstName("Usuario");
            deletedUser.setLastName("Eliminado");
            deletedUser.setRole(roleRepository.findByNameAndDeletedAtIsNull("MEMBER").get());
            deletedUser.setDeletedAt(LocalDateTime.now().minusDays(1)); // Borrado ayer
            deletedUser.setActive(false);
            userRepository.save(deletedUser);
            log.info("Usuario borrado creado con éxito por el DataSeed");
        }

        // Staff sin equipos
        if (!userRepository.existsByUsernameAndDeletedAtIsNull("staff_sin_equipo")) {
            Role staffRole = roleRepository.findByNameAndDeletedAtIsNull("STAFF").get();
            User loneStaff = new User();
            loneStaff.setUsername("staff_sin_equipo");
            loneStaff.setFirstName("Marcos");
            loneStaff.setLastName("Sin Equipo");
            loneStaff.setRole(staffRole);
            loneStaff.setActive(true);
            userRepository.save(loneStaff);
            log.info("Usuario staff sin equipos creado con éxito por el DataSeed");
        }

        //EQUIPOS Y AFILIACIONES

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

        //Crear otro equipo de prueba
        Team teamB = new Team();
        if (!teamRepository.existsByNameAndDeletedAtIsNull("Equipo Juvenil")) {
        teamB.setName("Equipo Juvenil");
        teamB.setDescription("Categoría inferior para formación.");
        teamB = teamRepository.save(teamB);
        log.info("Equipo Juvenil creado con éxito por el DataSeed.");
        } else{
            teamB = teamRepository.findByNameAndDeletedAtIsNull("Equipo de Prueba").get();
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
            log.info("Afiliación de prueba ('staff' -> 'Equipo de Prueba') creada con éxito.");
        }

        //Añadir al mismo usuario STAFF a otro equuipo para probar multi-equipo
        Affiliation aff2 = new Affiliation();
        aff2.setUser(staffUser); // El mismo usuario 'staff'
        aff2.setTeam(teamB);
        aff2.setTeamPosition("PRIMER ENTRENADOR");
        aff2.setActive(true);
        affiliationRepository.save(aff2);
        log.info("Afiliación de prueba ('staff' -> 'Equipo Juvenil') creada con éxito.");



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

        //CATEGORÍAS DE INVENTARIO E ÍTEMS

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

        //Crear un item crítico (stock bajo) para probar alertas
        if(!itemRepository.existsByNameAndDeletedAtIsNull("Balones de Voleibol")){
        Item itemCritico = new Item();
        itemCritico.setName("Balones de Voleibol");
        itemCritico.setStockQuantity(2); 
        itemCritico.setMinStock(10); 
        itemCritico.setCategory(testCategory);
        itemCritico.setActive(true);
        itemRepository.save(itemCritico);
        log.info("Item crítico: 'Balones de Voleibol' creada con éxito por el DataSeed");

        // Crear un ítem de inventario INACTIVO (Descatalogado/Viejo)
        if (!itemRepository.existsByNameAndDeletedAtIsNull("Porterías de Entrenamiento (Madera)")) {
            Item oldItem = new Item();
            oldItem.setName("Porterías de Entrenamiento (Madera)");
            oldItem.setDescription("Material antiguo almacenado. No usar en competición por seguridad.");
            oldItem.setStockQuantity(2);
            oldItem.setMinStock(0);
            oldItem.setLocation("Almacén Exterior - Zona C");
            oldItem.setCategory(testCategory); 
            oldItem.setActive(false);
            
            itemRepository.save(oldItem);
            log.info("Item inactivo 'Porterías de Entrenamiento' creado con éxito por el DataSeed.");
        }
}

        //TRANSACCIONES
        
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

        // Transacción de gasto grande para balance
        Transaction expense = new Transaction();
        expense.setAmount(new BigDecimal("120.50"));
        expense.setConcept("Reparación de portería campo 2");
        expense.setType(TransactionType.EXPENSE);
        expense.setPaymentMethod(PaymentMethod.TRANSFER);
        expense.setTransactionDate(LocalDateTime.now().minusDays(5));
        expense.setActive(true);
        transactionRepository.save(expense);
        log.info("Transacción de gasto grande creada con éxito por el DataSeed");

        //ACTIVIDADES Y REGISTROS

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

            // Actividad con CUPO LLENO 
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

            // Actividad borrada (Historial/Soft Delete)
                Activity deletedAct = new Activity();
                deletedAct.setName("Campus de Verano 2023");
                deletedAct.setDescription("Esta actividad fue eliminada del sistema.");
                deletedAct.setStartDate(LocalDateTime.now().minusYears(1));
                deletedAct.setEndDate(LocalDateTime.now().minusYears(1).plusDays(7));
                deletedAct.setCapacity(50);
                deletedAct.setLocation("Instalaciones Municipales");
                deletedAct.setActive(false);
                deletedAct.setDeletedAt(LocalDateTime.now().minusMonths(1));
                activityRepository.save(deletedAct);
                log.info("Actividad borrada (Campus de Verano) creada para pruebas de historial.");
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
