package com.myfinbank.security;

import com.myfinbank.exception.ExpiredTokenException;
import com.myfinbank.exception.InvalidTokenException;
import com.myfinbank.exception.MissingTokenException;
import com.myfinbank.service.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil, CustomUserDetailsService customUserDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        logger.info("Request received for URI: {}", request.getRequestURI());

        String header = request.getHeader("Authorization");
        logger.info("Authorization header: {}", header);

        if (header == null || !header.startsWith("Bearer ")) {
            throw new MissingTokenException("Token mancante nell'header Authorization");
        }

        String token = header.substring(7);
        logger.info("Extracted token: {}", token);

        try {
            jwtTokenUtil.validateToken(token);
            String username = jwtTokenUtil.getUsernameFromToken(token);
            logger.info("Valid token for user: {}", username);

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(auth);
            logger.info("Authentication set successfully for user: {}", username);

        } catch (ExpiredJwtException ex) {
            throw new ExpiredTokenException("Il token fornito è scaduto");
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException ex) {
            throw new InvalidTokenException("Il token fornito non è valido");
        } catch (IllegalArgumentException ex) {
            throw new InvalidTokenException("Il token fornito non è valido o vuoto");
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Esclude alcune rotte dal filtro JWT
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        return path.startsWith("/api/auth/")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/refresh")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-resources")
                || path.equals("/favicon.ico");
    }
}
