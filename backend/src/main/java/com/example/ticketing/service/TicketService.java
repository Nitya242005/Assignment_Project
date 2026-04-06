package com.example.ticketing.service;

import com.example.ticketing.dto.*;
import com.example.ticketing.model.entity.Comment;
import com.example.ticketing.model.entity.Ticket;
import com.example.ticketing.model.entity.User;
import com.example.ticketing.model.enums.Role;
import com.example.ticketing.model.enums.TicketStatus;
import com.example.ticketing.repository.CommentRepository;
import com.example.ticketing.repository.TicketRepository;
import com.example.ticketing.repository.UserRepository;
import com.example.ticketing.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final EmailService emailService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository,
                         CommentRepository commentRepository, EmailService emailService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.emailService = emailService;
    }

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public TicketResponse createTicket(TicketRequest request) {
        User user = getCurrentUser();
        Ticket ticket = Ticket.builder()
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .user(user)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        emailService.sendTicketCreated(savedTicket);
        return mapToResponse(savedTicket);
    }

    public List<TicketResponse> getAllTickets() {
        User user = getCurrentUser();
        List<Ticket> tickets;

        if (user.getRole() == Role.ADMIN) {
            tickets = ticketRepository.findAll();
        } else if (user.getRole() == Role.AGENT) {
            tickets = ticketRepository.findByAssignedAgentOrAssignedAgentIsNull(user);
        } else {
            tickets = ticketRepository.findByUser(user);
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User user = getCurrentUser();
        if (user.getRole() == Role.USER && !ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Forbidden");
        }

        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse updateStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);
        Ticket saved = ticketRepository.save(ticket);
        emailService.sendStatusChanged(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public TicketResponse takeOwnership(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User user = getCurrentUser();
        if (ticket.getAssignedAgent() == null) {
            ticket.setAssignedAgent(user);
            Ticket saved = ticketRepository.save(ticket);
            emailService.sendTicketAssigned(saved);
            return mapToResponse(saved);
        }
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse reassignTicket(Long id, Long agentId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User currentUser = getCurrentUser();
        // ADMIN can reassign any; AGENT can only reassign if they own it
        if (currentUser.getRole() == Role.AGENT) {
            if (ticket.getAssignedAgent() == null || !ticket.getAssignedAgent().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You can only reassign tickets assigned to you");
            }
        }

        User newAgent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (newAgent.getRole() != Role.AGENT) {
            throw new RuntimeException("Target user must have AGENT role");
        }

        ticket.setAssignedAgent(newAgent);
        Ticket saved = ticketRepository.save(ticket);
        emailService.sendTicketAssigned(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public void addComment(Long id, CommentRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User user = getCurrentUser();
        Comment comment = Comment.builder()
                .message(request.getMessage())
                .ticket(ticket)
                .user(user)
                .build();

        commentRepository.save(comment);
    }

    @Transactional
    public void rateTicket(Long id, Integer rating) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User user = getCurrentUser();
        if (user.getRole() != Role.USER || !ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Forbidden");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new RuntimeException("Ticket must be resolved or closed to rate");
        }

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        ticket.setRating(rating);
        ticketRepository.save(ticket);
    }

    @Transactional
    public TicketResponse uploadFile(Long id, MultipartFile file) throws IOException {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Validate file size (5MB max)
        long maxSizeBytes = 5L * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            throw new RuntimeException("File size exceeds the 5MB limit");
        }

        // Validate file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new RuntimeException("Invalid filename");
        }
        String ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        Set<String> allowed = Set.of("png", "jpg", "jpeg", "pdf");
        if (!allowed.contains(ext)) {
            throw new RuntimeException("File type not allowed. Accepted: PNG, JPG, PDF");
        }

        // Create upload directory if needed
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // UUID-based unique filename
        String storedFilename = "ticket_" + id + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10) + "." + ext;
        Path targetLocation = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        ticket.setAttachmentPath(storedFilename);
        return mapToResponse(ticketRepository.save(ticket));
    }

    public Resource downloadFile(Long id) throws MalformedURLException {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getAttachmentPath() == null) {
            throw new RuntimeException("No attachment for this ticket");
        }

        // Authorization check
        User user = getCurrentUser();
        if (user.getRole() == Role.USER && !ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Forbidden");
        }

        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(ticket.getAttachmentPath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found on server");
        }
        return resource;
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        List<CommentResponse> comments = commentRepository.findByTicketOrderByCreatedAtAsc(ticket)
                .stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getMessage(),
                        comment.getUser().getName(),
                        comment.getCreatedAt()))
                .collect(Collectors.toList());

        return new TicketResponse(
                ticket.getId(),
                ticket.getSubject(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getUser().getName(),
                ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getName() : "Unassigned",
                comments,
                ticket.getRating(),
                ticket.getAttachmentPath());
    }
}
