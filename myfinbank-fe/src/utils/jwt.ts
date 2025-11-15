import { jwtDecode } from 'jwt-decode';

type JwtPayload = { exp?: number; iat?: number; sub?: string; roles?: string[] };

export function decodeToken(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return null;
    }
}

export function getExpiryTimestamp(token: string | null): number | null {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    return decoded.exp * 1000; // ms
}
