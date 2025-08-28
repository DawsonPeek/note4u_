export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
}

export interface Teacher extends User {
  bio: string;
  instruments: Instrument[];
  availability: TimeSlot[];
  totalLessons: number;
  rating: number;
  hourlyRate: number;
}

export interface Instrument {
  instrumentId: number;
  name: string;
  category: string;
  description: string;
}

export interface TimeSlot {
  availabilityId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Lesson {
  bookingId: string;
  teacherId: string;
  studentId: string;
  student: string;
  teacher: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  studentProfilePicture?: string;
  teacherProfilePicture?: string;
  meetingLink?: string;
}

export interface CardTeacher {
  userId: string;
  firstName: string;
  lastName: string;
  rating: number;
  profilePicture?: string;
  instruments: Instrument[];
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  isTeacher: boolean;
}

export interface UpdateRequest {
  firstName?: string;
  lastName?: string;
  profilePicture?: File;
  bio?: string;
  hourlyRate?: number;
  instrumentIds?: number[];
}

export interface LessonRequest {
  teacherId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}
