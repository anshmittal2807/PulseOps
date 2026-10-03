package com.pulseOps.Backend.service;

import com.pulseOps.Backend.dto.AuthResponse;
import com.pulseOps.Backend.dto.LoginRequest;
import com.pulseOps.Backend.dto.RegisterRequest;
import com.pulseOps.Backend.entity.User;
import com.pulseOps.Backend.repository.UserRepository;
import com.pulseOps.Backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final AuthenticationManager authManager;
    private final JwtService jwt;
    private final SeedService seedService;

    public AuthService(UserRepository users, PasswordEncoder passwords,
                       AuthenticationManager authManager, JwtService jwt, SeedService seedService) {
        this.users = users;
        this.passwords = passwords;
        this.authManager = authManager;
        this.jwt = jwt;
        this.seedService = seedService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        var user = new User(req.name().trim(), email, passwords.encode(req.password()), "ADMIN");
        users.save(user);
        seedService.seedForUser(user);
        UserDetails principal = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), java.util.List.of());
        return new AuthResponse(jwt.generateToken(principal), toDto(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        authManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.password()));
        var user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        UserDetails principal = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), java.util.List.of());
        return new AuthResponse(jwt.generateToken(principal), toDto(user));
    }

    public AuthResponse me(String email) {
        var user = users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        UserDetails principal = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), java.util.List.of());
        // Re-issue is optional; return profile with a fresh token so the client can rotate.
        return new AuthResponse(jwt.generateToken(principal), toDto(user));
    }

    @Transactional
    public AuthResponse.UserDto updateProfile(String email, String name) {
        var user = users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setName(name.trim());
        return toDto(user);
    }

    public static AuthResponse.UserDto toDto(User user) {
        return new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
