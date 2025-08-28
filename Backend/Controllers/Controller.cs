using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using note4u.Models;
using System.Data;
using Microsoft.EntityFrameworkCore;

namespace note4u.Controllers;

[ApiController]
[Route("[controller]")]
public class Controller : ControllerBase
{
    private readonly MusicTeachingContext dbContext;
    private readonly JwtService jwtService;
    private readonly IJitsiService jitsiService;
    private readonly string imagesPath;

    public Controller(MusicTeachingContext dbContext, JwtService jwtService, IJitsiService jitsiService)
    {
        this.dbContext = dbContext;
        this.jwtService = jwtService;
        this.jitsiService = jitsiService;
        this.imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest login)
    {
        var result = await jwtService.Authenticate(login);
        if (result == null)
            return Unauthorized();
        return result;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest register)
    {
        if (await dbContext.Users.AnyAsync(u => u.Username == register.Username))
        {
            return BadRequest();
        }

        if (await dbContext.Users.AnyAsync(u => u.Email == register.Email))
        {
            return BadRequest();
        }

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(register.Password);

        var user = new User
        {
            Username = register.Username,
            Email = register.Email,
            PasswordHash = passwordHash,
            FirstName = register.FirstName,
            LastName = register.LastName,
            CreatedAt = DateTime.UtcNow,
            Role = register.IsTeacher ? "Teacher" : "Student"
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        if (register.IsTeacher)
        {
            var teacherProfile = new Teacher
            {
                UserId = user.UserId
            };

            dbContext.TeacherProfiles.Add(teacherProfile);
            await dbContext.SaveChangesAsync();
        }

        return Ok();
    }

    [Authorize(Roles = "Student")]
    [HttpPost("create-lesson")]
    public async Task<IActionResult> CreateLesson(LessonRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        int studentId = int.Parse(userIdClaim.Value);

        var teacherProfile = await dbContext.TeacherProfiles.FirstOrDefaultAsync(t => t.UserId == request.TeacherId);
        if (teacherProfile == null)
            return NotFound();

        int teacherId = teacherProfile.TeacherId;

        var slot = await dbContext.TeacherAvailability.FirstOrDefaultAsync(a =>
            a.TeacherId == teacherId &&
            a.Date == request.Date &&
            a.StartTime == request.StartTime &&
            a.EndTime == request.EndTime);

        if (slot != null)
            dbContext.TeacherAvailability.Remove(slot);

        var lesson = new Lesson
        {
            StudentId = studentId,
            TeacherId = teacherId,
            Date = request.Date,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Price = request.Price,
        };

        dbContext.Lessons.Add(lesson);
        await dbContext.SaveChangesAsync();

        var meetingSubject = $"note4u_{request.Date:yyyy_MM_dd}";
        var meetingUrl = jitsiService.CreateMeetingRoom(meetingSubject, lesson.BookingId);

        lesson.MeetingLink = meetingUrl;
        await dbContext.SaveChangesAsync();

        return Ok();
    }

    [Authorize(Roles = "Student")]
    [HttpPost("rating")]
    public async Task<IActionResult> PostRating([FromBody] PostRatingRequest request)
    {
        var teacherProfile = await dbContext.TeacherProfiles
            .FirstOrDefaultAsync(t => t.UserId == request.TeacherId);

        if (teacherProfile == null)
            return NotFound();

        int teacherId = teacherProfile.TeacherId;

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        int studentId = int.Parse(userIdClaim.Value);

        bool hasVoted = await dbContext.Ratings
            .AnyAsync(r => r.TeacherId == teacherId && r.StudentId == studentId);

        if (hasVoted)
            return BadRequest();

        var review = new Review
        {
            TeacherId = teacherId,
            StudentId = studentId,
            Rating = request.Rating
        };

        dbContext.Ratings.Add(review);
        await dbContext.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileRequest profile)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        var user = await dbContext.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        if (profile.FirstName != null) user.FirstName = profile.FirstName;
        if (profile.LastName != null) user.LastName = profile.LastName;

        if (profile.ProfilePicture != null)
        {
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                var oldPath = Path.Combine(imagesPath, Path.GetFileName(user.ProfilePicture));
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(profile.ProfilePicture.FileName)}";
            var filePath = Path.Combine(imagesPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profile.ProfilePicture.CopyToAsync(stream);
            }

            user.ProfilePicture = $"/images/{fileName}";
        }

        if (user.Role == "Teacher")
        {
            var teacher = await dbContext.TeacherProfiles.FirstOrDefaultAsync(t => t.UserId == userId);
            if (teacher != null)
            {
                if (profile.Bio != null) teacher.Bio = profile.Bio;
                if (profile.HourlyRate != null) teacher.HourlyRate = profile.HourlyRate;

                if (profile.InstrumentIds != null)
                {
                    var existing = dbContext.TeacherInstruments.Where(ti => ti.TeacherId == teacher.TeacherId);
                    dbContext.TeacherInstruments.RemoveRange(existing);

                    foreach (var instrumentId in profile.InstrumentIds)
                    {
                        dbContext.TeacherInstruments.Add(new TeacherInstrument
                        {
                            TeacherId = teacher.TeacherId,
                            InstrumentId = instrumentId
                        });
                    }
                }
            }
        }

