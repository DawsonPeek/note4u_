import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Instrument, TimeSlot } from '@/types/user';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { apiService } from "@/lib/api";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CalendarDays, Repeat } from 'lucide-react';
import ProfileBasicInfo from '@/components/ProfileBasicInfo';
import InstrumentsTab from '@/components/InstrumentsTab.tsx';
import ProfileActions from '@/components/ProfileActions';
import SchedulingComponent from '@/components/SchedulingComponent';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfileImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [hourlyRate, setPrice] = useState(30);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [availableInstruments, setAvailableInstruments] = useState<Instrument[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingInstruments, setIsEditingTools] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSchedulingDialog, setShowSchedulingDialog] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
  const [hasAvailabilityChanges, setHasAvailabilityChanges] = useState(false);
  const [activeAvailabilityTab, setActiveAvailabilityTab] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName);
    setLastName(user.lastName);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profilePicture = await apiService.getProfilePicture();
        setProfileImage(profilePicture);

        if (user.role === 'Teacher') {
          const instruments = await apiService.getAvailableInstruments();
          setAvailableInstruments(instruments);

          const result = await apiService.getTeacherInfo(user.id);
          if (result.teacher) {
            setBio(result.teacher.bio || '');
            setPrice(result.teacher.hourlyRate || 25);
            setInstruments(Array.isArray(result.teacher.instruments) ? result.teacher.instruments : []);
          }

          const availability = await apiService.getAvailability(user.id);
          setAvailabilitySlots(availability);
        }
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei dati",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
          <p className="text-gray-600 mb-4">Devi essere autenticato per accedere a questa pagina</p>
          <Button onClick={() => navigate('/login')}>Vai al Login</Button>
        </div>
      </div>
    );
  }

  const handleProfileImageChange = (file: File, previewUrl: string) => {
    setProfileImage(previewUrl);
    setSelectedFile(file);
  };

  const toggleStrum = (instrument: Instrument) => {
    setInstruments(prev => {
      const isSelected = prev.find(t => t.instrumentId === instrument.instrumentId);
      return isSelected
        ? prev.filter(t => t.instrumentId !== instrument.instrumentId)
        : [...prev, instrument];
    });
  };

  const handleSaveAvailability = async (updatedSlots: TimeSlot[]) => {
    try {
      console.log('Saving availability internally:', updatedSlots);

      setAvailabilitySlots(updatedSlots);
      setHasAvailabilityChanges(true);

      toast({
        title: "Disponibilità aggiornate localmente",
        description: `${updatedSlots.length} slot configurati. Ricorda di salvare il profilo per applicare le modifiche.`
      });

    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento della disponibilità",
        variant: "destructive"
      });
      throw error;
    }
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);

      const profileData = {
        firstName,
        lastName,
        profilePicture: selectedFile,
        bio,
        hourlyRate,
        instrumentIds: instruments.map(instrument => instrument.instrumentId)
      };

      const result = await apiService.updateProfile(profileData);
      const newProfilePicture = result.profilePicture || profilePicture;
      const updatedUser = { ...user, firstName, lastName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateUser({ firstName, lastName, profilePicture: newProfilePicture });

      if (hasAvailabilityChanges && user.role === 'Teacher') {
        try {
          await apiService.updateAvailability(availabilitySlots);
          console.log('Saving availability slots to backend:', availabilitySlots);

          setHasAvailabilityChanges(false);

          toast({
            title: "Profilo e Disponibilità Aggiornati",
            description: "Tutte le modifiche sono state salvate con successo"
          });
        } catch (availabilityError) {
          toast({
            title: "Profilo aggiornato",
            description: "Errore nel salvataggio della disponibilità",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Profilo Aggiornato",
          description: "Le modifiche sono state salvate con successo"
        });
      }

      setSelectedFile(null);
      setIsEditingTools(false);

    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfile = async () => {
    try {
      setIsLoading(true);
      await apiService.deleteAccount();

      toast({
        title: "Profilo Eliminato",
        description: "Il tuo profilo è stato eliminato con successo"
      });
      logout();
      navigate('/');
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.role === 'Teacher' ? 'Profilo Insegnante' : 'Profilo Studente'}
          </h1>
          <p className="text-gray-600">Gestisci le tue informazioni personali</p>
        </div>

        <div className="space-y-6">
          <ProfileBasicInfo
            firstName={firstName}
            lastName={lastName}
            email={user.email}
            profileImage={profilePicture}
            bio={bio}
            price={hourlyRate}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onProfileImageChange={handleProfileImageChange}
            onBioChange={setBio}
            onPriceChange={setPrice}
          />

          {user.role === 'Teacher' && (
            <InstrumentsTab
              instruments={instruments}
              availableInstruments={availableInstruments}
              isEditingInstrument={isEditingInstruments}
              onToggleEdit={() => setIsEditingTools(!isEditingInstruments)}
              onToggleInstrument={toggleStrum}
            />
          )}

          {user.role === 'Teacher' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Disponibilità per le Lezioni
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-2">
                      Gestisci i giorni e gli orari in cui sei disponibile per le lezioni.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        {availabilitySlots.length} slot disponibili configurati
                      </span>
                      {hasAvailabilityChanges && (
                        <span className="text-amber-600 font-medium">
                          (modifiche non salvate)
                        </span>
                      )}
                    </div>
                  </div>
                  <Dialog open={showSchedulingDialog} onOpenChange={setShowSchedulingDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Modifica Disponibilità
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Disponibilità</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="mb-6 flex justify-center">
                          <div className="inline-flex rounded-md bg-gray-100 p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveAvailabilityTab('daily')}
                              className={`px-3 py-1 text-sm ${activeAvailabilityTab === 'daily'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                              <CalendarDays className="h-4 w-4 mr-1" />
                              Giornaliera
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveAvailabilityTab('weekly')}
                              className={`px-3 py-1 text-sm ${activeAvailabilityTab === 'weekly'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                              <Repeat className="h-4 w-4 mr-1" />
                              Settimanale
                            </Button>
                          </div>
                        </div>

                        {activeAvailabilityTab === 'daily' && (
                          <SchedulingComponent
                            mode="availability"
                            availabilitySlots={availabilitySlots}
                            onSaveAvailability={handleSaveAvailability}
                            onCloseDialog={() => setShowSchedulingDialog(false)}
                          />
                        )}

                        {activeAvailabilityTab === 'weekly' && (
                          <SchedulingComponent
                            mode="availabilityRange"
                            availabilitySlots={availabilitySlots}
                            onSaveAvailability={handleSaveAvailability}
                            onCloseDialog={() => setShowSchedulingDialog(false)}
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          <ProfileActions
            showDeleteDialog={showDeleteDialog}
            onShowDeleteDialog={setShowDeleteDialog}
            onDeleteProfile={deleteProfile}
            onSaveProfile={saveProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
