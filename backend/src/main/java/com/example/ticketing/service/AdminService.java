package com.example.ticketing.service;

import com.example.ticketing.dto.AssignTicketRequest;
import com.example.ticketing.model.entity.Ticket;
import com.example.ticketing.model.entity.User;
import com.example.ticketing.model.enums.Role;
import com.example.ticketing.repository.CommentRepository;
import com.example.ticketing.repository.TicketRepository;
import com.example.ticketing.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.example.ticketing.dto.UserRoleUpdateRequest;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final EmailService emailService;

    public AdminService(UserRepository userRepository, TicketRepository ticketRepository,
                        CommentRepository commentRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.emailService = emailService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void assignTicket(AssignTicketRequest request) {
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User agent = userRepository.findById(request.getAgentId())
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (agent.getRole() != Role.AGENT && agent.getRole() != Role.ADMIN) {
            throw new RuntimeException("Selected user is not an agent or admin");
        }

        ticket.setAssignedAgent(agent);
        Ticket saved = ticketRepository.save(ticket);
        emailService.sendTicketAssigned(saved);
    }

    @Transactional
    public void updateUserRole(UserRoleUpdateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Role newRole = Role.valueOf(request.getRole());
            user.setRole(newRole);
            userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role specified. Use: USER, AGENT, or ADMIN");
        }
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent deleting an ADMIN account
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete an ADMIN account");
        }

        // If this user was an agent: unassign all tickets they are handling
        List<Ticket> assignedTickets = ticketRepository.findByAssignedAgent(user);
        for (Ticket ticket : assignedTickets) {
            ticket.setAssignedAgent(null);
            ticketRepository.save(ticket);
        }

        // If this user submitted tickets: nullify ties safely
        // Tickets remain in the system but are marked with a deleted user note via null agent
        // (their userName text field on TicketResponse will remain from DB snapshot)
        // Delete the user's comments first to respect FK constraints
        commentRepository.deleteAllByUser(user);

        // Delete tickets owned by the user (cascade unassigns them)
        List<Ticket> ownedTickets = ticketRepository.findByUser(user);
        for (Ticket ticket : ownedTickets) {
            // Remove any assigned agent links on tickets they own
            ticket.setAssignedAgent(null);
            ticketRepository.save(ticket);
        }
        ticketRepository.deleteAll(ownedTickets);

        userRepository.delete(user);
    }
}
