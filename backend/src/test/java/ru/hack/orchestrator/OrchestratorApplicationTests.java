package ru.hack.orchestrator;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "openstack.base-url=https://127.0.0.1",
        "openstack.project-id=test-project",
        "openstack.domain=test-domain",
        "openstack.username=test-user",
        "openstack.password=test-password",
        "openstack.project-name=test-user",
        "openstack.default-flavor-id=102",
        "openstack.default-image-id=test-image",
        "openstack.default-network-id=test-network",
        "openstack.default-security-group=default",
        "openstack.default-volume-size-gb=150",
        "openstack.poll-interval-seconds=1",
        "openstack.max-poll-attempts=2",
        "app.jwt.secret=changeitchangeitchangeitchangeitchangeit",
        "app.jwt.expiration-ms=60000"
})
class OrchestratorApplicationTests {

    @Test
    void contextLoads() {
    }

}
