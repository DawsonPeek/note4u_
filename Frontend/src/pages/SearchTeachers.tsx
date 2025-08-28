import {useEffect, useState} from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Loader } from 'lucide-react';
import TeacherCard from '@/components/TeacherCard';
import { CardTeacher, Instrument } from '@/types/user';
import { apiService } from '@/lib/api';

const SearchTeachers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstrument, setSelectedIntrument] = useState('all');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [teachers, setTeachers] = useState<CardTeacher[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [teachersData, instrumentsData] = await Promise.all([
          apiService.getTeachers(),
          apiService.getAvailableInstruments()
        ]);
        setTeachers(teachersData);
        setInstruments(instrumentsData);
        setError(null);
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError('Errore nel caricamento dei dati. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  const filteredTeachers = teachers
    .filter(teacher => {
      const matchesSearch = searchTerm === '' || 
        teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.instruments?.some(instrument =>
          instrument.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesTool = selectedInstrument === 'all' ||
        teacher.instruments?.some(instrument => instrument.name === selectedInstrument);
      
      return matchesSearch && matchesTool;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Caricamento insegnanti...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Riprova
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Trova l'Insegnante di Musica Perfetto
          </h1>
          <p className="text-muted-foreground">
            Scopri i migliori maestri per imparare a suonare il tuo strumento preferito
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per nome o strumento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Select value={selectedInstrument} onValueChange={setSelectedIntrument}>
                  <SelectTrigger>
                    <SelectValue placeholder="Strumento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli strumenti</SelectItem>
                    {instruments.map((instrument) => (
                      <SelectItem key={instrument.name} value={instrument.name}>
                        {instrument.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordina per" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphabetical">Alfabetico</SelectItem>
                    <SelectItem value="rating">Valutazione</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Trovati {filteredTeachers.length} insegnanti
          </p>
        </div>

        {filteredTeachers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessun insegnante trovato
              </h3>
              <p className="text-muted-foreground">
                Prova a modificare i filtri di ricerca per trovare più risultati
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.userId} teacher={teacher} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTeachers;
