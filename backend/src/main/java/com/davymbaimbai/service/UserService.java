package com.davymbaimbai.service;
import com.davymbaimbai.dto.Response;
import com.davymbaimbai.dto.UserRequest;
import com.davymbaimbai.dto.LoginRequest;
import com.davymbaimbai.entity.User;
import java.util.List;

public interface UserService {
    Response<?> signUp(UserRequest userRequest);
    Response<?> login(LoginRequest loginRequest);
    User getCurrentLoggedInUser();
    Response<List<User>> getAllUsers();
}
