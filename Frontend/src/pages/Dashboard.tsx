import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, User, BookOpen, Users, X, ExternalLink, Clock } from 'lucide-react';
import { CollapsibleItem } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { apiService } from "@/lib/api";
import { Lesson } from '@/types/user';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const [userLessons, setUserLessons] = useState<Lesson[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const backendUrl = "http://localhost:5258";

  useEffect(() => {
    const loadLessons = async () => {
      if (!user) return;
      try {
        const lessons: Lesson[] = await apiService.getLessons();
        setUserLessons(lessons);
      } catch (error) {
        toast({
          title: "Errore di caricamento",
          description: "Non è stato possibile caricare le tue lezioni.",
          variant: "destructive",
        });
      }
    };

    loadLessons();

  }, [user]);

  const handleCancelLesson = async (lessonId: string) => {
    if (!user) return;

    try {
      await apiService.deleteLesson(lessonId);

      const updatedLessons: Lesson[] = await apiService.getLessons();
      setUserLessons(updatedLessons);

      toast({
        title: "Lezione cancellata",
        description: "La lezione è stata cancellata con successo",
      });

      console.log('Lezione eliminata:', lessonId);
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      toast({
        title: "Errore di eliminazione",
        description: "Non è stato possibile eliminare la lezione.",
        variant: "destructive",
      });
    }
  };

  const renderProfilePicture = (lesson: Lesson) => {
    const profilePic = user?.role === 'Teacher' ? lesson.studentProfilePicture : lesson.teacherProfilePicture;

    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
        {profilePic ? (
          <img
            src={`${backendUrl}${profilePic}`}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-blue-600" />
        )}
      </div>
    );
  };

  const handleConfirmCancel = () => {
    handleCancelLesson(selectedLessonId);
    setShowCancelDialog(false);
    setSelectedLessonId('');
  };

  const openCancelDialog = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setShowCancelDialog(true);
  };

  const isLessonPast = (lesson: Lesson): boolean => {
    const lessonEndDateTime = new Date(lesson.date + 'T' + lesson.endTime);
    const twoHoursAfterEnd = new Date(lessonEndDateTime.getTime() + (2 * 60 * 60 * 1000)); // Aggiungi 2 ore
    return twoHoursAfterEnd < new Date();
  };

  const renderLessonCard = (lesson: Lesson, isPast = false) => {
    return (
      <div key={lesson.bookingId} className={cn(
        "border rounded-lg p-4 transition-all duration-200",
        isPast ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:shadow-md"
      )}>
        <div className={cn(
          "flex items-center justify-between",
          isPast ? "mb-0" : "mb-3" // Rimuovi margin bottom quando non ci sono bottoni
        )}>
          <div className="flex items-center space-x-4">
            {renderProfilePicture(lesson)}
            <div>
              <h4 className={cn(
                "font-semibold text-lg",
                isPast ? "text-gray-600" : "text-gray-900"
              )}>
                {user?.role === 'Teacher' ? lesson.student : lesson.teacher}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              "font-medium",
              isPast ? "text-gray-600" : "text-gray-900"
            )}>
              {format(new Date(lesson.date), 'dd MMM yyyy', { locale: it })}
            </p>
            <p className={cn(
              "text-sm",
              isPast ? "text-gray-500" : "text-gray-600"
            )}>
              {lesson.startTime.substring(0, 5)} - {lesson.endTime.substring(0, 5)}
            </p>
          </div>
        </div>
        {!isPast && (
          <div className="flex gap-2">
            {lesson.meetingLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(lesson.meetingLink, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Accedi al meeting
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openCancelDialog(lesson.bookingId)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {user?.role === 'Teacher' ? 'Annulla lezione' : 'Annulla prenotazione'}
            </Button>
          </div>
        )}
      </div>
    );
  };


  if (!user) return null;

  const upcomingLessons = userLessons.filter(lesson => !isLessonPast(lesson));
  const pastLessons = userLessons.filter(lesson => isLessonPast(lesson));

  if (user.role === 'Teacher') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Ciao, Prof. {user.firstName}!
            </h1>
            <p className="text-gray-600">Ecco il riepilogo delle tue attività</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lezioni Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{userLessons.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Studenti</p>
                    <p className="text-2xl font-bold text-gray-900">{new Set(userLessons.map(l => l.studentId)).size}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Questo Mese</p>
                    <p className="text-2xl font-bold text-gray-900">€{userLessons.reduce((sum, lesson) => sum + lesson.price, 0)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Prossime Lezioni</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingLessons.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Non hai lezioni programmate al momento
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingLessons.map((lesson) => renderLessonCard(lesson, false))}
                </div>
              )}
            </CardContent>
          </Card>

          {pastLessons.length > 0 && (
            <div className="mb-8">
              <CollapsibleItem
                title={`Lezioni Passate (${pastLessons.length})`}
                icon={<Clock className="h-5 w-5 text-gray-600" />}
                variant="default"
                defaultOpen={false}
              >
                <div className="space-y-4">
                  {pastLessons.map((lesson) => renderLessonCard(lesson, true))}
                </div>
              </CollapsibleItem>
            </div>
          )}
        </div>

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annullare la lezione?</DialogTitle>
              <DialogDescription>
                Questa azione non può essere annullata.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Chiudi
              </Button>
              <Button variant="destructive" onClick={handleConfirmCancel}>
                Conferma Cancellazione
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (user.role === 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Amministratore
            </h1>
            <p className="text-gray-600">Benvenuto nel pannello di controllo</p>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Accesso Pannello Amministrativo</h2>
              <p className="text-gray-600 mb-6">
                Gestisci utenti, lezioni e statistiche del sistema
              </p>
              <Button
                onClick={() => window.location.href = '/admin'}
                size="lg"
                className="flex items-center gap-2 mx-auto"
              >
                <Users className="h-5 w-5" />
                Apri Pannello Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ciao, {user.firstName}!
          </h1>
          <p className="text-gray-600">Benvenuto nella tua dashboard di apprendimento</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Calendar className="h-6 w-6" />
              <span>Prossime Lezioni</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {upcomingLessons.length === 0 ? (
              <div key="no-lessons" className="text-center py-12">
                <p className="text-gray-500 mb-4 text-lg">Non hai lezioni programmate</p>
                <Button onClick={() => window.location.href = '/search'} size="lg">
                  Trova un Insegnante
                </Button>
              </div>
            ) : (
              <div key='has-lessons' className="space-y-6">
                {upcomingLessons.map((lesson) => {
                  return (
                    <div key={lesson.bookingId} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          {renderProfilePicture(lesson)}
                          <div>
                            <h4 className="font-semibold text-lg">
                              {lesson.teacher}
                            </h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {format(new Date(lesson.date), 'dd MMM yyyy', { locale: it })}
                          </p>
                          <p className="text-gray-600 mt-1">
                            {lesson.startTime.substring(0, 5)} - {lesson.endTime.substring(0, 5)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {lesson.meetingLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(lesson.meetingLink, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Accedi al meeting
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openCancelDialog(lesson.bookingId)}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Annulla prenotazione
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="text-center pt-8">
                  <Button onClick={() => window.location.href = '/search'} size="lg">
                    Trova altri insegnanti
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {pastLessons.length > 0 && (
          <div className="mb-8">
            <CollapsibleItem
              title={`Lezioni Passate (${pastLessons.length})`}
              icon={<Clock className="h-5 w-5 text-gray-600" />}
              variant="default"
              defaultOpen={false}
            >
              <div className="space-y-4">
                {pastLessons.map((lesson) => (
                  <div key={lesson.bookingId} className="border rounded-lg p-6 bg-gray-50 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        {renderProfilePicture(lesson)}
                        <div>
                          <h4 className="font-semibold text-lg text-gray-700">
                            {lesson.teacher}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-700">
                          {format(new Date(lesson.date), 'dd MMM yyyy', { locale: it })}
                        </p>
                        <p className="text-gray-500 mt-1">
                          {lesson.startTime.substring(0, 5)} - {lesson.endTime.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleItem>
          </div>
        )}
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annullare la prenotazione?</DialogTitle>
            <DialogDescription>
              Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Chiudi
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Conferma Cancellazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
