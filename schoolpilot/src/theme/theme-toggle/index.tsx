import { useContext } from 'react';
import { IconButton } from '@mui/material';
import IconifyIcon from '../../components/base/iconifyIcon';
// import { ThemeModeContext } from '../../context/themeModeContext';
import { ThemeModeContext } from './themeModeContext';

const ThemeToggle = () => {
    const { themeMode, toggleThemeMode } = useContext(ThemeModeContext);

    return (
        <IconButton onClick={toggleThemeMode}>
            <IconifyIcon
                icon={themeMode === 'light' ? 'mdi:weather-night' : 'mdi:weather-sunny'}
                width={24}
                height={24}
            />
        </IconButton>
    );
};

export default ThemeToggle;
