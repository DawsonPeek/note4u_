import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Book, User, GraduationCap } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage = ({ mode }: AuthPageProps) => {
  interface FormData {
    username: string
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isTeacher: boolean;
  }
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isTeacher: false
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    setErrorMessage(null);
    if (!location.state) {
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        isTeacher: false
      });
    }
  }, [mode, location]);
  

  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        await login(formData.username, formData.password);
        toast({
          title: "Login effettuato con successo!",
          description: "Benvenuto in note4u"
        });
        navigate('/dashboard');
      } else {
        await register(formData);
        toast({
          title: "Registrazione completata!",
          description: "Ora puoi effettuare il login"
        });
        navigate('/login', { state: { fromRegister: true } });
      }
    } catch (error) {
      const message = error.message;

      if (message.includes('401') || message.toLowerCase().includes('password')) {
        setErrorMessage("Username o password errati.");
      } else if (message.includes('409') || message.toLowerCase().includes('già utilizzato')) {
        setErrorMessage("Email o Username già utilizzato.");
      } else {
        setErrorMessage("Si è verificato un errore. Riprova.");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      isTeacher: value === 'teacher'
    });
  };
  

  return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Book className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {mode === 'login' ? 'Accedi a note4u' : 'Registrati su note4u'}
            </h2>
            <p className="mt-2 text-gray-600">
              {mode === 'login'
                  ? 'Accedi al tuo account per continuare'
                  : 'Crea il tuo account per iniziare'
              }
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'login' ? 'Login' : 'Registrazione'}
              </CardTitle>
              <CardDescription>
                {mode === 'login'
                    ? 'Inserisci le tue credenziali per accedere'
                    : 'Compila i campi per creare il tuo account'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                    <>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="La tua email"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Nome</Label>
                          <Input
                              id="firstName"
                              name="firstName"
                              type="text"
                              required
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="Il tuo nome"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Cognome</Label>
                          <Input
                              id="lastName"
                              name="lastName"
                              type="text"
                              required
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Il tuo cognome"
                          />
                        </div>
                      </div>
                    </>
                )}

                <div>
                  <Label htmlFor="email">Username</Label>
                  <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Il tuo username"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="La tua password"
                  />
                </div>

                {mode === 'register' && (
                    <RadioGroup
                        value={formData.isTeacher ? 'teacher' : 'student'}
                        onValueChange={handleRoleChange}
                        className="flex items-center gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student"/>
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-black mr-2" />
                          <span className="text-sm">Studente</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher"/>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 text-black mr-2" />
                          <span className="text-sm">Insegnante</span>
                        </div>
                      </div>
                    </RadioGroup>
                )}

                {errorMessage && (
                    <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
                      {errorMessage}
                    </div>
                )}  

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                      ? 'Caricamento...'
                      : mode === 'login' ? 'Accedi' : 'Registrati'
                  }
                </Button>
              </form>

              <div className="mt-6 text-center">
                {mode === 'login' ? (
                    <p className="text-sm text-gray-600">
                      Non hai ancora un account?{' '}
                      <Link to="/register" className="text-blue-600 hover:underline">
                        Registrati
                      </Link>
                    </p>
                ) : (
                    <p className="text-sm text-gray-600">
                      Hai già un account?{' '}
                      <Link to="/login" className="text-blue-600 hover:underline">
                        Accedi
                      </Link>
                    </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default AuthPage;