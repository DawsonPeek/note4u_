
import { CardTeacher, Teacher } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {encodeTeacherId} from "@/lib/utils.ts";

const backendUrl = "http://localhost:5258";

interface TeacherCardProps {
  teacher: CardTeacher;
}

const TeacherCard = ({ teacher }: TeacherCardProps) => {
  const navigate = useNavigate();
  const teacherInstruments = teacher.instruments || [];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
      <div className="relative h-32">
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
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="text-lg font-semibold">{teacher.firstName} {teacher.lastName}</h3>
          <div className="flex items-center space-x-1 text-sm">
            <Star className="h-3 w-3 fill-current" />
            <span>{teacher.rating}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-1 mb-4">
          {teacherInstruments.map((instrument) => (
              <Badge key={instrument.name} variant="secondary" className="text-xs">
                {instrument.name}
              </Badge>
          ))}
        </div>

        <div className="mt-auto">
          <Button
              className="w-full"
              onClick={() => navigate(`/teacher/${encodeTeacherId(teacher.userId)}`)}
          >
            Visualizza Profilo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCard;
