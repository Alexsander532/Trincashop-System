package com.trincashop.core.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.trincashop.core.security.User;
import com.trincashop.core.security.UserRepository;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String adminEmail = "admin@trincashop.com";
        String adminPassword = "admin123";
        String newHash = passwordEncoder.encode(adminPassword);

        userRepository.findByEmail(adminEmail).ifPresentOrElse(
            existing -> {
                // Sempre redefine o hash para garantir que está correto
                existing.setPassword(newHash);
                userRepository.save(existing);
                log.info("✅ Senha do admin redefinida com novo hash BCrypt.");
                log.info("   Email: {}", adminEmail);
                log.info("   Hash salvo: {}", newHash);
                log.info("   Verificação: {}", passwordEncoder.matches(adminPassword, newHash));
            },
            () -> {
                User admin = new User("admin", adminEmail, newHash, "ADMIN");
                userRepository.save(admin);
                log.info("✅ Usuário admin criado. Email: {} | Hash: {}", adminEmail, newHash);
            }
        );
    }
}
