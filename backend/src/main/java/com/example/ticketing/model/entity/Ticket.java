package com.example.ticketing.model.entity;

import com.example.ticketing.model.enums.TicketPriority;
import com.example.ticketing.model.enums.TicketStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User assignedAgent;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "attachment_path")
    private String attachmentPath;

    public Ticket() {}

    public Ticket(Long id, String subject, String description, TicketStatus status, TicketPriority priority, 
                  LocalDateTime createdAt, LocalDateTime updatedAt, User user, User assignedAgent) {
        this.id = id;
        this.subject = subject;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.user = user;
        this.assignedAgent = assignedAgent;
        this.rating = null;
        this.attachmentPath = null;
    }

    public static TicketBuilder builder() {
        return new TicketBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getAssignedAgent() { return assignedAgent; }
    public void setAssignedAgent(User assignedAgent) { this.assignedAgent = assignedAgent; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }

    public static class TicketBuilder {
        private Long id;
        private String subject;
        private String description;
        private TicketStatus status;
        private TicketPriority priority;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private User user;
        private User assignedAgent;

        public TicketBuilder id(Long id) { this.id = id; return this; }
        public TicketBuilder subject(String subject) { this.subject = subject; return this; }
        public TicketBuilder description(String description) { this.description = description; return this; }
        public TicketBuilder status(TicketStatus status) { this.status = status; return this; }
        public TicketBuilder priority(TicketPriority priority) { this.priority = priority; return this; }
        public TicketBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TicketBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public TicketBuilder user(User user) { this.user = user; return this; }
        public TicketBuilder assignedAgent(User assignedAgent) { this.assignedAgent = assignedAgent; return this; }

        public Ticket build() {
            return new Ticket(id, subject, description, status, priority, createdAt, updatedAt, user, assignedAgent);
        }
    }
}
