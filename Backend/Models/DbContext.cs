using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;

namespace note4u.Models
{
    public class MusicTeachingContext : DbContext
    {
        public MusicTeachingContext(DbContextOptions<MusicTeachingContext> options)
            : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Teacher> TeacherProfiles { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Instrument> Instruments { get; set; }
        public DbSet<TeacherInstrument> TeacherInstruments { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Review> Ratings { get; set; }
        public DbSet<TeacherAvailability> TeacherAvailability { get; set; }

    }
}

