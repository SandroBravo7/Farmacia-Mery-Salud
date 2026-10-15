package com.merysalud.security;

import com.merysalud.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;

    public JwtService(@Value("${mery.jwt.secret}") String secret) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("MERY_JWT_SECRET debe tener al menos 32 bytes.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issue(Usuario user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer("mery-salud-local")
                .subject(user.getEmail())
                .claim("role", role(user.getRolId()))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(7200)))
                .signWith(key)
                .compact();
    }

    public Claims verify(String token) {
        return Jwts.parser().verifyWith(key).requireIssuer("mery-salud-local")
                .build().parseSignedClaims(token).getPayload();
    }

    public static String role(Long id) {
        return id != null && id == 1L ? "ADMIN" : id != null && id == 2L ? "REPARTIDOR" : "CLIENTE";
    }
}
