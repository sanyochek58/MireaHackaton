package ru.hack.orchestrator.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import ru.hack.orchestrator.dto.response.SshKeyResponse;
import ru.hack.orchestrator.security.AppUser;
import ru.hack.orchestrator.model.UserSshKey;
import ru.hack.orchestrator.service.CurrentUserService;
import ru.hack.orchestrator.service.UserSshKeyService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/ssh-keys")
@RequiredArgsConstructor
public class SshKeyController {

    private static final long MAX_KEY_FILE_BYTES = 16 * 1024;

    private final UserSshKeyService sshKeyService;
    private final CurrentUserService currentUserService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public SshKeyResponse upload(
            @RequestParam("keyName") String keyName,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "SSH key file is empty");
        }
        if (file.getSize() > MAX_KEY_FILE_BYTES) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(413), "SSH key file is too large");
        }
        String content = readUtf8(file);
        AppUser user = currentUserService.currentUser();
        UserSshKey key = sshKeyService.uploadKey(user, keyName, content);
        return new SshKeyResponse(key.name(), key.fingerprint(), key.uploadedAt());
    }

    @PostMapping(value = "/upload-text", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public SshKeyResponse uploadText(@RequestBody UploadSshKeyTextRequest request) {
        AppUser user = currentUserService.currentUser();
        UserSshKey key = sshKeyService.uploadKey(user, request.keyName(), request.publicKey());
        return new SshKeyResponse(key.name(), key.fingerprint(), key.uploadedAt());
    }

    @GetMapping("/me")
    public List<SshKeyResponse> myKeys() {
        AppUser user = currentUserService.currentUser();
        return sshKeyService.listKeys(user).stream()
                .map(key -> new SshKeyResponse(key.name(), key.fingerprint(), key.uploadedAt()))
                .toList();
    }

    private String readUtf8(MultipartFile file) {
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Failed to read SSH key file");
        }
    }

    private record UploadSshKeyTextRequest(
            String keyName,
            String publicKey
    ) {
    }
}
