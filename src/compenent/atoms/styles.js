import {Button, Card, TableCell, TableRow} from '@mui/material';
import {styled, tableCellClasses} from '@mui/material';

export const StyledCard = styled(Card)(({theme}) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none',
    },
}));

export const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        transition: 'all 0.2s ease',
    },
}));

export const StyledTableRow = styled(TableRow)(({theme}) => ({
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.08)',
        transform: 'scale(1.01)',
    },
    '&:nth-of-type(even)': {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    cursor: 'pointer',
}));

export const GlassCard = styled(Card)(({theme}) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
    },
}));
export const ModernButton = styled(Button)(({theme}) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '12px 24px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
    },
}));
