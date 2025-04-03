import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TaskCreate: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<{
        name: string;
        start_date: string;
        end_date: string;
        platforms: string[];
        hashtags: string[];
    }>({
        name: '',
        start_date: '',
        end_date: '',
        platforms: [],
        hashtags: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    filters: {
                        start_date: formData.start_date || null,
                        end_date: formData.end_date || null,
                        platforms: formData.platforms,
                        hashtags: formData.hashtags
                    }
                })
            });
            const data = await response.json();
            navigate('/tasks');
        } catch (error) {
            console.error('Error creating task:', error);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Box sx={{ p: 3}}>
            <Typography variant="h4">Create New Task</Typography>
            <Paper sx={{ p: 3}}>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                        fullWidth
                        label="Task Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        />
                        <Box sx={{ display: 'flex', gap: 3}}>
                            <TextField
                            fullWidth
                            label="Start Date"
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                            fullWidth
                            label="End Date"
                            name="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>Platform</InputLabel>
                            <Select
                                multiple
                                value={formData.platforms}
                                onChange={(e) => 
                                    setFormData({
                                    ...formData,
                                    platforms: e.target.value as string[],
                                    })
                                }
                                label="Platform"
                                >
                                    <MenuItem value="twitter">Twitter</MenuItem>
                                    <MenuItem value="instagram">Instagram</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Hashtags (comma separated)"
                            name="hashtags"
                            value={formData.hashtags}
                            onChange={handleChange}
                            helperText="Enter hashtags separated by commas"
                            />
                            <Button type="submit" variant="contained" color="primary">Create Task</Button>
                            </Stack>
                </form>
            </Paper>
        </Box>
    )
}

export default TaskCreate;