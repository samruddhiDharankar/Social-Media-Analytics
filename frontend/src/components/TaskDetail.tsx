import { useEffect, useState } from "react";
import { Analytics, Post, Task } from "../types";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Grid, Paper, Typography, Box, Stack, Chip } from "@mui/material";
import AnalyticsChart from "./AnalyticsChart";

const TaskDetail: React.FC = () => {
    const [task, setTask] = useState<Task | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const { id } = useParams<{ id: string }>();

    const formatDate = (date: string) => {
        if (!date) return "";
        return format(new Date(date), "dd MMM yyyy");
    };

    const fetchData = async() => {
        try {
            const [taskResponse, postsResponse, analyticsResponse] = await Promise.all([
                fetch(`http://localhost:8000/tasks/${id}`),
                fetch(`http://localhost:8000/tasks/${id}/posts`),
                fetch(`http://localhost:8000/analytics/${id}`)
            ]);
            const taskData = await taskResponse.json();
            const postsData = await postsResponse.json();
            const analyticsData = await analyticsResponse.json();
            console.log("taskData", taskData);
            console.log("postsData", postsData);
            console.log("analyticsData", analyticsData);
            setTask(taskData);
            setPosts(postsData); 
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (task?.status === 'in_progress') {
                fetchData();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [id, task?.status]);

    return (
        <Box sx={{ p: 3}}>
            <Typography variant="h4">Task Details</Typography>
            <Stack spacing={3}>
                <Paper sx={{ p: 2 }}>
                <Typography variant="h6">
                    {task?.name} 
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    From: {formatDate(task?.filters.start_date || '')} - To: {formatDate(task?.filters.end_date || '')}
                </Typography>

                    <Box sx={{ mt: 1 }}>
                        <Chip
                            label={task?.status}
                            color={
                                task?.status === 'completed'
                                ? 'success'
                                : task?.status === 'in_progress'
                                ? 'warning'
                                : task?.status === 'pending'
                                ? 'default'
                                : task?.status === 'failed'
                                ? 'error'
                                : 'default'
                            }
                            size="small"
                            sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Created: {task?.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}
                        </Typography>
                        {task?.completed_at && (
                            <Typography variant="body2" color="text.secondary">
                                Completed: {new Date(task.completed_at).toLocaleString()}
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Stack>
            {analytics && <AnalyticsChart data={analytics}/>}
        </Box>
    );
};

export default TaskDetail;
