import {Box, Drawer, useMediaQuery, useTheme} from "@mui/material";
import {SideNav} from "./compenent/sidenav.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Sessions from "./pages/Sessions.jsx";
import Acceuil from "./pages/Acceuil.jsx";
import Users from "./pages/Users.jsx";
import Session from "./pages/Session.jsx";
import User from "./pages/user.jsx";
import User_page from "./pages/User_page.jsx";

function App() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <BrowserRouter>
            {!isMobile && (
                <Drawer
                    sx={{
                        width: '100%',
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 240,
                            boxSizing: 'border-box',
                            bgcolor: '#3b3f91'
                        },
                    }}
                    variant="permanent"
                    anchor="left"
                >
                    <SideNav isMobile={false}/>
                </Drawer>
            )}

            {/* Contenu principal */}
            <Box
                component="main"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: isMobile ? '1rem' : '15rem',
                    marginBottom: isMobile ? '56px' : 0
                }}
            >
                <Routes>
                    <Route path="/" element={<Acceuil/>}/>
                    <Route path="/Sessions" element={<Sessions/>}/>
                    <Route path="/Users" element={<Users/>}/>
                    <Route path="/Session/:session_id" element={<Session/>}/>
                    <Route path="/Session/:session_id/User/:user_id" element={<User/>}/>
                    <Route path="/users/:user_id" element={<User_page/>}/>

                </Routes>
            </Box>

            {isMobile && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        bgcolor: '#3b3f91'
                    }}
                >
                    <SideNav isMobile={true}/>
                </Box>
            )}
        </BrowserRouter>
    );
}

export default App;