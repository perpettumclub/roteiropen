import { BrowserRouter } from 'react-router-dom';

// Providers
import { AuthProvider } from './features/auth';
import { UserProvider } from './shared';
import { ScriptProvider } from './shared/context/ScriptContext';

// Router
import { AppRouter } from './AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <ScriptProvider>
            <AppRouter />
          </ScriptProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
