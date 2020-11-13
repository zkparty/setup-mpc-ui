import React, { useContext } from 'react';
import { Link as RouterLink } from "react-router-dom";
import { withStyles, makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/MenuOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoIcon from '@material-ui/icons/Info';
import GitHubIcon from '@material-ui/icons/GitHub';
import { ZKTitle } from "./Title";
import { AuthContext } from "./App";
import {
  accentColor,
  secondAccent,
  textColor,
} from "../styles";
import { Button } from '@material-ui/core';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: "unset",
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: textColor,
      },
    },
  },
}))(MenuItem);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

const Auth = useContext(AuthContext);

const LoginButton = () => {
  return (
    Auth.isLoggedIn ?
      <Button
        aria-controls="github-login"
        color="inherit"
        endIcon={<GitHubIcon />}
        style={{ color: accentColor }}
        component={RouterLink}
        to="/logout"
        >
        {Auth.authUser.user.displayName}
      </Button>
    : 
      <Button
        aria-controls="github-login"
        color="inherit"
        endIcon={<GitHubIcon >Login</GitHubIcon>}
        style={{ color: accentColor }}
        component={RouterLink}
        to="/login"
        >
        Login
      </Button>
  );
};


export default function ButtonAppBar() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const classes = useStyles();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
      };
    
      const handleClose = () => {
        setAnchorEl(null);
      };
    
    return (
    <div className={classes.root}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <IconButton 
            edge="start" 
            className={classes.menuButton} 
            color="inherit" 
            aria-label="menu"
            aria-haspopup="true"
            onClick={handleClick}
            >
            <MenuIcon style={{ color: accentColor }}/>
          </IconButton>
          <StyledMenu
            id="customized-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <StyledMenuItem>
              <ListItemIcon>
                  <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Coordinator Settings" />
              </StyledMenuItem>
              <StyledMenuItem>
              <ListItemIcon>
                  <InfoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="About" />
              </StyledMenuItem>
              <StyledMenuItem>
              <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
              </StyledMenuItem>
            </StyledMenu>
          <ZKTitle />
          <LoginButton/>
        </Toolbar>
      </AppBar>
    </div>
  );
}
