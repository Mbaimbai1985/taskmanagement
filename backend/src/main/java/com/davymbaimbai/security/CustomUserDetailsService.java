package com.davymbaimbai.security;


import com.davymbaimbai.entity.User;
import com.davymbaimbai.exceptions.NotFoundException;
import com.davymbaimbai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(()-> new NotFoundException("User not found"));

        return AuthUser.builder()
                .user(user)
                .build();
    }
}
