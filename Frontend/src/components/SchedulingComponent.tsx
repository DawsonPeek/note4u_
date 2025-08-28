import { useMemo, useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { format, eachDayOfInterval, getDay } from "date-fns";
import { it } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Copy } from "lucide-react";
import { TimeSlot } from '@/types/user';
import * as ToggleGroup from "@radix-ui/react-toggle-group";

type Range = { id: string; start: string; end: string };
type WeeklyRange = { id: string; day: number; start: string; end: string };

interface SchedulingComponentProps {
  mode: "availability" | "availabilityRange" | "booking";
  availabilitySlots?: TimeSlot[];
  existingBookings?: { id: string; slot_id: string; student_id: string }[];
  onSaveAvailability?: (updatedSlots: TimeSlot[]) => Promise<void>;
  onBookSlot?: (slotId: string, studentId: string) => Promise<void>;
  onCloseDialog?: () => void;
}

const SchedulingComponent = ({
  mode,
  availabilitySlots = [],
  existingBookings = [],
  onSaveAvailability,
  onBookSlot,
}: SchedulingComponentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dates, setDates] = useState<Date[] | undefined>(undefined);
  const [ranges, setRanges] = useState<Range[]>([]);
  const [saving, setSaving] = useState(false);
  const [bulkDates, setBulkDates] = useState<Date[]>([]);
  const [selectionOrder, setSelectionOrder] = useState<Date[]>([]);
  const [weeklyRanges, setWeeklyRanges] = useState<WeeklyRange[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>(availabilitySlots);

  useEffect(() => {
    setLocalSlots(availabilitySlots);
  }, [availabilitySlots]);

  useEffect(() => {
    if (mode !== "availability" || !dates || dates.length === 0) return;

    if (dates.length === 1) {
      const selectedDate = format(dates[0], "yyyy-MM-dd");
      const existingRangesForDay = localSlots
        .filter(slot => slot.date === selectedDate)
        .map(slot => ({
          id: slot.availabilityId,
          start: slot.startTime,
          end: slot.endTime
        }));

      setRanges(existingRangesForDay.length > 0 ? existingRangesForDay : []);
    } else if (dates.length > 1) {
      setRanges([]);
    }
  }, [dates, localSlots, mode]);

  const getDayName = (dayIndex: number): string => {
    const days = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
    return days[dayIndex];
  };

  const hasOverlap = (ranges: Range[]): boolean => {
    const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].end > sorted[i].start) return true;
    }
    return false;
  };

  const generateUniqueId = (): string => crypto.randomUUID();

  const addRange = () => {
    setRanges(prev => [...prev, { id: generateUniqueId(), start: "10:00", end: "11:00" }]);
  };

  const updateRange = (id: string, patch: Partial<Range>) => {
    setRanges(prev => prev.map(range => range.id === id ? { ...range, ...patch } : range));
  };

  const removeRange = (id: string) => {
    setRanges(prev => prev.filter(range => range.id !== id));
  };

  const preview = useMemo(() => {
    if (mode !== "availability" || !dates) return [];
    return dates.flatMap(date =>
      ranges.map(range => ({
        date: format(date, "yyyy-MM-dd"),
        start: range.start,
        end: range.end,
        key: `${format(date, "yyyy-MM-dd")}-${range.start}-${range.end}`,
      }))
    );
  }, [dates, ranges, mode]);

  const handleBulkDateSelect = (selectedDates: Date[] | undefined) => {
    if (!selectedDates || selectedDates.length === 0) {
      setBulkDates([]);
      setSelectionOrder([]);
      return;
    }

    if (selectedDates.length === 1) {
      setBulkDates(selectedDates);
      setSelectionOrder(selectedDates);
    } else if (selectedDates.length === 2) {
      const newDate = selectedDates.find(date =>
        !selectionOrder.some(orderDate => orderDate.getTime() === date.getTime())
      );

      if (newDate) {
        const newOrder = [...selectionOrder, newDate];
        setSelectionOrder(newOrder);
        const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        setBulkDates(sortedDates);
      }
    } else {
      const newDate = selectedDates.find(date =>
        !bulkDates.some(existingDate => existingDate.getTime() === date.getTime())
      );

      if (newDate && selectionOrder.length >= 2) {
        const [oldestDate, ...rest] = selectionOrder;
        const newOrder = [...rest, newDate];
        setSelectionOrder(newOrder);

        const newBulkDates = bulkDates.filter(date =>
          date.getTime() !== oldestDate.getTime()
        );
        newBulkDates.push(newDate);

        const sortedDates = newBulkDates.sort((a, b) => a.getTime() - b.getTime());
        setBulkDates(sortedDates);
      }
    }
  };

  const handleDaysChange = (values: string[]) => {
    setSelectedDays(values);
  };

  const addWeeklyRange = (day: number) => {
    setWeeklyRanges(prev => [...prev, {
      id: generateUniqueId(),
      day,
      start: "10:00",
      end: "11:00"
    }]);
  };

  const updateWeeklyRange = (id: string, patch: Partial<Omit<WeeklyRange, "day">>) => {
    setWeeklyRanges(prev => prev.map(range => range.id === id ? { ...range, ...patch } : range));
  };

  const removeWeeklyRange = (id: string) => {
    setWeeklyRanges(prev => prev.filter(range => range.id !== id));
  };

  const copyFromDay = (fromDay: number) => {
    const rangesForDay = weeklyRanges.filter(range => range.day === fromDay);
    selectedDays.forEach(day => {
      const dayNumber = parseInt(day);
      if (dayNumber !== fromDay) {
        setWeeklyRanges(prev => prev.filter(range => range.day !== dayNumber));
        rangesForDay.forEach(range => {
          setWeeklyRanges(prev => [...prev, {
            id: generateUniqueId(),
            day: dayNumber,
            start: range.start,
            end: range.end
          }]);
        });
      }
    });
    toast({
      title: "Orari copiati",
      description: `Orari copiati dal giorno ${getDayName(fromDay)} agli altri giorni selezionati`
    });
  };

  const applyWeeklyTemplate = () => {
    if (bulkDates.length !== 2) {
      toast({ title: "Seleziona esattamente 2 giorni per definire il range" });
      return;
    }

    const [startDate, endDate] = bulkDates.sort((a, b) => a.getTime() - b.getTime());
    const allDatesInRange = eachDayOfInterval({ start: startDate, end: endDate });
    const filteredDates = allDatesInRange.filter(date => {
      const dayIndex = getDay(date);
      return selectedDays.includes(dayIndex.toString());
    });

    const newSlots: TimeSlot[] = [];
    filteredDates.forEach(date => {
      const dayIndex = getDay(date);
      const rangesForDay = weeklyRanges.filter(range => range.day === dayIndex);

      rangesForDay.forEach(range => {
        newSlots.push({
          availabilityId: `${Date.now()}-${Math.random()}`,
          date: format(date, "yyyy-MM-dd"),
          startTime: range.start,
          endTime: range.end,
        });
      });
    });

    const dateStrings = filteredDates.map(d => format(d, "yyyy-MM-dd"));
    const filteredExistingSlots = localSlots.filter(slot =>
      !dateStrings.includes(slot.date)
    );

    const finalSlots = [...filteredExistingSlots, ...newSlots];
    setLocalSlots(finalSlots);

    toast({
      title: "Template settimanale applicato",
      description: `Generati ${newSlots.length} slot per ${filteredDates.length} giorni`
    });

    return finalSlots;
  };

  const bookedSet = useMemo(() =>
    new Set(existingBookings.map(booking => booking.slot_id)),
    [existingBookings]
  );

  const slotsForDay = useMemo(() => {
    if (mode !== "booking" || !selectedDate) return [];
    const dateString = format(selectedDate, "yyyy-MM-dd");
    return localSlots.filter(slot => slot.date === dateString);
  }, [localSlots, selectedDate, mode]);

  const availableForDay = useMemo(() =>
    slotsForDay.filter(slot => !bookedSet.has(slot.availabilityId)),
    [slotsForDay, bookedSet]
  );

  const confirmBooking = async () => {
    if (!user || !selectedSlot) return;

    try {
      if (onBookSlot) {
        await onBookSlot(selectedSlot.availabilityId, user.id);
      }
      setSelectedSlot(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore sconosciuto";
      toast({ title: "Impossibile prenotare", description: message });
    }
  };

  const datesWithSlots = useMemo(() => {
    const slots = localSlots.map(slot => new Date(slot.date + 'T00:00:00'));
    return slots;
  }, [localSlots]);



  const save = async () => {
    if (!user) return;

    if (mode === "availability") {
      if (!dates || dates.length === 0) {
        toast({ title: "Seleziona almeno un giorno" });
        return;
      }

      if (ranges.length > 0) {
        if (ranges.some(range => range.end <= range.start)) {
          toast({
            title: "Orari non validi",
            description: "Ogni fascia deve avere fine successiva all'inizio."
          });
          return;
        }
        if (hasOverlap(ranges)) {
          toast({
            title: "Fasce sovrapposte",
            description: "Le fasce orarie del giorno non devono sovrapporsi."
          });
          return;
        }
      }
    }

    setSaving(true);
    try {
      let finalSlots: TimeSlot[];

      if (mode === "availability") {
        const selectedDateStrings = dates!.map(d => format(d, "yyyy-MM-dd"));
        const filteredSlots = localSlots.filter(slot =>
          !selectedDateStrings.includes(slot.date)
        );

        const newSlots: TimeSlot[] = preview.map((prew, index) => ({
          availabilityId: `${Date.now()}-${index}`,
          date: prew.date,
          startTime: prew.start,
          endTime: prew.end,
        }));

        finalSlots = [...filteredSlots, ...newSlots];
        setLocalSlots(finalSlots);

        toast({
          title: "Disponibilità salvate",
          description: ranges.length === 0
            ? "Fasce orarie rimosse per i giorni selezionati"
            : `${newSlots.length} slot aggiornati`
        });
      } else if (mode === "availabilityRange") {
        const result = applyWeeklyTemplate();
        if (!result) return;
        finalSlots = result;

        toast({
          title: "Disponibilità salvate",
          description: "Template settimanale applicato con successo"
        });
      } else {
        return;
      }

      if (onSaveAvailability) {
        await onSaveAvailability(finalSlots);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore sconosciuto";
      toast({ title: "Errore", description: message });
      setLocalSlots(availabilitySlots);
    } finally {
      setSaving(false);
    }
  };

  const renderAvailabilityMode = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleziona giorni</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="multiple"
              selected={dates}
              onSelect={setDates}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date <= today;
              }}
              modifiers={{
                hasSlots: datesWithSlots
              }}
              components={{
                DayContent: ({ date }) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const hasSlots = localSlots.some(slot => slot.date === dateStr);

                  return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      <span>{date.getDate()}</span>
                      {hasSlots && (
                        <div
                          style={{
                            width: '4px',
                            height: '4px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            marginTop: '1px'
                          }}
                        />
                      )}
                    </div>
                  );
                }
              }}
              className="p-3 pointer-events-auto mx-auto [&_[aria-selected=true]]:!bg-primary [&_[aria-selected=true]]:!text-primary-foreground"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {dates && dates.length === 1
                ? "Modifica fasce orarie per il giorno selezionato"
                : "Imposta fasce orarie (più per giorno)"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!dates || dates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Seleziona uno o più giorni dal calendario per impostare le fasce orarie.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ranges.map((range) => (
                  <div key={range.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div>
                      <label className="text-sm">Inizio</label>
                      <Input
                        type="time"
                        value={range.start.substring(0, 5)}
                        onChange={(e) => updateRange(range.id, { start: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm">Fine</label>
                      <Input
                        type="time"
                        value={range.end.substring(0, 5)}
                        onChange={(e) => updateRange(range.id, { end: e.target.value })}
                      />
                    </div>
                    <Button variant="secondary" onClick={() => removeRange(range.id)}>
                      Rimuovi
                    </Button>
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={addRange} className="flex-1">
                    + Aggiungi
                  </Button>
                  <Button onClick={save} disabled={saving} className="flex-1">
                    {saving ? "Salvando..." : "Salva"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {dates && dates.length > 1 && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Selezionando più giorni, le fasce orarie esistenti per quei giorni verranno sovrascritte.
          </span>
        </div>
      )}
    </div>
  );

  const renderAvailabilityRangeMode = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleziona range di date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div>
              <Calendar
                mode="multiple"
                selected={bulkDates}
                onSelect={handleBulkDateSelect}
                disabled={(date) => date <= new Date()}
                modifiers={{
                  hasSlots: datesWithSlots
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const hasSlots = localSlots.some(slot => slot.date === dateStr);

                    return (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                      }}>
                        <span>{date.getDate()}</span>
                        {hasSlots && (
                          <div
                            style={{
                              width: '4px',
                              height: '4px',
                              backgroundColor: '#ef4444',
                              borderRadius: '50%',
                              marginTop: '1px'
                            }}
                          />
                        )}
                      </div>
                    );
                  }
                }}
                className="p-3 pointer-events-auto mx-auto"
              />
              {bulkDates.length === 2 && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    Periodo: {format(bulkDates[0], "dd/MM/yyyy")} - {format(bulkDates[1], "dd/MM/yyyy")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Configura modello settimanale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <ToggleGroup.Root
                type="multiple"
                className="flex flex-wrap gap-1"
                value={selectedDays}
                onValueChange={handleDaysChange}
              >
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <ToggleGroup.Item
                    key={day}
                    value={day.toString()}
                    className={`px-3 py-2 rounded-md border ${selectedDays.includes(day.toString())
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent hover:bg-secondary"
                      }`}
                  >
                    {getDayName(day).substring(0, 3)}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup.Root>
            </div>

            {selectedDays.length > 0 && (
              <>
                <div className="max-h-64 overflow-y-auto space-y-4">
                  {selectedDays.map(day => {
                    const dayNumber = parseInt(day);
                    const rangesForDay = weeklyRanges.filter(range => range.day === dayNumber);

                    return (
                      <div key={day} className="border p-4 rounded-md space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{getDayName(dayNumber)}</h3>
                          {selectedDays.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyFromDay(dayNumber)}
                              className="flex items-center gap-1"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copia agli altri giorni</span>
                            </Button>
                          )}
                        </div>

                        {rangesForDay.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Nessuna fascia oraria configurata
                          </p>
                        ) : (
                          rangesForDay.map(range => (
                            <div key={range.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                              <div>
                                <label className="text-sm">Inizio</label>
                                <Input
                                  type="time"
                                  value={range.start.substring(0, 5)}
                                  onChange={(e) => updateWeeklyRange(range.id, { start: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-sm">Fine</label>
                                <Input
                                  type="time"
                                  value={range.end.substring(0, 5)}
                                  onChange={(e) => updateWeeklyRange(range.id, { end: e.target.value })}
                                />
                              </div>
                              <Button
                                variant="secondary"
                                onClick={() => removeWeeklyRange(range.id)}
                              >
                                Rimuovi
                              </Button>
                            </div>
                          ))
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addWeeklyRange(dayNumber)}
                        >
                          + Aggiungi
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4">
                  <Button onClick={save} disabled={saving} className="w-full">
                    {saving ? "Salvando..." : "Salva"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBookingMode = () => (
    <div className="flex gap-6">
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date <= today;
            }}
            modifiers={{
              hasSlots: datesWithSlots
            }}
            components={{
              DayContent: ({ date }) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const hasSlots = localSlots.some(slot => slot.date === dateStr);

                return (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    <span>{date.getDate()}</span>
                    {hasSlots && (
                      <div
                        style={{
                          width: '4px',
                          height: '4px',
                          backgroundColor: '#ef4444',
                          borderRadius: '50%',
                          marginTop: '1px'
                        }}
                      />
                    )}
                  </div>
                );
              }
            }}
            className="p-3 pointer-events-auto mx-auto"
          />
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Slot disponibili</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedDate && format(selectedDate, "PPP")}
          </p>
          <div className="space-y-3">
            {availableForDay.map((slot) => (
              <div key={slot.availabilityId} className="flex items-center justify-between rounded-md border p-3">
                <div className="font-medium">
                  {slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Accedi per prenotare",
                            description: "Devi effettuare l'accesso per prenotare uno slot."
                          });
                          return;
                        }
                        setSelectedSlot(slot);
                      }}
                    >
                      Prenota
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Conferma prenotazione</DialogTitle>
                      <DialogDescription className="text-center">
                        Sei sicuro di voler prenotare la lezione del{" "}
                        <strong>{selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: it }) : ""}</strong>{" "}
                        alle <strong>{slot.startTime.substring(0, 5)}</strong>?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary" onClick={() => setSelectedSlot(null)}>
                          Annulla
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={confirmBooking}>
                          Conferma
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
            {availableForDay.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nessun slot disponibile per questo giorno
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (mode) {
    case "availability":
      return renderAvailabilityMode();
    case "availabilityRange":
      return renderAvailabilityRangeMode();
    case "booking":
      return renderBookingMode();
    default:
      return null;
  }
};

export default SchedulingComponent;
