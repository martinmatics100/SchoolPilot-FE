import { type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { PWAInstallButton } from './components/PWAInstallButton'; // Add this

const App = (): ReactElement => {
  return (
    <>
      <Outlet />
      <PWAInstallButton /> {/* Add this */}
    </>
  )
};

export default App;
