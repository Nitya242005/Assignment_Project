package com.example.ticketing.dto;

public class RateTicketRequest {
    private Integer rating;

    public RateTicketRequest() {}

    public RateTicketRequest(Integer rating) {
        this.rating = rating;
    }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
