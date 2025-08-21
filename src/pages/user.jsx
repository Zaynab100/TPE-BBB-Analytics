import React from 'react';
import {Card, CardContent, Grid, Typography, Box} from '@mui/material';
import WebCam_UserSession from "../compenent/webCam_userSession.jsx";
import UserSession_onlineTime from "../compenent/UserSession_onlineTime.jsx";
import ReactionUserSession from "../compenent/reaction_UserSession.jsx";
import {EmojiUserSession} from "../compenent/emoji_userSession.jsx";
import UserSession_talkTime from "../compenent/UserSession_talkTime.jsx";
import {useLocation} from 'react-router-dom';

const User = () => {
    const location = useLocation();
    const session_name = location.state?.session_name;
    console.log("session_name", location.state);
    const user_name = location.state?.user_name;
    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: 3
        }}> <Box sx={{mb: 4, textAlign: 'center'}}>
            <Typography
                variant="h3"
                sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}
            >
                {user_name} </Typography>
            <Typography variant="h6" sx={{color: '#64748b', fontWeight: 300}}>
                Analyse complète des interactions et performances en {session_name}                </Typography>
        </Box>
            <Grid
                container
                spacing={2}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                    '@media (max-width: 600px)': {
                        gridTemplateColumns: '1fr',
                    }
                }}
            >

                {/* Première colonne: WebCam_UserSession */}
                <Grid item xs={12} md={6}>
                    <WebCam_UserSession/>
                </Grid>

                {/* Deuxième colonne: ReactionUserSession + EmojiUserSession */}
                <Grid item xs={12} sm={6}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <EmojiUserSession/>
                        </Grid>
                        <Grid item>
                            <ReactionUserSession/>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                    <UserSession_talkTime/>
                </Grid> <Grid item xs={12} md={6}>
                <UserSession_onlineTime/>
            </Grid>


            </Grid>
        </Box>
    );
};

export default User;