package com.example.ticketing.service;

import com.example.ticketing.model.entity.Ticket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@ticketflow.app}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTicketCreated(Ticket ticket) {
        String subject = "[TicketFlow] Ticket #" + ticket.getId() + " — Successfully Created";
        String body = buildTemplate(
                "Ticket Created",
                "Hello " + ticket.getUser().getName() + ",",
                new String[]{
                    "Your support request has been submitted and is now pending assignment.",
                    "",
                    "  Ticket ID  : #" + ticket.getId(),
                    "  Subject    : " + ticket.getSubject(),
                    "  Priority   : " + ticket.getPriority(),
                    "  Status     : " + ticket.getStatus(),
                    "",
                    "You can track your request at: " + frontendUrl + "/tickets/" + ticket.getId()
                }
        );
        send(ticket.getUser().getEmail(), subject, body);
    }

    public void sendTicketAssigned(Ticket ticket) {
        if (ticket.getAssignedAgent() == null) return;
        String subject = "[TicketFlow] Ticket #" + ticket.getId() + " — Assigned to You";
        String body = buildTemplate(
                "New Ticket Assignment",
                "Hello " + ticket.getAssignedAgent().getName() + ",",
                new String[]{
                    "You have been assigned a support ticket. Please take action promptly.",
                    "",
                    "  Ticket ID    : #" + ticket.getId(),
                    "  Subject      : " + ticket.getSubject(),
                    "  Priority     : " + ticket.getPriority(),
                    "  Submitted By : " + ticket.getUser().getName(),
                    "",
                    "View the ticket: " + frontendUrl + "/tickets/" + ticket.getId()
                }
        );
        // Notify agent
        send(ticket.getAssignedAgent().getEmail(), subject, body);
        // Also notify the ticket owner that their ticket was assigned
        String ownerBody = buildTemplate(
                "Ticket Assigned",
                "Hello " + ticket.getUser().getName() + ",",
                new String[]{
                    "Your ticket has been assigned to an agent who will handle it shortly.",
                    "",
                    "  Ticket ID  : #" + ticket.getId(),
                    "  Assigned To: " + ticket.getAssignedAgent().getName(),
                    "",
                    "Track your ticket: " + frontendUrl + "/tickets/" + ticket.getId()
                }
        );
        send(ticket.getUser().getEmail(), "[TicketFlow] Ticket #" + ticket.getId() + " — Agent Assigned", ownerBody);
    }

    public void sendStatusChanged(Ticket ticket) {
        boolean isResolved = ticket.getStatus().toString().equals("RESOLVED");
        String subject = "[TicketFlow] Ticket #" + ticket.getId() + " — Status Updated to " + ticket.getStatus();
        String[] lines = isResolved
                ? new String[]{
                    "Great news! Your ticket has been resolved by our support team.",
                    "",
                    "  Ticket ID  : #" + ticket.getId(),
                    "  Subject    : " + ticket.getSubject(),
                    "  Status     : " + ticket.getStatus(),
                    "",
                    "We'd love your feedback! Rate your experience at:",
                    "  " + frontendUrl + "/tickets/" + ticket.getId()
                }
                : new String[]{
                    "Your ticket status has been updated.",
                    "",
                    "  Ticket ID  : #" + ticket.getId(),
                    "  Subject    : " + ticket.getSubject(),
                    "  New Status : " + ticket.getStatus(),
                    "",
                    "Track your ticket: " + frontendUrl + "/tickets/" + ticket.getId()
                };

        String body = buildTemplate(
                isResolved ? "Ticket Resolved!" : "Status Update",
                "Hello " + ticket.getUser().getName() + ",",
                lines
        );
        send(ticket.getUser().getEmail(), subject, body);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private String buildTemplate(String heading, String greeting, String[] lines) {
        StringBuilder sb = new StringBuilder();
        sb.append("=".repeat(60)).append("\n");
        sb.append("  TicketFlow — ").append(heading).append("\n");
        sb.append("=".repeat(60)).append("\n\n");
        sb.append(greeting).append("\n\n");
        for (String line : lines) {
            sb.append(line).append("\n");
        }
        sb.append("\n").append("-".repeat(60)).append("\n");
        sb.append("This is an automated message from TicketFlow.\n");
        sb.append("Please do not reply directly to this email.\n");
        sb.append("Support Portal: ").append(frontendUrl).append("\n");
        return sb.toString();
    }

    private void send(String to, String subject, String body) {
        if (!mailEnabled) {
            logger.info("[EmailService] Mail disabled — skipping send to: {} | Subject: {}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("[EmailService] ✅ Email sent to: {} | Subject: {}", to, subject);
        } catch (Exception e) {
            logger.error("[EmailService] ❌ FAILED to send email to: {} | Subject: {} | Reason: {}", to, subject, e.getMessage(), e);
        }
    }
}
