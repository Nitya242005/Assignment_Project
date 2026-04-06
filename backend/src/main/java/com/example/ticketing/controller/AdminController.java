package com.example.ticketing.controller;

import com.example.ticketing.dto.AssignTicketRequest;
import com.example.ticketing.dto.UserRoleUpdateRequest;
import com.example.ticketing.model.entity.User;
import com.example.ticketing.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/assign-ticket")
    public ResponseEntity<?> assignTicket(@RequestBody AssignTicketRequest request) {
        adminService.assignTicket(request);
        return ResponseEntity.ok("Ticket assigned successfully!");
    }

    @PutMapping("/update-role")
    public ResponseEntity<?> updateRole(@RequestBody UserRoleUpdateRequest request) {
        adminService.updateUserRole(request);
        return ResponseEntity.ok("Role updated successfully!");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully!");
    }
}
