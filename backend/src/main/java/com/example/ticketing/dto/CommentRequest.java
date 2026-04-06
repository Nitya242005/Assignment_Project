package com.example.ticketing.dto;

public class CommentRequest {
    private String message;

    public CommentRequest() {}

    public CommentRequest(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
