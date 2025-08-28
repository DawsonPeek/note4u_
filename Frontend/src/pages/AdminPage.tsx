import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Users, BookOpen, Music, Activity, Trash2 } from 'lucide-react';
import { apiService } from '@/lib/api';
import { User, Lesson } from '@/types/user';

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalLessons: 0
    });
    const [users, setUsers] = useState<User[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'lessons'>('overview');
    const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
    const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate('/dashboard');
            return;
        }
        loadAdminData();
    }, [user, navigate]);

    const loadAdminData = async () => {
        try {
            setIsLoading(true);

            const users = await apiService.getAllUsers();
            const lessons = await apiService.getAllLessons();

            setUsers(users);
            setLessons(lessons);

            setStats({
                totalUsers: users.length,
                totalTeachers: users.filter(u => u.role === 'Teacher').length,
                totalStudents: users.filter(u => u.role === 'Student').length,
                totalLessons: lessons.length
            });

        } catch (error) {
            toast({
                title: "Errore",
                description: "Impossibile caricare i dati amministrativi",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await apiService.deleteUserAdmin(userId);
            await loadAdminData();
            toast({
                title: "Utente eliminato",
                description: "L'utente è stato rimosso dal sistema"
            });
        } catch (error) {
            toast({
                title: "Errore",
                description: "Impossibile eliminare l'utente",
                variant: "destructive"
            });
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        try {
            await apiService.deleteLessonAdmin(lessonId);
            await loadAdminData();
            toast({
                title: "Lezione eliminata",
                description: "La lezione è stata rimossa dal sistema"
            });
        } catch (error) {
            toast({
                title: "Errore",
                description: "Impossibile eliminare la lezione",
                variant: "destructive"
            });
        }
    };

    const openDeleteUserDialog = (user: User) => {
        setSelectedUserToDelete(user);
        setShowDeleteUserDialog(true);
    };

    const handleConfirmDeleteUser = () => {
        if (selectedUserToDelete?.id) {
            handleDeleteUser(selectedUserToDelete.id);
        }
        setShowDeleteUserDialog(false);
        setSelectedUserToDelete(null);
    };

    if (!user || user.role !== 'Admin') {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento pannello amministrativo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Pannello Amministrativo
                    </h1>
                    <p className="text-gray-600">Gestisci utenti, lezioni e statistiche del sistema</p>
                </div>

                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', label: 'Panoramica', icon: Activity },
                                { id: 'users', label: 'Utenti', icon: Users },
                                { id: 'lessons', label: 'Lezioni', icon: BookOpen }
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id as 'overview' | 'users' | 'lessons')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        activeTab === id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Utenti Totali</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Insegnanti</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
                                    </div>
                                    <Music className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Studenti</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Lezioni Totali</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalLessons}</p>
                                    </div>
                                    <BookOpen className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'users' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestione Utenti</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                                <p className="text-xs text-gray-400">ID: {user.id}</p>
                                            </div>
                                            <Badge variant={user.role === 'Teacher' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => openDeleteUserDialog(user)}
                                                disabled={!user.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'lessons' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestione Lezioni</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lessons.map((lesson) => (
                                    <div key={lesson.bookingId} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <BookOpen className="h-8 w-8 text-blue-600" />
                                            <div>
                                                <h4 className="font-medium">{lesson.teacher} → {lesson.student}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {lesson.date} - {lesson.startTime.substring(0, 5)} / €{lesson.price}
                                                </p>
                                                <p className="text-xs text-gray-400">ID: {lesson.bookingId}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteLesson(lesson.bookingId)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminare l'utente?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter className="flex mx-auto">
                        <Button variant="outline" onClick={() => setShowDeleteUserDialog(false)}>
                            Annulla
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDeleteUser}>
                            Conferma Eliminazione
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPage;