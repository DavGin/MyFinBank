import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import SessionExpiryDialog from './SessionExpiryDialog';
import { useAppDispatch } from "../app/hooks.ts";
import type { RootState } from "../app/store.ts";
import {setAccessToken, setSessionSecondsLeft} from "./auth/authSlice.ts";
import { getExpiryTimestamp } from "../utils/jwt.ts";
import {useNavigate} from "react-router-dom";
import {performLogout, refreshToken} from "../api/axiosClient.ts";
import {queryClient} from "../queryClient.ts";

const EXPIRE_WARNING_MS = 10 * 1000; // mostra avviso quando mancano 60s
const POLL_INTERVAL = 1000; // controllo ogni 1s per countdown

export default function SessionManager() {
    const navigate = useNavigate(); // Istanzia useNavigate per gestire il reindirizzamento
    const token = useSelector((state: RootState) => state.auth.accessToken);
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const expiryTs = getExpiryTimestamp(token);
    const activityRef = useRef<number>(Date.now());

    // Monitor attività utente per refresh se interagisce
    useEffect(() => {
        const resetActivity = () => {
            activityRef.current = Date.now();
        };

        window.addEventListener('click', resetActivity);
        window.addEventListener('keydown', resetActivity);

        return () => {
            window.removeEventListener('click', resetActivity);
            window.removeEventListener('keydown', resetActivity);

        };
    }, []);

    useEffect(() => {
        if (!expiryTs) {
            setOpen(false);
            setSecondsLeft(null);
            return;
        }

        let mounted = true;
        const tick = async () => {
            if (!mounted) return;

            const now = Date.now();
            const msLeft = expiryTs - now;

            setSecondsLeft(msLeft > 0 ? Math.floor(msLeft / 1000) : 0);

            if (msLeft <= EXPIRE_WARNING_MS && msLeft > 0) {
                setOpen(true);
            }
            if (msLeft <= 0) {
                setOpen(false);
                await performLogout(navigate);
            }
        };

        const interval = setInterval(tick, POLL_INTERVAL);
        tick();
        if (secondsLeft !== null) {
            dispatch(setSessionSecondsLeft(secondsLeft));
        }
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [expiryTs, secondsLeft, dispatch]);


    const attemptAutoRefresh = async () => {
        console.log('[SessionManager] Tentativo di refresh automatico del token...');
        try {
            const newToken = await refreshToken();

            if (newToken) {
                console.log('[SessionManager] Refresh riuscito. Nuovo token:', newToken);
                dispatch(setAccessToken(newToken));
                setOpen(false);
                return;
            }
            console.log('[SessionManager] Refresh non riuscito. Effettuare logout...');
            await performLogout(navigate);

        } catch (error) {
            console.error('[SessionManager] Errore durante il tentativo di refresh automatico:', error);
            await performLogout(navigate);
        }
    };

    // manual refresh (utente clicca "Continua")
    const handleRefresh = async () => {
        console.log('[SessionManager] L’utente ha cliccato "Continua".');
        setOpen(false);
        await attemptAutoRefresh();
        queryClient.refetchQueries({ queryKey: ['conti'] });
        queryClient.refetchQueries({ queryKey: ['listaTransazioni'] });
        queryClient.refetchQueries({ queryKey: ['finanziamenti'] });
    };

    const handleLogout = async () => {
        console.log('[SessionManager] L’utente ha cliccato "Logout".');
        await performLogout(navigate);
    };

    return (
        <SessionExpiryDialog
            open={open}
            secondsLeft={secondsLeft}
            onRefresh={handleRefresh}
            onLogout={handleLogout}
        />
    );
}
