package ru.hack.orchestrator.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "vm_instances")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class VmRecordEntity {

    @Id
    @Column(nullable = false, length = 255)
    private String userEmail;

    @Column(nullable = false, length = 255)
    private String serverId;

    @Column(nullable = false, length = 255)
    private String volumeId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String keyName;

    @Column(nullable = false, length = 64)
    private String flavorId;

    @Column(nullable = false, length = 255)
    private String imageId;

    @Column(nullable = false, length = 255)
    private String networkId;

    @Column(nullable = false, length = 64)
    private String status;

    @Column(length = 128)
    private String ipAddress;

    @Column
    private Integer cpu;

    @Column
    private Integer ramGb;

    @Column(nullable = false)
    private Instant createdAt;

}
