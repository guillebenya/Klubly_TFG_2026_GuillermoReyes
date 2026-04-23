package com.klubly.modules.inventory.entity;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import com.klubly.common.entities.NamedEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "items", uniqueConstraints = { @UniqueConstraint(columnNames = {"name", "deletedAt"}) } )
@Getter
@Setter
@NoArgsConstructor
@SQLDelete(sql = "UPDATE items SET deleted_at = NOW(), active = false WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Item extends NamedEntity {

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @Column(name = "min_stock", nullable = false)
    private int minStock;

    @Column(name = "location", length = 100)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
