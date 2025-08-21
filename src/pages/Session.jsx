import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";

import jsPDF from "jspdf";
import "jspdf-autotable";

import {
    Table, TableBody,
    TableContainer, TableHead, TablePagination, TableRow, Grid,
    Card, CardContent, Typography, Box, Grow, Avatar, Paper, Chip
} from "@mui/material";
import {
    Users,
    Monitor,
    FileText,
    BarChart3,
    Clock,
    Download,
    CheckCircle,
    XCircle,
    FileDown,
} from "lucide-react";


import {Stack} from "@mui/material";
import {ModernButton, StyledCard, StyledTableCell, StyledTableRow} from "../compenent/atoms/styles.js";
import UserActivity from "../compenent/UserActivity.jsx";
import UserOnlineTime from "../compenent/UserOnlineTime.jsx";
import UserTalkTime from "../compenent/UserTalkTime.jsx";
import UserWebCamTime from "../compenent/UserWebCamTime.jsx";
import Emojis_Reactions from "../compenent/Emojis_Reactions.jsx";
import {handleChangePage, handleChangeRowsPerPage} from "../utils/pagination.jsx";


const Session = () => {
    const {session_id} = useParams();
    const [users, setUsers] = useState([]);
    const [userSession, setUserSession] = useState([]);
    const [screens, setScreens] = useState([]);
    const [slides, setSlides] = useState([]);
    const [polls, setPolls] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [sessionData, setSessionData] = useState([]);
    const [userScores, setUserScores] = useState({});
    const navigate = useNavigate();

    const duration = (end, start) => {
        const durationMs = parseInt(end) - parseInt(start);
        if (isNaN(durationMs) || durationMs < 0) return "Inconnue";

        const seconds = Math.floor((durationMs / 1000) % 60);
        const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
        const hours = Math.floor(durationMs / (1000 * 60 * 60));

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    useEffect(() => {

        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/${session_id}/GetUser`);
                if (!response.ok) throw new Error('Erreur API');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Erreur : ', error);
            }
        };
        const fetchUserSession = async () => {
            try {
                const response = await fetch(`/api/${session_id}/GetUserSession`);
                if (!response.ok) throw new Error('Erreur API');
                const data = await response.json();
                const map = {};
                data.forEach(user => {
                    map[user.user_id] = {
                        is_moderator: user.is_moderator,
                        is_dial_in: user.is_dial_in,
                        registered_on: user.registered_on,
                        left_on: user.left_on,
                    };
                });

                setUserSession(map);
            } catch (error) {
                console.error('Erreur : ', error);
            }
        };

        const fetchScreens = async () => {
            try {
                const response = await fetch(`/api/${session_id}/GetScreenShare`);
                if (!response.ok) throw new Error('Erreur API');
                const data = await response.json();
                setScreens(data);
            } catch (error) {
                console.error('Erreur : ', error);
            }
        };

        const fetchSession = async () => {
            try {
                const session = await fetch(`/api/GetSession/${session_id}`);
                if (!session.ok) throw new Error('Erreur API');
                const data = await session.json();
                setSessionData(data[0]);
            } catch (error) {
                console.error('Erreur : ', error);
            }
        };

        const fetchSlides = async () => {
            try {
                const response = await fetch(`/api/${session_id}/GetPresentationSlides`);
                if (!response.ok) throw new Error('Erreur API');
                const data = await response.json();
                setSlides(data);
            } catch (error) {
                console.error('Erreur : ', error);
            }
        };

        const fetchPolls = async () => {
            try {
                const response = await fetch(`/api/${session_id}/GetPoll`);
                if (!response.ok) throw new Error('Erreur API');
                const data = await response.json();
                setPolls(data);
            } catch (error) {
                console.error('Erreur : ', error);
            }
        };

        const fetchScores = async () => {
            try {
                const response = await fetch(`/api/${session_id}/Scores`);
                if (!response.ok) throw new Error("Erreur API Scores");
                const data = await response.json();
                console.log("score", data)
                const scoreMap = {};
                data.scores.forEach(entry => {
                    scoreMap[entry.user_id] = {
                        score: entry.score,
                    };
                });

                setUserScores(scoreMap);
            } catch (error) {
                console.error("Erreur scores : ", error);
            }
        };

        fetchStats();
        fetchUserSession();
        fetchScreens();
        fetchSession();
        fetchSlides();
        fetchPolls();
        fetchScores();
    }, [session_id]);


    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text(`Rapport de session - ID: ${session_id}`, 10, 10);

        // Infos générales
        const generalInfo = [
            ['Session Name', sessionData[2]],
            ['Created On', new Date(parseInt(sessionData[3])).toString().split(' GMT')[0]],
            ['Ended On', new Date(parseInt(sessionData[4])).toString().split(' GMT')[0]],
            ['Duration', duration(sessionData[4], sessionData[3])],
            ['Number of Users', users.length],
            ['Number of Screenshares', screens.length],
            ['Number of Slides', slides.length],
            ['Number of Polls', polls.length],
            ['Download Enabled', sessionData[5] ? 'Yes' : 'No'],
        ];

        let y = 20;
        generalInfo.forEach(([label, value]) => {
            doc.setFontSize(12);
            doc.text(`${label}: ${value}`, 10, y);
            y += 7;
        });

        y += 5;

        // Table des utilisateurs (avec données complètes)
        const userRows = users.map(user => {
            const userId = user[0];
            const name = user[2];
            const score = userScores[userId]?.score ?? '';
            const isModerator = userSession[userId]?.is_moderator ? 'Yes' : 'No';
            const isDialIn = userSession[userId]?.is_dial_in ? 'Yes' : 'No';
            const registered_on = userSession[userId]?.registered_on
                ? new Date(parseInt(userSession[userId].registered_on)).toString().split(' GMT')[0]
                : 'Unknown';


            console.log("registered_on", registered_on);
            const left_on = userSession[userId]?.left_on
                ? new Date(parseInt(userSession[userId].left_on)).toString().split(' GMT')[0]
                : 'Unknown';
            const onlineTime = duration(userSession[userId]?.left_on, userSession[userId]?.registered_on);

            return [
                name,
                score + '%',
                isModerator,
                isDialIn,
                onlineTime,
                registered_on,
                left_on,
            ];
        });

        doc.autoTable({
            startY: y + 5,
            head: [['Name', 'Score', 'Moderator', 'Dial-In', 'Online Time', 'Registered On', 'Left On']],
            body: userRows,
            styles: {fontSize: 9},
            headStyles: {fillColor: [98, 142, 203]}, // MUI blue
        });

        doc.save(`rapport_session_${session_id}.pdf`);
    };


    const handleExportCSV = () => {
        const generalInfo = [
            ['Session ID', session_id],
            ['Session Name', sessionData[2]],
            ['Created On', new Date(parseInt(sessionData[3])).toString().split(' GMT')[0]],
            ['Ended On', new Date(parseInt(sessionData[4])).toString().split(' GMT')[0]],
            ['Duration', duration(sessionData[4], sessionData[3])],
            ['Number of Users', users.length],
            ['Number of Screenshares', screens.length],
            ['Number of Slides', slides.length],
            ['Number of Polls', polls.length],
            ['Download Enabled', sessionData[5] ? 'Yes' : 'No'],
        ];

        const userTableHeader = ['Name', 'Score', 'Moderator', 'Dial-In', 'online Time', 'registred_on', 'left_on'];
        const userRows = users.map(user => {
            const userId = user[0];
            const name = user[2];
            const score = userScores[userId]?.score ?? '';
            const isModerator = userSession[userId]?.is_moderator ? 'Yes' : 'No';
            const isDialIn = userSession[userId]?.is_dial_in ? 'Yes' : 'No';
            const registered_on = new Date(parseInt(userSession[userId]?.registered_on)).toString().split(' GMT')[0];
            const left_on = new Date(parseInt(userSession[userId]?.left_on)).toString().split(' GMT')[0];
            const durre_presence = duration(userSession[userId]?.left_on, userSession[userId]?.registered_on);
            return [name, score + "%", isModerator, isDialIn, durre_presence, registered_on, left_on];
        });

        let csvContent = 'data:text/csv;charset=utf-8,';

        // Infos générales (format CSV :)
        generalInfo.forEach(info => {
            csvContent += info.join(' : ') + '\n';
        });

        // Ligne vide entre les sections
        csvContent += '\n';

        // En-têtes et données utilisateurs
        csvContent += userTableHeader.join(' : ') + '\n';
        userRows.forEach(row => {
            csvContent += row.join(' : ') + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rapport_session_${session_id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const KPICards = [
        {
            title: 'Utilisateurs',
            value: users.length,
            icon: Users,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#667eea'
        },
        {
            title: 'Partages d\'écran',
            value: screens.length,
            icon: Monitor,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#f5576c'
        },
        {
            title: 'Slides Présentation',
            value: slides.length,
            icon: FileText,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: '#00f2fe'
        },
        {
            title: 'Sondages',
            value: polls.length,
            icon: BarChart3,
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: '#38f9d7'
        },
        {
            title: 'Durée',
            value: duration(sessionData[4], sessionData[3]),
            icon: Clock,
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: '#fa709a'
        },
        {
            title: 'Téléchargement',
            value: sessionData[5] ? 'Activé' : 'Désactivé',
            icon: Download,
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#a8edea'
        },
    ];

    return (


        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: 3
        }}>
            {/* Header */}
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
                    {sessionData[2] || 'Détails de la Session'}
                </Typography>
                <Typography variant="h6" sx={{color: '#64748b', fontWeight: 300}}>
                    Analyse complète de la session
                </Typography>
            </Box>


            {/* KPI Cards */}
            <Grid container spacing={3} sx={{mb: 4}} justifyContent="center">
                {KPICards.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                        <Grow in timeout={600 + index * 100}>
                            <StyledCard>
                                <CardContent sx={{p: 2.5, position: 'relative', zIndex: 1}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <Box>
                                            <Typography variant="h6" sx={{fontWeight: 'bold', mb: 0.5}}>
                                                {item.value}
                                            </Typography>
                                            <Typography variant="body2" sx={{opacity: 0.9}}>
                                                {item.title}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            width: 30,
                                            height: 30,
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <item.icon size={15}/>
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        </Grow>
                    </Grid>
                ))}
            </Grid>


            {/* Graphs */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} style={{width: '97%'}}><UserActivity/></Grid>
                <Grid item xs={12} sm={6} style={{width: '65%'}}><UserOnlineTime/></Grid>
                <Grid item xs={12} sm={6} style={{width: '30%'}}><UserTalkTime/></Grid>
                <Grid item xs={12} sm={6} style={{width: '30%'}}><UserWebCamTime/></Grid>
                <Grid item xs={12} sm={6} style={{width: '65%'}}><Emojis_Reactions/></Grid>
                <Grid item xs={12} sm={6} md={4} style={{width: '97%'}}>

                    <Card>

                        <CardContent>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                                <Avatar sx={{
                                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                                    color: '#3b3f91',
                                    mr: 2
                                }}>
                                    <Users size={24}/>
                                </Avatar>
                                <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}>
                                    Liste des Participants
                                </Typography>
                            </Box>


                            <Paper elevation={0} sx={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid rgba(102, 126, 234, 0.1)'
                            }}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>Nom</StyledTableCell>
                                                <StyledTableCell align="center">Score</StyledTableCell>
                                                <StyledTableCell align="center">Modérateur</StyledTableCell>
                                                <StyledTableCell align="center">Connexion téléphonique</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => {
                                                const userId = user[0];
                                                const userInfo = userScores[userId];

                                                return (

                                                    <StyledTableRow key={userId}>
                                                        <StyledTableCell
                                                            onClick={() => {
                                                                navigate(`/Session/${session_id}/User/${userId}`, {
                                                                    state: {
                                                                        started_on: sessionData[3],
                                                                        stopped_on: sessionData[4],
                                                                        session_name: sessionData[2],
                                                                        user_name: user[2],
                                                                    }
                                                                });
                                                            }}>
                                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                <Avatar sx={{
                                                                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                                                                    color: '#667eea',
                                                                    width: 32,
                                                                    height: 32,
                                                                    mr: 2,
                                                                    fontSize: '0.8rem'
                                                                }}>
                                                                    {user[2].charAt(0)}
                                                                </Avatar>
                                                                <Typography variant="body2" sx={{fontWeight: 500}}>
                                                                    {user[2]}
                                                                </Typography>
                                                            </Box>
                                                        </StyledTableCell>
                                                        <StyledTableCell align="center">
                                                            <Chip
                                                                label={`${userInfo ? userInfo.score : '...'} %`}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: userInfo && userInfo.score >= 70 ? 'rgba(34, 197, 94, 0.1)' :
                                                                        userInfo && userInfo.score >= 40 ? 'rgba(249, 115, 22, 0.1)' :
                                                                            'rgba(239, 68, 68, 0.1)',
                                                                    color: userInfo && userInfo.score >= 70 ? '#22c55e' :
                                                                        userInfo && userInfo.score >= 40 ? '#f97316' :
                                                                            '#ef4444',
                                                                    fontWeight: 600
                                                                }}
                                                            /> </StyledTableCell>
                                                        <StyledTableCell align="center">
                                                            <Chip
                                                                icon={userSession[userId]?.is_moderator ?
                                                                    <CheckCircle size={16}/> :
                                                                    <XCircle size={16}/>
                                                                }
                                                                label={userSession[userId]?.is_moderator ? 'Oui' : 'Non'}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: userSession[userId]?.is_moderator ?
                                                                        'rgba(34, 197, 94, 0.1)' :
                                                                        'rgba(239, 68, 68, 0.1)',
                                                                    color: userSession[userId]?.is_moderator ?
                                                                        '#22c55e' :
                                                                        '#ef4444'
                                                                }}
                                                            /> </StyledTableCell>

                                                        <StyledTableCell align="center">
                                                            <Chip
                                                                icon={userSession[userId]?.is_dial_in ?
                                                                    <CheckCircle size={16}/> :
                                                                    <XCircle size={16}/>
                                                                }
                                                                label={userSession[userId]?.is_dial_in ? 'Oui' : 'Non'}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: userSession[userId]?.is_dial_in ?
                                                                        'rgba(34, 197, 94, 0.1)' :
                                                                        'rgba(239, 68, 68, 0.1)',
                                                                    color: userSession[userId]?.is_dial_in ?
                                                                        '#22c55e' :
                                                                        '#ef4444'
                                                                }}
                                                            />
                                                        </StyledTableCell>
                                                    </StyledTableRow>
                                                )
                                                    ;
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[15, 30, 50]}
                                    component="div"
                                    count={users.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage(setPage)}
                                    onRowsPerPageChange={handleChangeRowsPerPage(setRowsPerPage, setPage)}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                />
                            </Paper>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{mt: 4}}>
                <ModernButton
                    variant="contained"
                    startIcon={<FileDown size={18}/>}
                    onClick={handleExportCSV}
                >
                    Exporter CSV
                </ModernButton>
                <ModernButton
                    variant="contained"
                    startIcon={<FileDown size={18}/>}
                    onClick={handleExportPDF}

                >
                    Exporter PDF
                </ModernButton>
            </Stack>
        </Box>


    );
};

export default Session;