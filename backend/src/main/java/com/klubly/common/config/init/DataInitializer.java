package com.klubly.common.config.init;

import com.klubly.common.config.AppProperties;
import com.klubly.modules.activities.entity.Activity;
import com.klubly.modules.activities.entity.Registration;
import com.klubly.modules.activities.repository.ActivityRepository;
import com.klubly.modules.activities.repository.RegistrationRepository;
import com.klubly.modules.identity.entity.Affiliation;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.AffiliationRepository;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.TeamRepository;
import com.klubly.modules.identity.repository.UserRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String ROLE_STAFF    = "STAFF";
    private static final String ROLE_ADMIN    = "ADMIN";
    private static final String ROLE_MEMBER   = "MEMBER";
    private static final String ROLE_INFORMATIVO = "ROL INFORMATIVO";
    private static final String USERNAME_ADMIN  = "admin";
    private static final String USERNAME_STAFF  = "staff";
    private static final String USERNAME_MEMBER = "member";
    private static final String CATEGORY_TEST   = "Categoría de prueba";
    private static final String TEAM_TEST       = "Equipo de Prueba";

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
    private final AppProperties appProperties;

    @Override
    public void run(String... args) {
        seedRoles();
        seedUsers();
        Team testTeam = seedTeams();
        seedInventory();
        seedTransactions();
        seedActivities(testTeam);
    }

    // Roles

    private void seedRoles() {
        createRoleIfNotFound(ROLE_ADMIN);
        createRoleIfNotFound(ROLE_STAFF);
        createRoleIfNotFound(ROLE_MEMBER);
        createRoleIfNotFound(ROLE_INFORMATIVO);
        createInactiveRole();
        createDeletedRole();
    }

    // Usuarios

    private void seedUsers() {
        createAdminUser();
        createStaffUser();
        createMemberUser();
        createPendingUser();
        createDeletedUser();
        createLoneStaffUser();
        createInformativeRoleUser();
        createInactiveUser();
    }

    private void createAdminUser() {
        if (userRepository.existsByUsernameAndDeletedAtIsNull(USERNAME_ADMIN)) return;

        Role adminRole = findRoleOrThrow(ROLE_ADMIN);
        User admin = new User();
        admin.setUsername(USERNAME_ADMIN);
        admin.setEmail("admin@klubly.com");
        admin.setPassword(passwordEncoder.encode(appProperties.getDefaultPassword()));
        admin.setFirstName("Administrador");
        admin.setLastName("Sistema");
        admin.setPhone("678901234");
        admin.setClubPosition("Director General");
        admin.setRole(adminRole);
        admin.setActive(true);
        userRepository.save(admin);
        log.info("Usuario administrador creado con éxito por el DataSeed.");
    }

    private void createStaffUser() {
        if (userRepository.existsByUsernameAndDeletedAtIsNull(USERNAME_STAFF)) return;

        Role staffRole = findRoleOrThrow(ROLE_STAFF);
        User staff = new User();
        staff.setUsername(USERNAME_STAFF);
        staff.setEmail("staff@klubly.com");
        staff.setPassword(passwordEncoder.encode(appProperties.getDefaultPassword()));
        staff.setFirstName("Staff");
        staff.setLastName("Técnico");
        staff.setPhone("678901235");
        staff.setRole(staffRole);
        staff.setActive(true);
        userRepository.save(staff);
        log.info("Usuario staff creado con éxito por el DataSeed.");
    }

    private void createMemberUser() {
        if (userRepository.existsByUsernameAndDeletedAtIsNull(USERNAME_MEMBER)) return;

        Role memberRole = findRoleOrThrow(ROLE_MEMBER);
        User member = new User();
        member.setUsername(USERNAME_MEMBER);
        member.setEmail("member@klubly.com");
        member.setPassword(passwordEncoder.encode(appProperties.getDefaultPassword()));
        member.setFirstName("Member");
        member.setLastName("Socio");
        member.setPhone("678901236");
        member.setAvatarURL("https://i.pinimg.com/736x/7f/dc/ff/7fdcff5a6fda8eaf7656f3c5e9084d7f.jpg");
        member.setRole(memberRole);
        member.setActive(true);
        userRepository.save(member);
        log.info("Usuario member creado con éxito por el DataSeed.");
    }

    private void createPendingUser() {
        if (userRepository.existsByUsernameAndDeletedAtIsNull("aspirante")) return;

        Role memberRole = findRoleOrThrow(ROLE_MEMBER);
        User pendingUser = new User();
        pendingUser.setUsername("aspirante");
        pendingUser.setEmail("aspirante@test.com");
        pendingUser.setPassword(passwordEncoder.encode(appProperties.getDefaultPassword()));
        pendingUser.setFirstName("Juan");
        pendingUser.setLastName("Novato");
        pendingUser.setRole(memberRole);
        pendingUser.setActive(false);
        pendingUser.setIsPending(true);
        userRepository.save(pendingUser);
        log.info("Usuario aspirante (pendiente) creado.");
    }

    private void createDeletedUser() {
        if (userRepository.existsByUsernameAndDeletedAtIsNull("usuario.borrado")) return;

        User deletedUser = new User();
        deletedUser.setUsername("usuario.borrado");
        deletedUser.setEmail("borrado@test.com");
        deletedUser.setPassword(passwordEncoder.encode(appProperties.getDefaultPassword()));
        deletedUser.setFirstName("Usuario");
        deletedUser.setLastName("Eliminado");
        deletedUser.setRole(roleRepository.findByNameAndDeletedAtIsNull(ROLE_MEMBER).get());
        deletedUser.setDeletedAt(LocalDateTime.now().minusDays(1));
        deletedUser.setActive(false);
        userRepository.save(deletedUser);
        log.info("Usuario borrado creado con éxito por el DataSeed");
    }

    private void createLoneStaffUser() {
        if (userRepository.existsByUsernameAndDeletedAtIsNull("staff_sin_equipo")) return;

        Role staffRole = findRoleOrThrow(ROLE_STAFF);
        User loneStaff = new User();
        loneStaff.setUsername("staff_sin_equipo");
        loneStaff.setEmail("loneStaff@klubly.com");
        loneStaff.setPassword(passwordEncoder.encode(appProperties.getDefaultPassword()));
        loneStaff.setFirstName("Marcos");
        loneStaff.setLastName("Sin Equipo");
        loneStaff.setRole(staffRole);
        loneStaff.setActive(true);
        userRepository.save(loneStaff);
        log.info("Usuario staff sin equipos creado con éxito por el DataSeed");
    }

    private void createInformativeRoleUser() {
        if (userRepository.existsByUsernameAndDeletedAtIsNull("user_rol_informativo")) return;

        Role informativeRole = findRoleOrThrow(ROLE_INFORMATIVO);
        User informativeUser = new User();
        informativeUser.setUsername("user_rol_informativo");
        informativeUser.setEmail("informativeUser@klubly.com");
        informativeUser.setPassword(passwordEncoder.encode(appProperties.getDefaultPassword()));
        informativeUser.setFirstName("Usuario");
        informativeUser.setLastName("Rol Informativo");
        informativeUser.setRole(informativeRole);
        informativeUser.setActive(true);
        userRepository.save(informativeUser);
        log.info("Usuario member con rol informativo creado con éxito por el DataSeed");
    }

    private void createInactiveUser() {
        if (userRepository.existsByUsernameAndDeletedAtIsNull("usuario.inactivo")) return;

        Role memberRole = findRoleOrThrow(ROLE_MEMBER);
        User inactiveUser = new User();
        inactiveUser.setUsername("usuario.inactivo");
        inactiveUser.setEmail("inactivo@klubly.com");
        inactiveUser.setPassword(passwordEncoder.encode(appProperties.getDefaultPassword()));
        inactiveUser.setFirstName("Carlos");
        inactiveUser.setLastName("Pausado");
        inactiveUser.setRole(memberRole);
        inactiveUser.setActive(false);
        userRepository.save(inactiveUser);
        log.info("Usuario inactivo creado con éxito por el DataSeed.");
    }

    private void createInactiveRole() {
        if (roleRepository.findByNameAndDeletedAtIsNull("ROL INACTIVO").isPresent()) return;

        Role role = new Role();
        role.setName("ROL INACTIVO");
        role.setDescription("Rol de prueba configurado como inactivo.");
        role.setActive(false);
        roleRepository.save(role);
        log.info("Rol inactivo creado con éxito por el DataSeed.");
    }

    private void createDeletedRole() {
        if (roleRepository.findByNameAndDeletedAtIsNull("ROL ELIMINADO").isPresent()) return;

        Role role = new Role();
        role.setName("ROL ELIMINADO");
        role.setDescription("Rol antiguo dado de baja del sistema.");
        role.setActive(false);
        role.setDeletedAt(LocalDateTime.now().minusDays(2));
        roleRepository.save(role);
        log.info("Rol eliminado creado con éxito por el DataSeed.");
    }

    // Equipos y afiliaciones

    private Team seedTeams() {
        Team testTeam = findOrCreateTestTeam();
        Team teamB    = findOrCreateJuvenilTeam();
        createInactiveTeam();
        createDeletedTeam();

        createStaffAffiliations(testTeam, teamB);
        createMemberAffiliation(testTeam);

        return testTeam;
    }

    private Team findOrCreateTestTeam() {
        if (!teamRepository.existsByNameAndDeletedAtIsNull(TEAM_TEST)) {
            Team team = new Team();
            team.setName(TEAM_TEST);
            team.setDescription("Este es un equipo creado por el DataSeed para pruebas.");
            Team saved = teamRepository.save(team);
            log.info("Equipo de prueba creado con éxito por el DataSeed.");
            return saved;
        }
        return teamRepository.findByNameAndDeletedAtIsNull(TEAM_TEST).get();
    }

    private Team findOrCreateJuvenilTeam() {
        if (!teamRepository.existsByNameAndDeletedAtIsNull("Equipo Juvenil")) {
            Team team = new Team();
            team.setName("Equipo Juvenil");
            team.setDescription("Categoría inferior para formación.");
            Team saved = teamRepository.save(team);
            log.info("Equipo Juvenil creado con éxito por el DataSeed.");
            return saved;
        }
        return teamRepository.findByNameAndDeletedAtIsNull(TEAM_TEST).get();
    }

    private void createInactiveTeam() {
        if (teamRepository.existsByNameAndDeletedAtIsNull("Equipo Inactivo")) return;

        Team team = new Team();
        team.setName("Equipo Inactivo");
        team.setDescription("Equipo suspendido temporalmente por la administración.");
        team.setActive(false);
        teamRepository.save(team);
        log.info("Equipo inactivo creado con éxito por el DataSeed.");
    }

    private void createDeletedTeam() {
        if (teamRepository.existsByNameAndDeletedAtIsNull("Equipo Eliminado")) return;

        Team team = new Team();
        team.setName("Equipo Eliminado");
        team.setDescription("Equipo antiguo disuelto.");
        team.setActive(false);
        team.setDeletedAt(LocalDateTime.now().minusDays(3));
        teamRepository.save(team);
        log.info("Equipo eliminado creado con éxito por el DataSeed.");
    }

    private void createStaffAffiliations(Team testTeam, Team teamB) {
        User staffUser = userRepository.findByUsernameAndDeletedAtIsNull(USERNAME_STAFF)
                .orElseThrow(() -> new RuntimeException("Error: Usuario staff no encontrado"));

        if (!affiliationRepository.existsByUserIdAndTeamIdAndDeletedAtIsNull(staffUser.getId(), testTeam.getId())) {
            saveAffiliation(staffUser, testTeam, "SEGUNDO ENTRENADOR");
            log.info("Afiliación de prueba ('staff' -> 'Equipo de Prueba') creada con éxito.");
        }

        saveAffiliation(staffUser, teamB, "PRIMER ENTRENADOR");
        log.info("Afiliación de prueba ('staff' -> 'Equipo Juvenil') creada con éxito.");
    }

    private void createMemberAffiliation(Team testTeam) {
        User memberUser = userRepository.findByUsernameAndDeletedAtIsNull(USERNAME_MEMBER)
                .orElseThrow(() -> new RuntimeException("Error: Usuario member no encontrado"));

        if (!affiliationRepository.existsByUserIdAndTeamIdAndDeletedAtIsNull(memberUser.getId(), testTeam.getId())) {
            saveAffiliation(memberUser, testTeam, "JUGADOR");
            log.info("Afiliación de prueba ('member' -> 'Equipo de Prueba') creada con éxito.");
        }
    }

    private void saveAffiliation(User user, Team team, String position) {
        Affiliation affiliation = new Affiliation();
        affiliation.setUser(user);
        affiliation.setTeam(team);
        affiliation.setTeamPosition(position);
        affiliation.setActive(true);
        affiliationRepository.save(affiliation);
    }

    // Inventario

    private void seedInventory() {
        createTestCategory();
        Category testCategory = categoryRepository.findByNameAndDeletedAtIsNull(CATEGORY_TEST)
                .orElseThrow(() -> new RuntimeException("Error: Categoría 'Categoría de prueba' no encontrada"));
        createTestItem(testCategory);
        createCriticalItem(testCategory);
        createInactiveItem(testCategory);
        createOutOfStockItem(testCategory);
        createDeletedItem(testCategory);
        createInactiveCategory();
        createDeletedCategory();
    }

    private void createTestCategory() {
        if (categoryRepository.existsByNameAndDeletedAtIsNull(CATEGORY_TEST)) return;

        Category category = new Category();
        category.setName(CATEGORY_TEST);
        category.setDescription("Esto es una categoría de prueba");
        category.setActive(true);
        categoryRepository.save(category);
        log.info("Categoría: 'Categoría de prueba' creada con éxito por el DataSeed.");
    }

    private void createTestItem(Category category) {
        if (itemRepository.existsByNameAndDeletedAtIsNull("Item de prueba")) return;

        Item item = new Item();
        item.setName("Item de prueba");
        item.setDescription("Esto es un item de prueba");
        item.setStockQuantity(40);
        item.setMinStock(37);
        item.setLocation("Estantería 4 - Almacén B");
        item.setCategory(category);
        item.setActive(true);
        itemRepository.save(item);
        log.info("Item: 'Item de prueba' creado con éxito por el DataSeed.");
    }

    private void createCriticalItem(Category category) {
        if (itemRepository.existsByNameAndDeletedAtIsNull("Balones de Voleibol")) return;

        Item item = new Item();
        item.setName("Balones de Voleibol");
        item.setStockQuantity(2);
        item.setMinStock(10);
        item.setCategory(category);
        item.setActive(true);
        itemRepository.save(item);
        log.info("Item crítico: 'Balones de Voleibol' creado con éxito por el DataSeed");
    }

    private void createInactiveItem(Category category) {
        if (itemRepository.existsByNameAndDeletedAtIsNull("Porterías de Entrenamiento (Madera)")) return;

        Item item = new Item();
        item.setName("Porterías de Entrenamiento (Madera)");
        item.setDescription("Material antiguo almacenado. No usar en competición por seguridad.");
        item.setStockQuantity(2);
        item.setMinStock(0);
        item.setLocation("Almacén Exterior - Zona C");
        item.setCategory(category);
        item.setActive(false);
        itemRepository.save(item);
        log.info("Item inactivo 'Porterías de Entrenamiento' creado con éxito por el DataSeed.");
    }

    private void createOutOfStockItem(Category category) {
        if (itemRepository.existsByNameAndDeletedAtIsNull("Petos de Entrenamiento")) return;

        Item item = new Item();
        item.setName("Petos de Entrenamiento (Agotado)");
        item.setDescription("Petos reflectantes color verde para partidillos.");
        item.setStockQuantity(0);
        item.setMinStock(15);
        item.setLocation("Armario Principal - Almacén A");
        item.setCategory(category);
        item.setActive(true);
        itemRepository.save(item);
        log.info("Item agotado: 'Petos de Entrenamiento' creado con éxito por el DataSeed.");
    }

    private void createDeletedItem(Category category) {
        if (itemRepository.existsByNameAndDeletedAtIsNull("Conos rotos (Eliminado)")) return;

        Item item = new Item();
        item.setName("Conos rotos (Eliminado)");
        item.setDescription("Lote de conos antiguos dañados durante la temporada.");
        item.setStockQuantity(0);
        item.setMinStock(0);
        item.setCategory(category);
        item.setActive(false);
        item.setDeletedAt(LocalDateTime.now().minusDays(2));
        itemRepository.save(item);
        log.info("Item eliminado: 'Conos rotos' creado con éxito por el DataSeed.");
    }

    private void createInactiveCategory() {
        if (categoryRepository.existsByNameAndDeletedAtIsNull("Categoría Inactiva")) return;

        Category category = new Category();
        category.setName("Categoría Inactiva");
        category.setDescription("Categoría oculta temporalmente de los formularios activos.");
        category.setActive(false);
        categoryRepository.save(category);
        log.info("Categoría inactiva creada con éxito por el DataSeed.");
    }

    private void createDeletedCategory() {
        if (categoryRepository.existsByNameAndDeletedAtIsNull("Categoría Eliminada")) return;

        Category category = new Category();
        category.setName("Categoría Eliminada");
        category.setDescription("Categoría descatalogada históricamente.");
        category.setActive(false);
        category.setDeletedAt(LocalDateTime.now().minusDays(4));
        categoryRepository.save(category);
        log.info("Categoría eliminada creada con éxito por el DataSeed.");
    }

    // Transacciones

    private void seedTransactions() {
        User memberUser = userRepository.findByUsernameAndDeletedAtIsNull(USERNAME_MEMBER)
                .orElseThrow(() -> new RuntimeException("Error: Usuario member no encontrado"));

        saveTransaction("Transacción de prueba 1", "20.00",  TransactionType.INCOME,  PaymentMethod.CARD,     LocalDateTime.now(),              memberUser);
        saveTransaction("Transacción de prueba 2", "45.32",  TransactionType.EXPENSE, PaymentMethod.CASH,     LocalDateTime.now(),              memberUser);
        saveTransaction("Reparación de portería campo 2", "120.50", TransactionType.EXPENSE, PaymentMethod.TRANSFER, LocalDateTime.now().minusDays(5), null);

        Transaction txInactiva = new Transaction();
        txInactiva.setAmount(new BigDecimal("15.00"));
        txInactiva.setConcept("Cuota mensual (Inactiva)");
        txInactiva.setTransactionDate(LocalDateTime.now().minusDays(2));
        txInactiva.setType(TransactionType.INCOME);
        txInactiva.setPaymentMethod(PaymentMethod.CARD);
        txInactiva.setActive(false);
        txInactiva.setUser(memberUser);
        transactionRepository.save(txInactiva);

        // 👈 Nueva Transacción Eliminada/Dada de baja
        Transaction txBorrada = new Transaction();
        txBorrada.setAmount(new BigDecimal("60.00"));
        txBorrada.setConcept("Seguro anual anulado (Eliminada)");
        txBorrada.setTransactionDate(LocalDateTime.now().minusDays(10));
        txBorrada.setType(TransactionType.EXPENSE);
        txBorrada.setPaymentMethod(PaymentMethod.TRANSFER);
        txBorrada.setActive(false);
        txBorrada.setDeletedAt(LocalDateTime.now().minusDays(1));
        transactionRepository.save(txBorrada);

        log.info("Transacciones creadas con éxito por el DataSeed");
    }

    private void saveTransaction(String concept, String amount, TransactionType type,
                                  PaymentMethod method, LocalDateTime date, User user) {
        Transaction tx = new Transaction();
        tx.setAmount(new BigDecimal(amount));
        tx.setConcept(concept);
        tx.setTransactionDate(date);
        tx.setType(type);
        tx.setPaymentMethod(method);
        tx.setActive(true);
        tx.setUser(user);
        transactionRepository.save(tx);
    }

    // Actividades y registros

    private void seedActivities(Team testTeam) {
        if (activityRepository.count() != 0) return;

        saveGlobalActivity();
        saveTeamActivityWithRegistration(testTeam);
        savePastActivity();
        saveOngoingActivity();
        saveFullActivity();
        saveDeletedActivity();
        saveInactiveActivity();

        log.info("Seeding de actividades e inscripciones completado.");
    }

    private void saveGlobalActivity() {
        Activity act = new Activity();
        act.setName("Asamblea General del Club");
        act.setDescription("Reunión anual para todos los socios en el salón de actos.");
        act.setStartDate(LocalDateTime.now().plusDays(10).withHour(18).withMinute(0));
        act.setEndDate(LocalDateTime.now().plusDays(10).withHour(20).withMinute(0));
        act.setCapacity(100);
        act.setLocation("Sede Social - Salón Principal");
        act.setActive(true);
        activityRepository.save(act);
    }

    private void saveTeamActivityWithRegistration(Team testTeam) {
        if (testTeam == null) return;

        Activity act = new Activity();
        act.setName("Entrenamiento Táctico Avanzado");
        act.setDescription("Sesión a puerta cerrada para preparar el derbi.");
        act.setStartDate(LocalDateTime.now().plusDays(2).withHour(19).withMinute(30));
        act.setEndDate(LocalDateTime.now().plusDays(2).withHour(21).withMinute(0));
        act.setCapacity(20);
        act.setLocation("Campo de Entrenamiento 1");
        act.setActive(true);
        act.getTeams().add(testTeam);
        activityRepository.save(act);

        userRepository.findByUsernameAndDeletedAtIsNull(USERNAME_MEMBER)
                .ifPresent(member -> saveRegistration(act, member));
    }

    private void savePastActivity() {
        Activity act = new Activity();
        act.setName("Torneo de Navidad");
        act.setDescription("Evento finalizado.");
        act.setStartDate(LocalDateTime.now().minusDays(30));
        act.setEndDate(LocalDateTime.now().minusDays(30).plusHours(4));
        act.setCapacity(50);
        act.setLocation("Pabellón Municipal");
        act.setActive(true);
        activityRepository.save(act);
    }

    private void saveOngoingActivity() {
        Activity act = new Activity();
        act.setName("Torneo Benéfico Cruz Roja");
        act.setDescription("Evento en curso.");
        act.setStartDate(LocalDateTime.now().minusHours(1));
        act.setEndDate(LocalDateTime.now().plusHours(7));
        act.setCapacity(30);
        act.setLocation("Pabellón Centro Ciudad");
        act.setActive(true);
        activityRepository.save(act);
    }

    private void saveFullActivity() {
        Activity act = new Activity();
        act.setName("Taller de Nutrición Deportiva");
        act.setDescription("Charla exclusiva sobre suplementación. Plazas muy limitadas.");
        act.setStartDate(LocalDateTime.now().plusDays(5).withHour(17).withMinute(0));
        act.setEndDate(LocalDateTime.now().plusDays(5).withHour(18).withMinute(30));
        act.setCapacity(1);
        act.setLocation("Sala de Juntas");
        act.setActive(true);
        activityRepository.save(act);

        userRepository.findByUsernameAndDeletedAtIsNull(USERNAME_ADMIN)
                .ifPresent(admin -> saveRegistration(act, admin));
    }

    private void saveDeletedActivity() {
        Activity act = new Activity();
        act.setName("Campus de Verano 2023");
        act.setDescription("Esta actividad fue eliminada del sistema.");
        act.setStartDate(LocalDateTime.now().minusYears(1));
        act.setEndDate(LocalDateTime.now().minusYears(1).plusDays(7));
        act.setCapacity(50);
        act.setLocation("Instalaciones Municipales");
        act.setActive(false);
        act.setDeletedAt(LocalDateTime.now().minusMonths(1));
        activityRepository.save(act);
        log.info("Actividad borrada (Campus de Verano) creada para pruebas de historial.");
    }

    private void saveInactiveActivity() {
        Activity act = new Activity();
        act.setName("Sesión Fotográfica Oficial (Inactiva)");
        act.setDescription("Fotos oficiales de la plantilla suspendidas temporalmente por el club.");
        act.setStartDate(LocalDateTime.now().plusDays(15).withHour(10).withMinute(0));
        act.setEndDate(LocalDateTime.now().plusDays(15).withHour(13).withMinute(0));
        act.setCapacity(30);
        act.setLocation("Estudio Fotográfico / Césped Principal");
        act.setActive(false);
        activityRepository.save(act);
        log.info("Actividad inactiva creada con éxito por el DataSeed.");
    }

    private void saveRegistration(Activity activity, User user) {
        Registration reg = new Registration();
        reg.setActivity(activity);
        reg.setUser(user);
        reg.setRegistrationDate(LocalDateTime.now());
        reg.setActive(true);
        registrationRepository.save(reg);
    }

    // Helpers

    private void createRoleIfNotFound(String roleName) {
        if (roleRepository.findByNameAndDeletedAtIsNull(roleName).isPresent()) return;

        Role role = new Role();
        role.setName(roleName);
        role.setDescription("Rol de: " + roleName);
        role.setActive(true);
        roleRepository.save(role);
        log.info("Rol '{}' creado con éxito por el DataSeed.", roleName);
    }

    private Role findRoleOrThrow(String roleName) {
        return roleRepository.findByNameAndDeletedAtIsNull(roleName)
                .orElseThrow(() -> new RuntimeException(getRoleNotFoundMessage(roleName)));
    }

    private static String getRoleNotFoundMessage(String roleName) {
        return "Error: El rol " + roleName + " no existe";
    }
}