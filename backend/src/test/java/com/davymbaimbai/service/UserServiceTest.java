package com.davymbaimbai.service;

import com.davymbaimbai.dto.Response;
import com.davymbaimbai.dto.UserRequest;
import com.davymbaimbai.dto.LoginRequest;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.enums.Role;
import com.davymbaimbai.exceptions.BadRequestException;
import com.davymbaimbai.exceptions.NotFoundException;
import com.davymbaimbai.repository.UserRepository;
import com.davymbaimbai.security.JwtUtils;
import com.davymbaimbai.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserServiceImpl userService;

    private UserRequest userRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        userRequest = new UserRequest();
        userRequest.setUsername("testuser");
        userRequest.setEmail("test@example.com");
        userRequest.setPassword("password");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(Role.USER);
        testUser.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void signUp_Success() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        Response<?> response = userService.signUp(userRequest);
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("user registered successfully", response.getMessage());
        verify(userRepository, times(1)).existsByUsername("testuser");
        verify(userRepository, times(1)).existsByEmail("test@example.com");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void signUp_UsernameAlreadyExists_ThrowsException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> userService.signUp(userRequest));
        assertEquals("Username already taken", exception.getMessage());
        verify(userRepository, times(1)).existsByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void signUp_EmailAlreadyExists_ThrowsException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> userService.signUp(userRequest));
        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository, times(1)).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtUtils.generateToken("testuser")).thenReturn("jwt-token");
        Response<?> response = userService.login(loginRequest);
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("login successful", response.getMessage());
        assertEquals("jwt-token", response.getData());
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(passwordEncoder, times(1)).matches("password", "encodedPassword");
        verify(jwtUtils, times(1)).generateToken("testuser");
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        NotFoundException exception = assertThrows(NotFoundException.class, 
            () -> userService.login(loginRequest));
        assertEquals("User Not Found", exception.getMessage());
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(false);
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> userService.login(loginRequest));
        assertEquals("Invalid Password", exception.getMessage());
        verify(passwordEncoder, times(1)).matches("password", "encodedPassword");
        verify(jwtUtils, never()).generateToken(anyString());
    }

    @Test
    void getCurrentLoggedInUser_Success() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        User currentUser = userService.getCurrentLoggedInUser();
        assertNotNull(currentUser);
        assertEquals("testuser", currentUser.getUsername());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void getCurrentLoggedInUser_UserNotFound_ThrowsException() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        NotFoundException exception = assertThrows(NotFoundException.class, 
            () -> userService.getCurrentLoggedInUser());
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void getAllUsers_Success() {
        List<User> users = Arrays.asList(testUser);
        when(userRepository.findAll()).thenReturn(users);
        Response<List<User>> response = userService.getAllUsers();
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("Users retrieved successfully", response.getMessage());
        assertEquals(1, response.getData().size());
        verify(userRepository, times(1)).findAll();
    }
}