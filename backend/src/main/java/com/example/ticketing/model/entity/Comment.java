package com.example.ticketing.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    public Comment() {}

    public Comment(Long id, String message, LocalDateTime createdAt, User user, Ticket ticket) {
        this.id = id;
        this.message = message;
        this.createdAt = createdAt;
        this.user = user;
        this.ticket = ticket;
    }

    public static CommentBuilder builder() {
        return new CommentBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public static class CommentBuilder {
        private Long id;
        private String message;
        private LocalDateTime createdAt;
        private User user;
        private Ticket ticket;

        public CommentBuilder id(Long id) { this.id = id; return this; }
        public CommentBuilder message(String message) { this.message = message; return this; }
        public CommentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CommentBuilder user(User user) { this.user = user; return this; }
        public CommentBuilder ticket(Ticket ticket) { this.ticket = ticket; return this; }

        public Comment build() {
            return new Comment(id, message, createdAt, user, ticket);
        }
    }
}
