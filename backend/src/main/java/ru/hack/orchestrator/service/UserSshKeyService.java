package ru.hack.orchestrator.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.hack.orchestrator.gateway.openstack.NovaClient;
import ru.hack.orchestrator.gateway.openstack.OpenStackKeyInfo;
import ru.hack.orchestrator.model.UserSshKey;
import ru.hack.orchestrator.repository.ssh.UserSshKeyRepository;
import ru.hack.orchestrator.security.AppUser;

import java.time.Instant;
import java.util.List;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSshKeyService {

    private static final Pattern KEY_NAME_PATTERN = Pattern.compile("^[A-Za-z0-9@._\\- ]{3,100}$");
    private static final Pattern PUBLIC_KEY_PATTERN = Pattern.compile(
            "^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521)\\s+[A-Za-z0-9+/=]+(\\s+.+)?$"
    );

    private final NovaClient novaClient;
    private final UserSshKeyRepository userSshKeyRepository;

    public UserSshKey uploadKey(AppUser user, String keyName, String publicKey) {
        String normalizedName = normalizeName(keyName);
        String normalizedKey = normalizePublicKey(publicKey);
        validatePublicKey(normalizedKey);
        log.info("Uploading SSH key '{}' for user {}", normalizedName, user.email());

        if (userSshKeyRepository.exists(user.email(), normalizedName)) {
            throw new ResponseStatusException(CONFLICT, "SSH key with this name already exists");
        }

        OpenStackKeyInfo imported = novaClient.importPublicKey(normalizedName, normalizedKey);
        UserSshKey stored = new UserSshKey(
                imported.name(),
                imported.publicKey(),
                imported.fingerprint(),
                Instant.now()
        );
        userSshKeyRepository.save(user.email(), stored);
        log.info("SSH key '{}' uploaded for user {}, fingerprint={}", stored.name(), user.email(), stored.fingerprint());
        return stored;
    }

    public List<UserSshKey> listKeys(AppUser user) {
        return userSshKeyRepository.findAllByUserEmail(user.email());
    }

    public String resolveKeyName(AppUser user, String preferredKeyName) {
        List<UserSshKey> userKeys = userSshKeyRepository.findAllByUserEmail(user.email());
        if (userKeys.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Upload an SSH public key first");
        }
        if (preferredKeyName == null || preferredKeyName.isBlank()) {
            return userKeys.getFirst().name();
        }
        String normalized = normalizeName(preferredKeyName);
        if (!userSshKeyRepository.exists(user.email(), normalized)) {
            throw new ResponseStatusException(NOT_FOUND, "SSH key not found");
        }
        return normalized;
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "keyName is required");
        }
        String normalized = name.trim();
        if (!KEY_NAME_PATTERN.matcher(normalized).matches()) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid keyName format");
        }
        return normalized;
    }

    private String normalizePublicKey(String key) {
        if (key == null || key.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "SSH public key is required");
        }
        return key.trim().replaceAll("\\s+", " ");
    }

    private void validatePublicKey(String publicKey) {
        if (!PUBLIC_KEY_PATTERN.matcher(publicKey).matches()) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid SSH public key format");
        }
    }
}
