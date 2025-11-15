package com.myfinbank.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "REFRESH_TOKENS")
public class RefreshToken {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "ID", nullable = false)
  private Long id;
  @NotNull
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "USER_ID", nullable = false)
  private User user;

  @Size(max = 512)
  @NotNull
  @Column(name = "TOKEN", nullable = false, length = 512)
  private String token;

  @NotNull
  @Column(name = "EXPIRY_DATE", nullable = false)
  private Date expiryDate;

  @ColumnDefault("CURRENT_TIMESTAMP")
  @Column(name = "CREATED_AT")
  private Date createdAt;

}
