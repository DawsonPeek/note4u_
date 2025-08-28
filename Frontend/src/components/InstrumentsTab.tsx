import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit, X } from 'lucide-react';
import { Instrument } from '@/types/user';

interface InstrumentsProps {
  instruments: Instrument[];
  availableInstruments: Instrument[];
  isEditingInstrument: boolean;
  onToggleEdit: () => void;
  onToggleInstrument: (tool: Instrument) => void;
}

const InstrumentsTab = ({
    instruments,
    availableInstruments,
    isEditingInstrument,
    onToggleEdit,
    onToggleInstrument
}: InstrumentsProps) => {

  return (
      <Card>
        <CardHeader>
          <CardTitle>Strumenti di Insegnamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Strumenti Selezionati:</Label>
              {instruments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {instruments.map(selectedInstrument => (
                        <Badge key={selectedInstrument.instrumentId} variant="default" className="flex items-center space-x-1">
                          <span>{selectedInstrument.name}</span>
                          {isEditingInstrument && (
                              <button
                                  onClick={() => onToggleInstrument(selectedInstrument)}
                                  className="ml-1 hover:text-red-300"
                              >
                                <X className="h-3 w-3" />
                              </button>
                          )}
                        </Badge>
                    ))}
                  </div>
              ) : (
                  <p className="text-gray-500 text-sm">Nessuno strumento selezionato</p>
              )}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={onToggleEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              {isEditingInstrument ? 'Fine Modifica' : 'Modifica'}
            </Button>
          </div>

          {isEditingInstrument && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Strumenti Disponibili:</Label>
                {availableInstruments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableInstruments.map(instrument => {
                        const isSelected = instruments.find(t => t.instrumentId === instrument.instrumentId);
                        return (
                            <Card
                                key={instrument.instrumentId}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                                }`}
                                onClick={() => onToggleInstrument(instrument)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{instrument.name}</h4>
                                    {instrument.description && (
                                        <p className="text-xs text-gray-600 mt-1">{instrument.description}</p>
                                    )}
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {instrument.category}
                                    </Badge>
                                  </div>
                                  {isSelected && (
                                      <X className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                        );
                      })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Caricamento strumenti disponibili...</p>
                    </div>
                )}
              </div>
          )}
        </CardContent>
      </Card>
  );
};

export default InstrumentsTab;