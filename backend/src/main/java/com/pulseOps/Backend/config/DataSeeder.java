package com.pulseOps.Backend.config;

import com.pulseOps.Backend.entity.User;
import com.pulseOps.Backend.repository.UserRepository;
import com.pulseOps.Backend.service.SeedService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Creates the initial admin account on first boot so the app is usable
 * immediately. Credentials come from the environment in production:
 * ADMIN_EMAIL / ADMIN_NAME / ADMIN_PASSWORD (dev defaults apply otherwise).
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder passwords, SeedService seeds,
                                @Value("${app.seed.admin-name:Demo Operator}") String adminName,
                                @Value("${app.seed.admin-email:admin@pulseops.io}") String adminEmail,
                                @Value("${app.seed.admin-password:Admin@123}") String adminPassword) {
        return args -> {
            String email = adminEmail.trim().toLowerCase();
            var existing = users.findByEmail(email);
            if (existing.isEmpty()) {
                var admin = new User(adminName, email, passwords.encode(adminPassword), "ADMIN");
                users.save(admin);
                seeds.seedForUser(admin);
                if ("Admin@123".equals(adminPassword)) {
                    log.warn("Seeded default admin {} with the DEFAULT password — set ADMIN_PASSWORD in production", email);
                } else {
                    log.info("Seeded admin {}", email);
                }
            }
        };
    }
}
