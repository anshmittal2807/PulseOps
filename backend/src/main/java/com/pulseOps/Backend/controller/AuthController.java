package com.pulseOps.Backend.controller;

import com.pulseOps.Backend.dto.AuthResponse;
import com.pulseOps.Backend.dto.LoginRequest;
import com.pulseOps.Backend.dto.RegisterRequest;
import com.pulseOps.Backend.dto.UpdateProfileRequest;
import com.pulseOps.Backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return auth.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @GetMapping("/me")
    public AuthResponse.UserDto me(Authentication authentication) {
        return auth.me(authentication.getName()).user();
    }

    @PutMapping("/profile")
    public AuthResponse.UserDto updateProfile(Authentication authentication,
                                              @Valid @RequestBody UpdateProfileRequest req) {
        return auth.updateProfile(authentication.getName(), req.name());
    }
}
