import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, Calendar as CalendarIcon, ArrowLeft, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import RatingSystem from '@/components/RatingSystem';
import SchedulingComponent from '@/components/SchedulingComponent';
import { decodeTeacherId } from '@/lib/utils';
import { apiService } from "@/lib/api.ts";
import { Teacher, TimeSlot, LessonRequest } from "@/types/user.ts";


const TeacherProfile = () => {
  const { encodedId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [canRate, setCanRate] = useState(false);
  const backendUrl = "http://localhost:5258";
  const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>();

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);

        const teacherId = decodeTeacherId(encodedId);

        const teacherResult = await apiService.getTeacherInfo(teacherId);

        if (user && user.role === 'Student') {
          const hasRatingRight = await apiService.getRatingRight(teacherId);
          setCanRate(hasRatingRight);

          const availability = await apiService.getAvailability(teacherId);
          setAvailabilitySlots(availability);
        }

        setTeacher(teacherResult.teacher);

      } catch (error) {
        setError('Errore di connessione al server');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [encodedId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento profilo insegnante...</p>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Insegnante non trovato'}
          </h1>
          <Button onClick={() => navigate('/search')}>Torna alla ricerca</Button>
        </div>
      </div>
    );
  }

  const teacherInstruments = teacher.instruments || [];

  const handleRating = async (rating: number) => {
    if (!user || !teacher) return;

    try {
      await apiService.postRating(teacher.id, rating);
      setCanRate(false);

      const teacherId = decodeTeacherId(encodedId);
      const teacherResult = await apiService.getTeacherInfo(teacherId);
      setTeacher(teacherResult.teacher);

      toast({
        title: "Valutazione inviata",
        description: "Grazie per aver valutato l'insegnante!",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nell\'invio della valutazione';

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleBookSlot = async (slotId: string) => {
    try {
      setLoading(true);

      const slot = availabilitySlots.find(s => s.availabilityId === slotId);
      if (!slot) {
        throw new Error('Slot non trovato');
      }

      const parseToHours = (time) => {
        const [h, m = 0] = time.split(':').map(Number);
        return h + m / 60;
      };

      const lessonPrice = (teacher.hourlyRate) * (parseToHours(slot.endTime) - parseToHours(slot.startTime));

      const lesson: LessonRequest = {
        teacherId: parseInt(teacher.id),
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: lessonPrice
      };

      await apiService.createLesson(lesson);

      const updatedAvailability = await apiService.getAvailability(teacher.id);
      setAvailabilitySlots(updatedAvailability);

      toast({
        title: "Lezione prenotata!",
        description: `Lezione prenotata per il ${format(new Date(slot.date), 'dd/MM/yyyy')} alle
          ${slot.startTime.substring(0, 5)}`,
      });

    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella prenotazione",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/search')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla ricerca
        </Button>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                    {teacher.profilePicture ? (
                      <img
                        src={`${backendUrl}${teacher.profilePicture}`}
                        alt={`${teacher.firstName} ${teacher.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-blue-100 flex items-center justify-center`}>
                        <User className="h-12 w-12 text-blue-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {teacher.firstName} {teacher.lastName}
                      </h1>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{teacher.rating}</span>
                          <span>({teacher.totalLessons} {teacher.totalLessons === 1 ? 'lezione' : 'lezioni'})</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">€{teacher.hourlyRate || 30}</div>
                        <p className="text-sm text-gray-600 mt-1">per lezione di 1h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Esperienza e Competenze</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">{teacher.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strumenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacherInstruments.map((instrument) => (
                    <Badge key={instrument.instrumentId} variant="secondary" className="text-sm">
                      {instrument.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {user && user.role === 'Student' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>Prenota una Lezione</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="gap-6">
                  <SchedulingComponent
                    mode="booking"
                    availabilitySlots={availabilitySlots}
                    onBookSlot={handleBookSlot}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Valuta questo Insegnante</CardTitle>
                </CardHeader>
                <CardContent>
                  <RatingSystem
                    teacherId={teacher.id}
                    canRate={canRate}
                    onSubmitRating={handleRating}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
