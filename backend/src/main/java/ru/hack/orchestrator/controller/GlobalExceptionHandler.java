package ru.hack.orchestrator.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import ru.hack.orchestrator.dto.response.ApiErrorResponse;
import ru.hack.orchestrator.gateway.openstack.OpenStackException;

import java.time.Instant;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            HttpServletRequest request,
            MethodArgumentNotValidException ex
    ) {
        log.warn("Validation failed for {}: {}", request.getRequestURI(), ex.getMessage());
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Validation failed");
        return error(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            HttpServletRequest request,
            ConstraintViolationException ex
    ) {
        log.warn("Constraint violation for {}: {}", request.getRequestURI(), ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(
            HttpServletRequest request
    ) {
        log.warn("Max upload size exceeded for {}", request.getRequestURI());
        return error(HttpStatusCode.valueOf(413), "SSH key file is too large", request.getRequestURI());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
            HttpServletRequest request,
            ResponseStatusException ex
    ) {
        log.warn("Response status error for {}: {}", request.getRequestURI(), ex.getMessage());
        String message = ex.getReason() == null ? "Request failed" : ex.getReason();
        return error(HttpStatus.valueOf(ex.getStatusCode().value()), message, request.getRequestURI());
    }

    @ExceptionHandler(OpenStackException.class)
    public ResponseEntity<ApiErrorResponse> handleOpenStackException(
            HttpServletRequest request,
            OpenStackException ex
    ) {
        log.error("OpenStack error for {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return error(HttpStatus.BAD_GATEWAY, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgumentException(
            HttpServletRequest request,
            IllegalArgumentException ex
    ) {
        log.warn("Illegal argument for {}: {}", request.getRequestURI(), ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
            HttpServletRequest request,
            Exception ex
    ) {
        log.error("Unexpected server error for {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", request.getRequestURI());
    }

    private ResponseEntity<ApiErrorResponse> error(HttpStatus status, String message, String path) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path
        );
        return ResponseEntity.status(status).body(body);
    }

    private ResponseEntity<ApiErrorResponse> error(HttpStatusCode status, String message, String path) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                status.value(),
                HttpStatus.valueOf(status.value()).getReasonPhrase(),
                message,
                path
        );
        return ResponseEntity.status(status).body(body);
    }
}
