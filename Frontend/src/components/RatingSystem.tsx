import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface RatingSystemProps {
  teacherId: string;
  canRate: boolean;
  onSubmitRating: (rating: number) => void;
}

const RatingSystem = ({ canRate, onSubmitRating }: RatingSystemProps) => {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmitRating = () => {
    if (rating === 0) {
      toast({
        title: "Valutazione richiesta",
        description: "Per favore seleziona una valutazione da 1 a 5 stelle",
        variant: "destructive"
      });
      return;
    }
    onSubmitRating(rating);
    setShowRatingDialog(false);
    setRating(0);
  };

  if (!canRate) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">
            Non puoi valutare questo insegnante.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2 mx-auto">
            <Star className="h-4 w-4" />
            <span>Valuta Insegnante</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valuta l'Insegnante</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="text-center">
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleSubmitRating}>
              Invia Valutazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatingSystem;
