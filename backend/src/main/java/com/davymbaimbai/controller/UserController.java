package com.davymbaimbai.controller;
import com.davymbaimbai.dto.Response;
import com.davymbaimbai.dto.UserRequest;
import com.davymbaimbai.dto.LoginRequest;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;
    
    @PostMapping("/api/auth/register")
    public ResponseEntity<Response<?>> signUp(@Valid @RequestBody UserRequest userRequest){
        return ResponseEntity.ok(userService.signUp(userRequest));
    }
    
    @PostMapping("/api/auth/login")
    public ResponseEntity<Response<?>> login(@Valid @RequestBody LoginRequest loginRequest){
        return ResponseEntity.ok(userService.login(loginRequest));
    }
    
    @GetMapping("/api/users")
    public ResponseEntity<Response<List<User>>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/api/users/current")
    public ResponseEntity<User> getCurrentUser(){
        return ResponseEntity.ok(userService.getCurrentLoggedInUser());
    }
}