        await dbContext.SaveChangesAsync();
        return Ok(new { profilePicture = user.ProfilePicture });
    }

    [Authorize(Roles = "Teacher")]
    [HttpPut("availability")]
    public async Task<IActionResult> UpdateAvailability([FromBody] List<AvailabilitySlotRequest> slots)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        var teacherProfile = await dbContext.TeacherProfiles
            .FirstOrDefaultAsync(t => t.UserId == userId);

        if (teacherProfile == null)
            return NotFound();

        int teacherId = teacherProfile.TeacherId;

        var oldSlots = dbContext.TeacherAvailability.Where(a => a.TeacherId == teacherId);
        dbContext.TeacherAvailability.RemoveRange(oldSlots);

        foreach (var slot in slots)
        {
            dbContext.TeacherAvailability.Add(new TeacherAvailability
            {
                TeacherId = teacherId,
                Date = slot.Date,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime
            });
        }

        await dbContext.SaveChangesAsync();

        return Ok();
    }


    [HttpGet("teachers")]
    public async Task<IActionResult> GetTeachersList()
    {
        var teachers = await (
            from u in dbContext.Users
            where u.Role == "Teacher"
            join tp in dbContext.TeacherProfiles on u.UserId equals tp.UserId
            select new
            {
                u.UserId,
                u.FirstName,
                u.LastName,
                u.ProfilePicture,
                tp.TeacherId,
                tp.HourlyRate
            }
        ).ToListAsync();

        var result = new List<object>();
        foreach (var teacher in teachers)
        {
            var instruments = await dbContext.TeacherInstruments
                .Where(ti => ti.TeacherId == teacher.TeacherId)
                .Select(ti => ti.Instrument)
                .ToListAsync();

            var rating = await dbContext.Ratings
                .Where(r => r.TeacherId == teacher.TeacherId)
                .Select(r => (double?)r.Rating)
                .AverageAsync() ?? 0.0;

            result.Add(new
            {
                teacher.UserId,
                teacher.FirstName,
                teacher.LastName,
                teacher.ProfilePicture,
                teacher.HourlyRate,
                Instruments = instruments,
                Rating = rating
            });
        }

        return Ok(result);
    }

    [Authorize]
    [HttpGet("profile-picture")]
    public async Task<IActionResult> GetProfilePicture()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        var user = await dbContext.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(new { profilePicture = user.ProfilePicture });
    }

    [Authorize(Roles = "Student")]
    [HttpGet("rating/{userId:int}")]
    public async Task<IActionResult> GetRatingRight(int userId)
    {
        var teacherProfile = await dbContext.TeacherProfiles
            .FirstOrDefaultAsync(t => t.UserId == userId);

        if (teacherProfile == null)
            return NotFound();

        int teacherId = teacherProfile.TeacherId;

        var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (studentIdClaim == null)
            return Unauthorized();

        int studentId = int.Parse(studentIdClaim.Value);

        bool hasVoted = await dbContext.Ratings
            .AnyAsync(r => r.TeacherId == teacherId && r.StudentId == studentId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        bool pastLesson = await dbContext.Lessons
            .AnyAsync(l => l.TeacherId == teacherId && l.StudentId == studentId && l.Date < today);

        bool canVote = !hasVoted && pastLesson;

        return Ok(canVote);
    }

    [Authorize]
    [HttpGet("teachers/{teacherId:int}")]
    public async Task<IActionResult> GetTeacherInfo(int teacherId)
    {
        var teacherProfile = await dbContext.TeacherProfiles
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.UserId == teacherId);

        if (teacherProfile == null)
            return NotFound();

        var instruments = await dbContext.TeacherInstruments
            .Where(ti => ti.TeacherId == teacherProfile.TeacherId)
            .Select(ti => ti.Instrument)
            .ToListAsync();

        var totalLessons = await dbContext.Lessons
            .CountAsync(l => l.TeacherId == teacherProfile.TeacherId);

        var avgRating = await dbContext.Ratings
            .Where(r => r.TeacherId == teacherProfile.TeacherId)
            .Select(r => (double?)r.Rating)
            .AverageAsync() ?? 0.0;

        return Ok(new
        {
            firstName = teacherProfile.User.FirstName,
            lastName = teacherProfile.User.LastName,
            bio = teacherProfile.Bio,
            hourlyRate = teacherProfile.HourlyRate,
            instruments = instruments,
            profilePicture = teacherProfile.User.ProfilePicture,
            totalLessons = totalLessons,
            rating = avgRating
        });
    }

    [Authorize]
    [HttpGet("lessons")]
    public async Task<IActionResult> GetLessons()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole == null)
            return Unauthorized();

        var lessons = await (
            from l in dbContext.Lessons
            join t in dbContext.TeacherProfiles on l.TeacherId equals t.TeacherId
            join teach in dbContext.Users on t.UserId equals teach.UserId
            join stud in dbContext.Users on l.StudentId equals stud.UserId
            where (userRole == "Student" && l.StudentId == userId) ||
                  (userRole == "Teacher" && t.UserId == userId)
            select new
            {
                l.BookingId,
                l.StudentId,
                l.TeacherId,
                l.Date,
                l.Price,
                l.StartTime,
                l.EndTime,
                l.MeetingLink,
                Teacher = teach.FirstName + " " + teach.LastName,
                TeacherProfilePicture = teach.ProfilePicture,
                Student = stud.FirstName + " " + stud.LastName,
                StudentProfilePicture = stud.ProfilePicture
            }).ToListAsync();

        return Ok(lessons);
    }

    [HttpGet("instruments")]
    public async Task<IActionResult> GetInstruments()
    {
        var instruments = await dbContext.Instruments
            .Select(i => new
            {
                i.InstrumentId,
                i.Name,
                i.Category,
                i.Description
            })
            .ToListAsync();

        return Ok(instruments);
    }

    [HttpGet("availability/{teacherId:int}")]
    public async Task<IActionResult> GetAvailability(int teacherId)
    {
        var teacherProfile = await dbContext.TeacherProfiles
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.UserId == teacherId);

        if (teacherProfile == null)
            return NotFound();

        var tomorrow = DateOnly.FromDateTime(DateTime.Today.AddDays(1));

        var availability = await dbContext.TeacherAvailability
            .Where(a => a.TeacherId == teacherProfile.TeacherId && a.Date >= tomorrow)
            .Select(a => new
            {
                a.AvailabilityId,
                a.Date,
                a.StartTime,
                a.EndTime,
            })
            .ToListAsync();

        return Ok(availability);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await dbContext.Users
            .Select(u => new
            {
                Id = u.UserId,
                u.Username,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Role,
                u.CreatedAt,
                u.ProfilePicture
            })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/lessons")]
    public async Task<IActionResult> GetAllLessons()
    {
        var lessons = await (
            from l in dbContext.Lessons
            join t in dbContext.TeacherProfiles on l.TeacherId equals t.TeacherId
            join teach in dbContext.Users on t.UserId equals teach.UserId
            join stud in dbContext.Users on l.StudentId equals stud.UserId
            select new
            {
                l.BookingId,
                l.StudentId,
                l.TeacherId,
                l.Date,
                l.Price,
                l.StartTime,
                l.EndTime,
                l.MeetingLink,
                Teacher = teach.FirstName + " " + teach.LastName,
                Student = stud.FirstName + " " + stud.LastName,
            }).ToListAsync();

        return Ok(lessons);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("admin/users/{userId:int}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var user = await dbContext.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        if (!string.IsNullOrEmpty(user.ProfilePicture))
        {
            var imagePath = Path.Combine(imagesPath, Path.GetFileName(user.ProfilePicture));
            if (System.IO.File.Exists(imagePath))
                System.IO.File.Delete(imagePath);
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();

        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("admin/lessons/{lessonId:int}")]
    public async Task<IActionResult> DeleteLessonAdmin(int lessonId)
    {
        var lesson = await dbContext.Lessons.FindAsync(lessonId);
        if (lesson == null)
            return NotFound();

        dbContext.TeacherAvailability.Add(new TeacherAvailability
        {
            TeacherId = lesson.TeacherId,
            Date = lesson.Date,
            StartTime = lesson.StartTime,
            EndTime = lesson.EndTime
        });

        dbContext.Lessons.Remove(lesson);
        await dbContext.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpDelete("lessons/{bookingId:int}")]
    public async Task<IActionResult> DeleteLesson(int bookingId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole == null)
            return Unauthorized();

        Lesson? lesson = null;

        if (userRole == "Student")
        {
            lesson = await dbContext.Lessons
                .FirstOrDefaultAsync(l => l.BookingId == bookingId && l.StudentId == userId);
        }
        else if (userRole == "Teacher")
        {
            lesson = await (
                from l in dbContext.Lessons
                join t in dbContext.TeacherProfiles on l.TeacherId equals t.TeacherId
                where l.BookingId == bookingId && t.UserId == userId
                select l).FirstOrDefaultAsync();
        }

        if (lesson == null)
            return NotFound();

        dbContext.TeacherAvailability.Add(new TeacherAvailability
        {
            TeacherId = lesson.TeacherId,
            Date = lesson.Date,
            StartTime = lesson.StartTime,
            EndTime = lesson.EndTime
        });

        dbContext.Lessons.Remove(lesson);
        await dbContext.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        var user = await dbContext.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        if (!string.IsNullOrEmpty(user.ProfilePicture))
        {
            var imagePath = Path.Combine(imagesPath, Path.GetFileName(user.ProfilePicture));
            if (System.IO.File.Exists(imagePath))
                System.IO.File.Delete(imagePath);
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();

        return Ok();
    }
}
