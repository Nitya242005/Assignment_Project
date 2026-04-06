package com.example.ticketing.dto;

public class AssignTicketRequest {
    private Long ticketId;
    private Long agentId;

    public AssignTicketRequest() {}

    public AssignTicketRequest(Long ticketId, Long agentId) {
        this.ticketId = ticketId;
        this.agentId = agentId;
    }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }
}
