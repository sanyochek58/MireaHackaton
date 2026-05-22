package ru.hack.orchestrator.gateway.openstack;

public class OpenStackException extends RuntimeException {
    public OpenStackException(String message) {
        super(message);
    }

    public OpenStackException(String message, Throwable cause) {
        super(message, cause);
    }
}
