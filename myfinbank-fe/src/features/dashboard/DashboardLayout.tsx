import { Outlet, useNavigate } from 'react-router-dom';
import {
    Box,
    CssBaseline,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    AppBar,
    Typography,
    Divider,
    Tooltip,
    Avatar
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SavingsIcon from '@mui/icons-material/Savings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import { useAppSelector } from '../../app/hooks';
import { performLogout } from '../../api/axiosClient.ts';

const drawerWidth = 300;

const userMenuItems = [
    { label: 'Menu', path: '/dashboard', icon: <HomeIcon /> },
    { label: 'Conti', path: 'conti', icon: <AccountBalanceIcon /> },
    { label: 'Carte', path: 'carte', icon: <AccountBalanceIcon /> },
    { label: 'Operazioni', path: 'operazioni', icon: <SwapHorizIcon /> },
    { label: 'Finanziamenti', path: 'finanziamenti', icon: <AssignmentIcon /> },
    { label: 'Investimenti', path: 'investimenti', icon: <SavingsIcon /> },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const user = useAppSelector(state => state.auth.user);
    const secondsLeft = useAppSelector(state => state.auth.sessionSecondsLeft);

    const handleLogout = async () => {
        await performLogout(navigate);
    };

    const formatTime = (sec: number) => {
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        return `${min}:${s.toString().padStart(2, '0')}`;
    };

    const formattedAccess = user?.ultimoAccesso
        ? new Date(user.ultimoAccesso).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'N/D'

    const getRuoloLabel = (ruolo?: string): string => {
        switch (ruolo) {
            case "ROLE_ADMIN":
                return "Amministratore";
            case "ROLE_MANAGER":
                return "Manager";
            case "ROLE_USER":
                return "Profilo standard";
            default:
                return "Utente";
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* TOP BAR */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: theme => theme.zIndex.drawer + 1,
                    bgcolor: 'primary.main',
                    height: 72,
                    justifyContent: 'center',
                    px: 3
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Session bar a sinistra */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 180 }}>
                        {secondsLeft !== null && secondsLeft >= 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" color="inherit" sx={{ whiteSpace: 'nowrap' }}>
                                    Durata sessione: {formatTime(secondsLeft)}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Nome applicazione al centro */}
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            fontWeight: 'bold',
                            textAlign: 'center',
                            flexGrow: 1,
                            color: 'white',
                            letterSpacing: 1,
                        }}
                    >
                        My Fin Bank
                    </Typography>

                    {/* Profilo utente a destra */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {user && (
                            <Tooltip title="Profilo utente">
                                <Avatar
                                    sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }}
                                    onClick={() => navigate('/dashboard/profile')}
                                >
                                    {user?.nome && user?.cognome
                                        ? `${user.nome[0]}${user.cognome[0]}`.toUpperCase()
                                        : 'U'}
                                </Avatar>
                            </Tooltip>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer
                variant="permanent"
                role="navigation"
                aria-label="Menu principale"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    },
                }}
            >
                <Box>
                    <Toolbar />
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {user?.nome} {user?.cognome}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            {getRuoloLabel(user?.ruolo)}
                        </Typography>
                    </Box>
                    <Divider />

                    <List>
                        {userMenuItems.map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton onClick={() => navigate(item.path)}>
                                    <ListItemIcon sx={{ color: 'black' }}>{item.icon}</ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontSize: '1.3rem',
                                            fontWeight: 500,
                                            letterSpacing: 0.3,
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Footer: ultimo accesso e logout */}
                <Box sx={{ p: 2, borderTop: '1px solid #ddd' }}>
                    <Typography variant="subtitle1" color="text.secondary" display="block">
                        Ultimo accesso:  {formattedAccess}
                    </Typography>
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon color="error" />
                            </ListItemIcon>
                            <ListItemText primary="Logout" primaryTypographyProps={{
                                fontSize: '1.3rem',
                                fontWeight: 500,
                                letterSpacing: 0.3,
                            }}/>
                        </ListItemButton>
                    </ListItem>
                </Box>
            </Drawer>

            {/* Contenuto principale */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    bgcolor: '#f9f9f9',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
