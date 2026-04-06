package com.example.ticketing.dto;

import com.example.ticketing.model.enums.TicketStatus;

public class StatusUpdateRequest {
    private TicketStatus status;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(TicketStatus status) {
        this.status = status;
    }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
}
