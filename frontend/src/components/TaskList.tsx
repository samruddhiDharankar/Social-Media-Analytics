import { useEffect, useState } from "react";
import { Task } from "../types";
import { useNavigate } from "react-router-dom";
import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async() => {
            try {
                const response = await fetch('http://localhost:8000/tasks');
                setTasks(await response.json());
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'warning';
            case 'failed':
                return 'error';
            case 'pending':
                return 'default';
            default:
                return 'default';
        }
    }
    
    return (
        <Box>
            <Typography variant="h4">Tasks</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Platforms</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Completed At</TableCell>
                            {/* <TableCell>Actions</TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow 
                            key={task.id}
                            hover
                            onClick={() => navigate(`/task/${task.id}`)}
                            sx={{cursor: 'pointer'}}
                            >
                                <TableCell>{task.id}</TableCell>
                                <TableCell>{task.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={task.status}
                                        color={getStatusColor(task.status)}
                                        size="small"
                                        />
                                    </TableCell>    
                                    <TableCell>
                                        {task.filters.platforms}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(task.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {task.completed_at ? new Date(task.completed_at).toLocaleString() : '-'}
                                    </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default TaskList;