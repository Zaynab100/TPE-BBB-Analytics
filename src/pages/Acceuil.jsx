import React, {useEffect, useState} from 'react';
import {
    Box,
    Grid,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Grow
} from "@mui/material";
import {
    Users,
    Video,
    TrendingUp,
    Clock,
    Award,
    Activity
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {GlassCard, StyledCard, StyledTableCell, StyledTableRow} from "../compenent/atoms/styles.js";
import {handleNavigation} from "../utils/navigation.jsx";

const Acceuil = () => {


const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [derniersSessions, setDerniersSessions] = useState([]);
    const navigate = useNavigate();
const [topActiveUsers, setTopActiveUsers] = useState([]);

    useEffect(() => {
   const fetchUsersAndScores = async () => {
        try {
            const usersResponse = await fetch(`/api/GetUser`);
            const usersData = await usersResponse.json();

            const usersWithScores = await Promise.all(usersData.map(async (user) => {
                const res = await fetch(`/api/${user[0]}/AllSessionScores`);
                if (!res.ok) return null;

                const data = await res.json();
                const scores = data.scores_by_session.map(s => s.score);
                const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

                return {
                    user_id: data.user_id,
                    user_name: data.user_name,
                    average_score: Number(average.toFixed(2))
                };
            }));

            const filtered = usersWithScores
                .filter(Boolean)
                .sort((a, b) => b.average_score - a.average_score)
                .slice(0, 20);

            setTopActiveUsers(filtered);
        } catch (error) {
            console.error('Erreur lors du calcul des utilisateurs actifs :', error);
        }
    };

    fetchUsersAndScores();

 const fetchSessions = async () => {
            try {
                const response = await fetch(`/api/GetSession`);
                if (!response.ok) throw new Error('Erreur API');
                const data = await response.json();
                const sorted = data.sort((a, b) => b[3] - a[3]);
                const derniersSessions = sorted.slice(0, 20);
                setSessions(data);
                setDerniersSessions(derniersSessions);
            } catch (error) {
                console.error('Erreur : ', error);
            }
        };
        fetchSessions();
    }, []);

    const StatCards = [
        {
            title: 'Utilisateurs',
            value: 631, // Valeur fixe ou à changer selon ton besoin
            icon: Users,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            iconColor: '#667eea'
        },
        {
            title: 'Sessions',
            value: sessions.length,
            icon: Video,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            iconColor: '#f5576c'
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: 3 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}>
                    Dashboard BigBlueButton
                </Typography>
                <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 300 }}>
                    Tableau de bord des sessions et utilisateurs
                </Typography>
            </Box>
           <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
                {StatCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <Grow in timeout={600 + index * 200}>
                            <StyledCard>
                                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {stat.value.toLocaleString()}
                                            </Typography>
                                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                                {stat.title}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            width: 64,
                                            height: 64,
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <stat.icon size={32} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        </Grow>
                    </Grid>
                ))}
            </Grid>

            <Grid  container spacing={3} sx={{ flexWrap: 'nowrap' }}>
                <Grid item xs={12} lg={6}>
                    <GlassCard>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)', color: '#667eea', mr: 2 }}>
                                    <Clock size={24} />
                                </Avatar>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    20 Dernières Sessions
                                </Typography>
                            </Box>

                            <Paper elevation={0} sx={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid rgba(102, 126, 234, 0.1)'
                            }}>
                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>Nom de la Session</StyledTableCell>
                                                <StyledTableCell align="center">Date de Création</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {derniersSessions.map((session) => (
                                                <StyledTableRow key={session[0]} onClick={() => handleNavigation(navigate, `/Session/${session[0]}`)} style={{ cursor: 'pointer' }}>
                                                    <StyledTableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar sx={{ bgcolor: 'rgba(245, 87, 108, 0.1)', color: '#f5576c', width: 32, height: 32, mr: 2 }}>
                                                                <Video size={16} />
                                                            </Avatar>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {session[1]}
                                                            </Typography>
                                                        </Box>
                                                    </StyledTableCell>
                                                    <StyledTableCell align="center">
                                                        <Chip
                                                            label={new Date(session[3]).toLocaleString()}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'rgba(102, 126, 234, 0.1)',
                                                                color: '#667eea',
                                                                fontWeight: 500
                                                            }}
                                                        />
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </CardContent>
                    </GlassCard>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <GlassCard>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar sx={{ bgcolor: 'rgba(245, 87, 108, 0.1)', color: '#f5576c', mr: 2 }}>
                                    <Award size={24} />
                                </Avatar>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    Top 20 Utilisateurs Actifs
                                </Typography>
                            </Box>

                            <Paper elevation={0} sx={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid rgba(245, 87, 108, 0.1)'
                            }}>
                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>Utilisateur</StyledTableCell>
                                                <StyledTableCell align="center">Score Moyen</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topActiveUsers.map((user, index) => (
                                                <StyledTableRow key={user.user_id}>
                                                    <StyledTableCell onClick={() => handleNavigation(navigate, `/Users/${user.user_id}`)} style={{ cursor: 'pointer' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar sx={{
                                                                bgcolor: index < 3 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.1)',
                                                                color: index < 3 ? 'white' : '#667eea',
                                                                width: 32,
                                                                height: 32,
                                                                mr: 2,
                                                                fontSize: '0.8rem',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {index + 1}
                                                            </Avatar>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {user.user_name}
                                                            </Typography>
                                                        </Box>
                                                    </StyledTableCell>
                                                    <StyledTableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Chip
                                                                label={`${user.average_score}%`}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: user.average_score >= 70 ? 'rgba(34, 197, 94, 0.1)' :
                                                                        user.average_score >= 40 ? 'rgba(249, 115, 22, 0.1)' :
                                                                            'rgba(239, 68, 68, 0.1)',
                                                                    color: user.average_score >= 70 ? '#22c55e' :
                                                                        user.average_score >= 40 ? '#f97316' :
                                                                            '#ef4444',
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                            {index < 3 && (
                                                                <TrendingUp
                                                                    size={16}
                                                                    style={{ marginLeft: 8, color: '#22c55e' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </CardContent>
                    </GlassCard>
                </Grid>
            </Grid>
        </Box>
    );
};
export default Acceuil;