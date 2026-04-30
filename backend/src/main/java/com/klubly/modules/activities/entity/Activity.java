package com.klubly.modules.activities.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.klubly.common.entities.NamedEntity;
import com.klubly.modules.identity.entity.Team;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "activities")
@Getter
@Setter
public class Activity extends NamedEntity {
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private Integer capacity;

    private String location;

    @ManyToMany
    @JoinTable(
        name = "activity_teams",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "team_id")
    )
    private List<Team> teams = new ArrayList<>();

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL)
    private List<Registration> registrations = new ArrayList<>();
}
