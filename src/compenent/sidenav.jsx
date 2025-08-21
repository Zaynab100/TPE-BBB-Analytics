import { Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Event, Home } from "@mui/icons-material";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import logo from '../assets/logo1.png';
import { useNavigate } from "react-router-dom";
import {handleNavigation} from "../utils/navigation.jsx";

export const SideNav = ({ isMobile }) => {
    const navigate = useNavigate();
    const menuItems = [
        { icon: <Home sx={{ color: 'white' }} />, text: "Accueil", path: "/" },
        { icon: <Event sx={{ color: 'white' }} />, text: "Sessions", path: "/Sessions" },
        { icon: <Diversity3Icon sx={{ color: 'white' }} />, text: "Utilisateurs", path: "/Users" }
    ];

    if (isMobile) {
        return (
            <List
                sx={{
                    display: 'flex',
                    p: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    overflow: 'hidden',
                    position: 'fixed',
                    bottom: 0,
                    width: '100%',
                    zIndex: 1000,
                }}
            >
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ flex: 1 }}>
                        <Box
                            onClick={() => handleNavigation(navigate,item.path)}
                            sx={{
                                flex: 1,
                                py: 1,
                                textAlign: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 'auto', color: 'white' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={{
                                    '& .MuiTypography-root': {
                                        fontSize: '0.75rem',
                                        color: 'white'
                                    }
                                }}
                            />
                        </Box>
                    </ListItem>
                ))}
            </List>
        );
    }

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100vh',
                width: 240,
                position: 'fixed',
                top: 0,
                left: 0,
                color: 'white',
                overflow: 'hidden',
                zIndex: 1200
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <img src={logo} alt="Logo" style={{ width: '100%', height: 'auto' }} />
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        disablePadding
                        sx={{
                            px: 3,
                            py: 1.5,
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                        onClick={() => handleNavigation(navigate,item.path)}
                    >
                        <ListItemIcon sx={{ color: 'white' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            sx={{
                                '& .MuiTypography-root': {
                                    color: 'white',
                                    fontWeight: 500
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};