package ru.hack.orchestrator.gateway.openstack;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class OpenStackTokenService {

    private final KeystoneAuthClient keystoneAuthClient;
    private volatile OpenStackToken token;

    public OpenStackToken currentToken() {
        OpenStackToken snapshot = token;
        if (snapshot == null || snapshot.isExpired()) {
            synchronized (this) {
                snapshot = token;
                if (snapshot == null || snapshot.isExpired()) {
                    snapshot = keystoneAuthClient.authenticate();
                    token = snapshot;
                }
            }
        }
        return snapshot;
    }

    public void refresh() {
        synchronized (this) {
            token = keystoneAuthClient.authenticate();
        }
    }
}
