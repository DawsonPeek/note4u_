import { User, Lesson, CardTeacher, Instrument, Teacher, TimeSlot, RegisterRequest, UpdateRequest, LessonRequest } from '@/types/user';

const API_URL = 'http://localhost:5258';

class ApiService {
  private getHeaders(isFormData: boolean = false) {
    const token = localStorage.getItem('token');
    const headers = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username: email, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`${response.status}: ${errorData.message}`);
    }

    const data = await response.json();
    return data.token;
  }

  async register(userData: RegisterRequest): Promise<void> {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }
  }

  async createLesson(lessonRequest: LessonRequest): Promise<void> {
    const response = await fetch(`${API_URL}/create-lesson`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(lessonRequest)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }
  }

  async postRating(teacherId: string, rating: number): Promise<void> {
    const response = await fetch(`${API_URL}/rating`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        teacherId: parseInt(teacherId),
        rating: rating
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }
  }

  async updateProfile(profileData: UpdateRequest): Promise<{ profilePicture: string }> {
    const formData = new FormData();
    formData.append('FirstName', profileData.firstName || '');
    formData.append('LastName', profileData.lastName || '');
    formData.append('Bio', profileData.bio || '');
    formData.append('HourlyRate', profileData.hourlyRate?.toString() || '');

    if (profileData.profilePicture) {
      formData.append('ProfilePicture', profileData.profilePicture);
    }

    if (profileData.instrumentIds) {
      profileData.instrumentIds.forEach((id, index) => {
        formData.append(`InstrumentIds[${index}]`, id.toString());
      });
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }

    const data = await response.json();
    return { profilePicture: data.profilePicture || '' };
  }

  async updateAvailability(slots: TimeSlot[]): Promise<void> {
    const availabilitySlots = slots.map(slot => ({
      Date: slot.date,
      StartTime: slot.startTime.split(':').length === 2 ? slot.startTime + ':00' : slot.startTime,
      EndTime: slot.endTime.split(':').length === 2 ? slot.endTime + ':00' : slot.endTime
    }));

    const response = await fetch(`${API_URL}/availability`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(availabilitySlots)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }
  }


  async getProfilePicture(): Promise<string> {
    const response = await fetch(`${API_URL}/profile-picture`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }

    const data = await response.json();
    return data.profilePicture;
  }

  async getLessons(): Promise<Lesson[]> {
    const response = await fetch(`${API_URL}/lessons`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Errore nel caricamento delle lezioni');
    return response.json();
  }

  async getRatingRight(teacherId: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/rating/${teacherId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }

    return response.json();
  }

  async getAvailability(teacherId: string): Promise<TimeSlot[]> {
    const response = await fetch(`${API_URL}/availability/${teacherId}`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Errore di caricamento della disponibilità');
    return response.json();
  }

  async getTeachers(): Promise<CardTeacher[]> {
    const response = await fetch(`${API_URL}/teachers`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }

    return await response.json();
  }

  async getTeacherInfo(teacherId: string): Promise<{ teacher: Teacher }> {
    const response = await fetch(`${API_URL}/teachers/${teacherId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message);
    }

    const data = await response.json();

    const teacher: Teacher = {
      ...data,
      id: teacherId,
      role: 'Teacher',
      availability: data.availability || [],
      totalLessons: data.totalLessons,
      rating: data.rating
    };

    return { teacher };
  }

  async getAvailableInstruments(): Promise<Instrument[]> {
    const response = await fetch(`${API_URL}/instruments`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Errore nel caricamento degli strumenti');
    return response.json();
  }

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Errore nel caricamento degli utenti');
    return response.json();
  }

  async getAllLessons(): Promise<Lesson[]> {
    const response = await fetch(`${API_URL}/admin/lessons`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Errore nel caricamento delle lezioni');
    return response.json();
  }

  async deleteUserAdmin(userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Errore durante l\'eliminazione dell\'utente');
  }

  async deleteLessonAdmin(lessonId: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Errore durante l\'eliminazione della lezione');
  }

  async deleteLesson(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/lessons/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Errore durante la rimozione della lezione');
  }

  async deleteAccount(): Promise<void> {
    const response = await fetch(`${API_URL}/account`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) { throw new Error('Errore durante la cancellazione dell\'account'); }
  }
}

export const apiService = new ApiService();
