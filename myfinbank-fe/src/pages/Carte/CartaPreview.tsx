import debitCardImg from '/assets/cards/debito.png';
import prepagataImg from '/assets/cards/prepagata.jpg';
import creditoImg from '/assets/cards/credito.jpg';
import { Box, Typography } from '@mui/material';

type CardPreviewProps = {
    numeroCarta: string;
    nomeTitolare: string;
    dataScadenza: string;
    tipo: string;
    onClick?: () => void;
};

export default function CardPreview({ numeroCarta, nomeTitolare, dataScadenza, tipo, onClick }: CardPreviewProps) {
    const backgroundImg =
        tipo === 'CREDITO'
            ? creditoImg
            : tipo === 'PREPAGATA'
                ? prepagataImg
                : debitCardImg;

    return (
        <Box
            onClick={onClick}
            sx={{
                position: 'relative',
                width: 350,
                height: 220,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 6,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: onClick ? 'translateY(-5px)' : 'none',
                    boxShadow: onClick ? 10 : 6,
                },
            }}
        >
            {/* Immagine base */}
            <img
                src={backgroundImg}
                alt={`Carta ${tipo}`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 'inherit',
                }}
            />

            {/* Numero carta */}
            <Typography
                variant="h6"
                sx={{
                    position: 'absolute',
                    top: 105,
                    left: 24,
                    color: '#fff',
                    letterSpacing: 3,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                }}
            >
                {numeroCarta}
            </Typography>

            {/* Nome titolare */}
            <Typography
                variant="body2"
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: 25,
                    color: '#fff',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    fontSize: '1rem',
                }}
            >
                {nomeTitolare || 'CARDHOLDER NAME'}
            </Typography>

            {/* Scadenza */}
            <Typography
                variant="body2"
                sx={{
                    position: 'absolute',
                    top: 150,
                    right: 30,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                }}
            >
               Scad: {dataScadenza || 'MM/YY'}
            </Typography>

            {/* Etichetta tipo */}
            <Typography
                variant="body2"
                sx={{
                    position: 'absolute',
                    top: 10,
                    left: 235,
                    // bgcolor: 'rgba(0,0,0,0.4)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'lowercase',
                    fontSize: '1.5rem',
                }}
            >
                {tipo}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    position: 'absolute',
                    top: 10,
                    left: 18,
                    // bgcolor: 'rgba(0,0,0,0.4)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '1.5rem',
                }}
            >
                MyFinBank
            </Typography>
        </Box>
    );
}
