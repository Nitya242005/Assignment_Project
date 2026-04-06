package com.example.ticketing.dto;

import com.example.ticketing.model.enums.TicketPriority;

public class TicketRequest {
    private String subject;
    private String description;
    private TicketPriority priority;

    public TicketRequest() {}

    public TicketRequest(String subject, String description, TicketPriority priority) {
        this.subject = subject;
        this.description = description;
        this.priority = priority;
    }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
}
