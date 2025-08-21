import {Button, styled} from "@mui/material";

const ModernButton = styled(Button)(({theme}) => ({
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