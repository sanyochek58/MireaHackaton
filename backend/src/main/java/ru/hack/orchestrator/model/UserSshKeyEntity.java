package ru.hack.orchestrator.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "user_ssh_keys")
@IdClass(UserSshKeyEntity.UserSshKeyId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UserSshKeyEntity {

    @Id
    @Column(nullable = false, length = 255)
    private String userEmail;

    @Id
    @Column(nullable = false, length = 100)
    private String keyName;

    @Column(nullable = false, length = 2048)
    private String publicKey;

    @Column(nullable = false, length = 255)
    private String fingerprint;

    @Column(nullable = false)
    private Instant uploadedAt;

    @EqualsAndHashCode
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSshKeyId implements Serializable {
        private String userEmail;
        private String keyName;
    }
}
