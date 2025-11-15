import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

type Props = {
    open: boolean;
    secondsLeft?: number | null;
    onRefresh: () => void;
    onLogout: () => void;
};

export default function SessionExpiryDialog({ open, onRefresh, onLogout }: Props) {
    return (
        <Dialog open={open}>
            <DialogTitle>Sessione scaduta</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, boxSizing:20 }}>
                    Rinnovare per continuare?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onLogout} color="error">Logout</Button>
                <Button onClick={onRefresh} variant="contained">Continua</Button>
            </DialogActions>
        </Dialog>
    );
}
