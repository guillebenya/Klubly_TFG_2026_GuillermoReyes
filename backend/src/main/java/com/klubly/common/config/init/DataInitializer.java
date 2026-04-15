package com.klubly.common.config.init;

import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner{

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String...args){
        //Crear roles si no existen
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("STAFF");
        createRoleIfNotFound("USER");

        //Crear un usuario administrador por defecto
        if (!userRepository.existsByUsername("admin")) {
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow(() -> new RuntimeException("Error: El rol ADMIN no existe"));
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@klubly.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Administrador");
            admin.setLastName("Sistema");
            admin.setRole(adminRole);
            admin.setActive(true);

            userRepository.save(admin);
            System.out.println("Usuario administrador creado con éxito por el DataSeed.");
        }
    }
    
    private void createRoleIfNotFound(String roleName) {
        if (!roleRepository.findByName(roleName).isPresent()) {
            Role role = new Role();
            role.setName(roleName);
            role.setDescription("Rol de " + roleName + " con permioso para todo");
            role.setActive(true);
            roleRepository.save(role);
            System.out.println("Rol '" + roleName + "' creado con éxito por el DataSeed.");
        }
    }
}
