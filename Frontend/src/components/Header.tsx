import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { User, Music, Calendar, Search, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { apiService } from "@/lib/api.ts";

const backendUrl = "http://localhost:5258";

const useDarkMode = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  return { theme, setTheme};
};

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme} = useDarkMode();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (isAuthenticated && user) {
        try {
          const profilePic = await apiService.getProfilePicture();
          setProfilePicture(profilePic);
        } catch (error) {
          setProfilePicture(null);
        }
      }
    };

    fetchProfilePicture();
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    setTheme('light');
    localStorage.setItem('theme', 'light');
    navigate('/');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return (
      <header className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="w-48 flex justify-end">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <Music className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">note4u</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="dark:text-white dark:hover:bg-gray-700"
              >
                Accedi
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
              >
                Registrati
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="w-48 flex justify-start">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <Music className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">note4u</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant={isActiveRoute('/dashboard') ? 'default' : 'ghost'}
              className={`flex items-center space-x-2 ${isActiveRoute('/dashboard') ? 'dark:bg-blue-700 dark:text-white' : 'dark:text-white dark:hover:bg-gray-700'}`}
              onClick={() => navigate('/dashboard')}
            >
              <Calendar className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>

            {user?.role === 'Student' && (
              <Button
                variant={isActiveRoute('/search') ? 'default' : 'ghost'}
                className={`flex items-center space-x-2 ${isActiveRoute('/search') ? 'dark:bg-blue-700 dark:text-white' : 'dark:text-white dark:hover:bg-gray-700'}`}
                onClick={() => navigate('/search')}
              >
                <Search className="h-4 w-4" />
                <span>Cerca Professori</span>
              </Button>
            )}
          </nav>

          <div className="w-48 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 dark:text-white dark:hover:bg-gray-700 max-w-full"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-800 flex-shrink-0">
                    {profilePicture || user?.profilePicture ? (
                      <img
                        src={profilePicture ? `${backendUrl}${profilePicture}` : `${backendUrl}${user?.profilePicture}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-white truncate min-w-0">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-700 dark:text-white">
                <DropdownMenuItem
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer dark:hover:bg-gray-600"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profilo</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="dark:bg-gray-600" />
                <DropdownMenuLabel>Tema</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark')}>
                  <DropdownMenuRadioItem value="light" className="cursor-pointer dark:hover:bg-gray-600">
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Chiaro</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="cursor-pointer dark:hover:bg-gray-600">
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Scuro</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator className="dark:bg-gray-600" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer dark:hover:bg-gray-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
