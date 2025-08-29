namespace note4u.Models
{
    public interface IJitsiService
    {
        string CreateMeetingRoom(string subject, int lessonId);
    }

    public class JitsiService : IJitsiService
    {
        public string CreateMeetingRoom(string subject, int lessonId)
        {
            var normalize = subject.Replace(" ", "_").ToLower();
            var roomId = Guid.NewGuid().ToString("N")[..8];
            return $"https://meet.jit.si/{normalize}_lesson_{lessonId}_{roomId}";
        }
    }
}