import { useState, useContext } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { StoreContext } from '../providers/BasicStoreProvider';
import { useAuth } from '../providers/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [{ name: 'Competitions' }, { name: 'Import Competition' }];

function Mainbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { jwt, logout, user } = useAuth();
  const [appTitle] = useContext(StoreContext).appTitle;

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar
          sx={{
            pr: '24px',
          }}>
          {location.pathname !== '/' && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="go back"
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}>
              <ChevronLeftIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{ textDecoration: 'none', color: 'inherit' }}>
              {appTitle}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open user menu">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.name} src={user?.avatar?.thumb_url} />
              </IconButton>
            </Tooltip>
            {user && (
              <>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar-user"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}>
                  <MenuItem key="logout" onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Mainbar;
