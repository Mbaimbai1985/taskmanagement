package com.davymbaimbai.service.impl;


import com.davymbaimbai.dto.Response;
import com.davymbaimbai.dto.UserRequest;
import com.davymbaimbai.dto.LoginRequest;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.enums.Role;
import com.davymbaimbai.exceptions.BadRequestException;
import com.davymbaimbai.exceptions.NotFoundException;
import com.davymbaimbai.repository.UserRepository;
import com.davymbaimbai.security.JwtUtils;
import com.davymbaimbai.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtils jwtUtils;
    @Override
    public Response<?> signUp(UserRequest userRequest) {
        log.info("Inside signUp()");
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        User user = new User();
        user.setCreatedAt(LocalDateTime.now());
        user.setRole(Role.USER);
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        userRepository.save(user);
        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("user registered successfully")
                .build();

    }
    @Override
    public Response<?> login(LoginRequest loginRequest) {
        log.info("Inside login()");
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(()-> new NotFoundException("User Not Found"));
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
            throw new BadRequestException("Invalid Password");
        }
        String token = jwtUtils.generateToken(user.getUsername());
        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("login successful")
                .data(token)
                .build();

    }
    @Override
    public User getCurrentLoggedInUser() {
        String  username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(()-> new NotFoundException("User not found"));
    }
    
    @Override
    public Response<List<User>> getAllUsers() {
        log.info("Inside getAllUsers()");
        List<User> users = userRepository.findAll();
        return Response.<List<User>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Users retrieved successfully")
                .data(users)
                .build();
    }
}
