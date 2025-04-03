import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material"
import { Link as RouterLink } from 'react-router-dom';


const NavBar: React.FC = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Social Media Analytics</Typography>
                <Box>
                    <Button color="inherit" component={RouterLink} to="/tasks">
                        Tasks
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/create">
                        Create Task
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar;