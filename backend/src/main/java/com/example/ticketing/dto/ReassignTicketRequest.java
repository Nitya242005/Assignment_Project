package com.example.ticketing.dto;

public class ReassignTicketRequest {
    private Long agentId;

    public ReassignTicketRequest() {}

    public ReassignTicketRequest(Long agentId) {
        this.agentId = agentId;
    }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }
}
