package interview.guide.modules.auth.web;

import interview.guide.common.result.Result;
import interview.guide.modules.auth.model.AuthDtos.AuthResponse;
import interview.guide.modules.auth.model.AuthDtos.LoginRequest;
import interview.guide.modules.auth.model.AuthDtos.RegisterRequest;
import interview.guide.modules.auth.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "认证", description = "注册与登录（JWT）")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/api/auth/register")
    public Result<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return Result.success(authService.register(request));
    }

    @PostMapping("/api/auth/login")
    public Result<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }
}
