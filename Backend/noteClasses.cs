using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace note4u

{
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginResponse
    {
        public string Token { get; set; }
        public string Username { get; set; }
        public int Expiration { get; set; }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        [Required]
        [StringLength(50, MinimumLength = 8)]
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool IsTeacher { get; set; } = false;
    }

    public class UpdateProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public IFormFile? ProfilePicture { get; set; }
        public string? Bio { get; set; }
        public decimal? HourlyRate { get; set; }
        public List<int>? InstrumentIds { get; set; }
    }

    public class AvailabilitySlotRequest
    {
        public DateOnly Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }

    public class PostRatingRequest
    {
        public int TeacherId { get; set; }
        public int Rating { get; set; }
    }

    public class LessonRequest
    {
        public int TeacherId { get; set; }
        public DateOnly Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public decimal Price { get; set; }
    }

    [Table("users")]
    public class User
    {
        [Key]
        public int UserId { get; set; }

        public string Username { get; set; }

        public string Email { get; set; }

        public string PasswordHash { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? ProfilePicture { get; set; }

        public string Role { get; set; }
    }

    [Table("teacherprofiles")]
    public class Teacher
    {
        public int TeacherId { get; set; }

        public int UserId { get; set; }
        
        public string? Bio { get; set; }
        
        public decimal? HourlyRate { get; set; }
        
        public User User { get; set; }
    }

    public class ProfilePictureUpdateRequest
    {
        [Required]
        public string ProfilePictureUrl { get; set; }
    }

    [Table("roles")]
    public class Role
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; }
    }

    [Table("instruments")]
    public class Instrument
    {
        public int InstrumentId { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
    }

    [Table("teacherinstruments")]
    public class TeacherInstrument
    {
        public int TeacherInstrumentId { get; set; }
        public int TeacherId { get; set; }
        public int InstrumentId { get; set; }

        public Teacher Teacher { get; set; }
        public Instrument Instrument { get; set; }
    }

    public class AssignInstrumentsRequest
    {
        public List<string> Names { get; set; }
    }

    [Table("lessons")]
    public class Lesson
    {
        [Key]
        public int BookingId { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public DateOnly Date { get; set; }
        public decimal Price { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? MeetingLink { get; set; }
    }

    [Table("reviews")]
    public class Review
    {
        [Key]
        public int RatingId { get; set; }
        public int TeacherId { get; set; }
        public int Rating { get; set; }
        public int StudentId { get; set; }
    }

    [Table("teacheravailability")]
    public class TeacherAvailability
    {
        [Key]
        public int AvailabilityId { get; set; }
        public int TeacherId { get; set; }
        public DateOnly Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }

}
