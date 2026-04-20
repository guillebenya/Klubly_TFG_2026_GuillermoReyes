package com.klubly.common.config.init;

import com.klubly.modules.identity.controller.AffiliationController;
import com.klubly.modules.identity.entity.Affiliation;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.AffiliationRepository;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.TeamRepository;
import com.klubly.modules.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner{

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TeamRepository teamRepository;
    private final AffiliationRepository affiliationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String...args){
        //Crear roles si no existen
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("STAFF");
        createRoleIfNotFound("MEMBER");

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
            admin.setAvatarURL("urlInventada.es");
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
            staff.setAvatarURL("urlInventada.com");
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
            member.setAvatarURL("urlInventada.net");
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

         //Crear una afiliación de prueba
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
    }

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
