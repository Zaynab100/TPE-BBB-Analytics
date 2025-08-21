import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Box,
    Grid,
    Card,
    CardContent,
    TablePagination,
    Container,
    Chip,
    Avatar,
    Fade,
    Zoom, Grow
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    Assignment,
    Person,
    Timeline
} from '@mui/icons-material';
import {StyledCard, StyledTableCell, StyledTableRow} from "../compenent/atoms/styles.js";
import {Users, School, Video, Star} from "lucide-react";
import {handleChangePage, handleChangeRowsPerPage} from "../utils/pagination.jsx";
import {handleNavigation} from "../utils/navigation.jsx";


const User_page = () => {
    const {user_id} = useParams();
    const [userData, setUserData] = useState({
        user_name: '',
        scores_by_session: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [page, setPage] = useState(0);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await axios.get(`/api/${user_id}/AllSessionScores`);
                setUserData(response.data);
            } catch (err) {
                console.error(err);
                setError('Erreur lors de la récupération des scores.');
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [user_id]);

    const scores = userData.scores_by_session || [];

    if (loading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="60vh"
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2
                }}
            >
                <CircularProgress size={60} sx={{color: 'white', mb: 2}}/>
                <Typography variant="h6" sx={{color: 'white', opacity: 0.9}}>
                    Chargement des données...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{mt: 4}}>
                <Alert
                    severity="error"
                    sx={{
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                            fontSize: '2rem'
                        }
                    }}
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    // Calculs améliorés
    const totalSessions = scores.length;
    const averageScore = scores.reduce((acc, cur) => acc + cur.score, 0) / totalSessions || 0;
    const bestScore = Math.max(...scores.map(s => s.score));


    const getScoreColor = (score) => {
        if (score >= 70) return '#4caf50';
        if (score >= 40) return '#ff9800';
        return '#f44336';
    };
    const StatCards = [

        {
            title: 'Sessions totales',
            value: totalSessions,
            icon: Assignment,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            iconColor: '#f5576c'
        }, {
            title: 'Score moyen',
            value: averageScore.toFixed(1) +'%',
            icon: School,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            iconColor: '#667eea'
        }, {
            title: 'Meilleur score',
            value: bestScore.toFixed(1)+'%',
            icon: Star,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            iconColor: '#667eea'
        },
    ];


    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: 3
        }}>
            {/* En-tête avec avatar et nom */}
            <Box sx={{mb: 4, textAlign: 'center'}}>
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
                    {userData.user_name}
                </Typography>

            </Box>
            {/* Cartes de statistiques */}
            <Grid container spacing={2} sx={{mb: 2}} justifyContent="center">
                {StatCards.map((stat, index) => (
                    <Grid item xs={12} sm={4} md={3} key={index}>
                        <StyledCard>
                            <CardContent sx={{p: 2}}>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <Box>
                                        <Typography variant="h6" sx={{fontWeight: 600, mb: 0.5}}>
                                            {stat.value.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" sx={{opacity: 0.8}}>
                                            {stat.title}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        width: 40,
                                        height: 40,
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <stat.icon size={20}/>
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>


            {/* Section graphique et tableau */}
            <Grid container spacing={4}>
                <Grid item xs={12} lg={7}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                            border: '1px solid rgba(33, 150, 243, 0.1)'
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                            <Timeline sx={{mr: 2, color: '#2196F3'}}/>
                            <Typography variant="h5" sx={{fontWeight: 600, color: '#333'}}>
                                Évolution des performances
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={scores}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#2196F3" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff"/>
                                <XAxis
                                    dataKey="session_name"
                                    tick={{fontSize: 12}}
                                    stroke="#666"
                                />
                                <YAxis tick={{fontSize: 12}} stroke="#666"/>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e0e7ff',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#2196F3"
                                    strokeWidth={3}
                                    fill="url(#colorScore)"
                                    dot={{fill: '#2196F3', r: 5}}
                                    activeDot={{r: 7, stroke: '#2196F3', strokeWidth: 2}}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                            border: '1px solid rgba(33, 150, 243, 0.1)',
                            height: 'fit-content'
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                            <Assignment sx={{mr: 2, color: '#2196F3'}}/>
                            <Typography variant="h5" sx={{fontWeight: 600, color: '#333'}}>
                                Détails des sessions
                            </Typography>
                        </Box>
                        <TableContainer sx={{maxHeight: 350}}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell sx={{fontWeight: 700}}>
                                            Session
                                        </StyledTableCell>
                                        <StyledTableCell sx={{fontWeight: 700}}>
                                            Score
                                        </StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {scores
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => (
                                            <StyledTableRow
                                                key={row.session_id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(33, 150, 243, 0.04)'
                                                    }
                                                }}
                                            >
                                                <StyledTableCell onClick={() => {
                                                    handleNavigation(navigate,`/Session/${row.session_id}`);
                                                }}>
                                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                        <Avatar
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                mr: 1,
                                                                backgroundColor: getScoreColor(row.score),
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            {index + 1 + page * rowsPerPage}
                                                        </Avatar>
                                                        {row.session_name}
                                                    </Box>
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    <Chip
                                                        label={`${row.score.toFixed(1)}%`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getScoreColor(row.score),
                                                            color: 'white',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15, 25]}
                            component="div"
                            count={scores.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={ handleChangePage(setPage)}
                            onRowsPerPageChange={handleChangeRowsPerPage(setRowsPerPage, setPage)}
                            sx={{
                                borderTop: '1px solid rgba(224, 224, 224, 0.5)',
                                mt: 2,
                                pt: 2
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default User_page;