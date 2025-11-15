import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Avatar, IconButton, Menu, MenuItem, ListItemIcon, Tooltip, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAppSelector} from '../../app/hooks'
import { useNavigate } from 'react-router-dom'
import {performLogout} from "../../api/axiosClient.ts";

export default function UserMenu() {
    const user = useAppSelector(state => state.auth.user)
    const navigate = useNavigate()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleProfile = () => {
        handleClose()
        navigate('/profile')
    }

    const handleLogout = async () => {
        handleClose()
        await performLogout(navigate);
    }

    const avatarContent = user?.nome && user?.cognome
        ? user.nome[0].toUpperCase() + user.cognome[0].toUpperCase()
        : user?.email?.[0].toUpperCase() || '?'

    return (
        <>
            <Tooltip title="Profilo utente">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar sx={{ width: 32, height: 32 }}>
                        {avatarContent}
                    </Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="user-menu"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 2,
                    sx: { mt: 1.5, minWidth: 180 }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit">Profilo</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit">Logout</Typography>
                </MenuItem>
            </Menu>
        </>
    )
}
