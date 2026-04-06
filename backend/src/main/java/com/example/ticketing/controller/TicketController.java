package com.example.ticketing.controller;

import com.example.ticketing.dto.CommentRequest;
import com.example.ticketing.dto.RateTicketRequest;
import com.example.ticketing.dto.ReassignTicketRequest;
import com.example.ticketing.dto.StatusUpdateRequest;
import com.example.ticketing.dto.TicketRequest;
import com.example.ticketing.dto.TicketResponse;
import com.example.ticketing.model.entity.User;
import com.example.ticketing.model.enums.Role;
import com.example.ticketing.repository.UserRepository;
import com.example.ticketing.service.TicketService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketService ticketService;
    private final UserRepository userRepository;

    public TicketController(TicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    // Returns list of agents for reassignment — accessible by any authenticated user
    @GetMapping("/agents")
    public ResponseEntity<List<Map<String, Object>>> getAgents() {
        List<Map<String, Object>> agents = userRepository.findAllByRole(Role.AGENT)
                .stream()
                .map(u -> Map.<String, Object>of("id", u.getId(), "name", u.getName()))
                .toList();
        return ResponseEntity.ok(agents);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TicketResponse> createTicket(@RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    // Optional backend filters: ?status=&priority=&userName=&agentName=
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String agentName) {
        List<TicketResponse> tickets = ticketService.getAllTickets();

        // Apply optional server-side filters (role-scoped list is already returned by service)
        if (status != null && !status.isBlank()) {
            tickets = tickets.stream()
                    .filter(t -> t.getStatus().toString().equalsIgnoreCase(status))
                    .toList();
        }
        if (priority != null && !priority.isBlank()) {
            tickets = tickets.stream()
                    .filter(t -> t.getPriority().toString().equalsIgnoreCase(priority))
                    .toList();
        }
        if (userName != null && !userName.isBlank()) {
            tickets = tickets.stream()
                    .filter(t -> t.getUserName() != null && t.getUserName().toLowerCase().contains(userName.toLowerCase()))
                    .toList();
        }
        if (agentName != null && !agentName.isBlank()) {
            tickets = tickets.stream()
                    .filter(t -> t.getAssignedAgentName() != null && t.getAssignedAgentName().toLowerCase().contains(agentName.toLowerCase()))
                    .toList();
        }

        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request.getStatus()));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> takeOwnership(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.takeOwnership(id));
    }

    @PutMapping("/{id}/reassign")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> reassignTicket(@PathVariable Long id, @RequestBody ReassignTicketRequest request) {
        return ResponseEntity.ok(ticketService.reassignTicket(id, request.getAgentId()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        ticketService.addComment(id, request);
        return ResponseEntity.ok("Comment added successfully!");
    }

    @PutMapping("/{id}/rate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> rateTicket(@PathVariable Long id, @RequestBody RateTicketRequest request) {
        ticketService.rateTicket(id, request.getRating());
        return ResponseEntity.ok("Ticket rated successfully!");
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<TicketResponse> uploadFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ticketService.uploadFile(id, file));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) throws Exception {
        Resource resource = ticketService.downloadFile(id);
        String contentType = "application/octet-stream";
        try {
            contentType = resource.getFile().toPath().toUri().toURL().openConnection().getContentType();
        } catch (Exception ignored) {}

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
