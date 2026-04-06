package com.example.ticketing.repository;

import com.example.ticketing.model.entity.Comment;
import com.example.ticketing.model.entity.Ticket;
import com.example.ticketing.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketOrderByCreatedAtAsc(Ticket ticket);
    void deleteAllByUser(User user);
    void deleteAllByTicketIn(List<Ticket> tickets);
}
