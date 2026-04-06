package com.example.ticketing.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        logger.error("[GlobalExceptionHandler] RuntimeException: {}", message);

        Map<String, String> response = new HashMap<>();
        response.put("error", message);

        // Map specific messages to correct HTTP codes
        if (message != null) {
            if (message.equalsIgnoreCase("Forbidden") || message.toLowerCase().contains("forbidden") 
                    || message.toLowerCase().contains("not authorized") 
                    || message.toLowerCase().contains("can only")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            if (message.toLowerCase().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (message.toLowerCase().contains("cannot delete") || message.toLowerCase().contains("must have")
                    || message.toLowerCase().contains("not allowed") || message.toLowerCase().contains("exceeds")
                    || message.toLowerCase().contains("must be between") || message.toLowerCase().contains("must be resolved")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException ex) {
        logger.warn("[GlobalExceptionHandler] Access denied: {}", ex.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("error", "Access denied: insufficient permissions");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        logger.warn("[GlobalExceptionHandler] File upload too large: {}", ex.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("error", "File size exceeds the maximum allowed limit of 25MB");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        logger.error("[GlobalExceptionHandler] Unhandled exception: {}", ex.getMessage(), ex);
        Map<String, String> response = new HashMap<>();
        response.put("error", "An unexpected server error occurred. Please try again later.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
