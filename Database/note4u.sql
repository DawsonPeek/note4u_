-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: note4u
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `instruments`
--

DROP TABLE IF EXISTS `instruments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instruments` (
  `InstrumentId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  `Category` varchar(50) NOT NULL,
  `Description` text,
  PRIMARY KEY (`InstrumentId`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instruments`
--

LOCK TABLES `instruments` WRITE;
/*!40000 ALTER TABLE `instruments` DISABLE KEYS */;
INSERT INTO `instruments` VALUES (1,'Chitarra Classica','Strumenti a Corda','Chitarra acustica con corde di nylon'),(2,'Chitarra Elettrica','Strumenti a Corda','Chitarra amplificata elettronicamente'),(3,'Chitarra Acustica','Strumenti a Corda','Chitarra acustica con corde di acciaio'),(4,'Basso Elettrico','Strumenti a Corda','Strumento a quattro corde per le frequenze basse'),(5,'Violino','Strumenti a Corda','Strumento ad arco della famiglia degli archi'),(6,'Viola','Strumenti a Corda','Strumento ad arco più grande del violino'),(7,'Violoncello','Strumenti a Corda','Strumento ad arco di grandi dimensioni'),(8,'Contrabbasso','Strumenti a Corda','Il più grande degli strumenti ad arco'),(9,'Ukulele','Strumenti a Corda','Piccolo strumento hawaiano a quattro corde'),(10,'Mandolino','Strumenti a Corda','Strumento a pizzico della tradizione italiana'),(11,'Flauto Traverso','Strumenti a Fiato','Strumento a fiato in metallo'),(12,'Clarinetto','Strumenti a Fiato','Strumento a fiato con ancia singola'),(13,'Sassofono Alto','Strumenti a Fiato','Sassofono in Mi bemolle'),(14,'Sassofono Tenore','Strumenti a Fiato','Sassofono in Si bemolle'),(15,'Sassofono Soprano','Strumenti a Fiato','Sassofono acuto in Si bemolle'),(16,'Tromba','Strumenti a Fiato','Strumento a fiato in ottone'),(17,'Trombone','Strumenti a Fiato','Strumento a fiato con coulisse'),(18,'Corno Francese','Strumenti a Fiato','Strumento a fiato a spirale'),(19,'Oboe','Strumenti a Fiato','Strumento a fiato con ancia doppia'),(20,'Fagotto','Strumenti a Fiato','Strumento grave a ancia doppia'),(21,'Batteria Acustica','Strumenti a Percussione','Set completo di tamburi e piatti'),(22,'Batteria Elettronica','Strumenti a Percussione','Batteria con suoni campionati'),(23,'Cajón','Strumenti a Percussione','Tamburo a forma di scatola'),(24,'Djembe','Strumenti a Percussione','Tamburo africano a calice'),(25,'Congas','Strumenti a Percussione','Tamburi latini allungati'),(26,'Timpani','Strumenti a Percussione','Tamburi orchestrali accordabili'),(27,'Xilofono','Strumenti a Percussione','Strumento a lame di legno'),(28,'Vibrafono','Strumenti a Percussione','Strumento a lame metalliche'),(29,'Pianoforte Acustico','Strumenti a Tastiera','Pianoforte tradizionale a corde percosse'),(30,'Pianoforte Digitale','Strumenti a Tastiera','Pianoforte elettronico'),(31,'Organo','Strumenti a Tastiera','Strumento a canne o elettronico'),(32,'Sintetizzatore','Strumenti a Tastiera','Strumento elettronico per sintesi sonora'),(33,'Fisarmonica','Strumenti a Tastiera','Strumento a mantice con tastiera'),(34,'Clavicembalo','Strumenti a Tastiera','Strumento a tastiera del periodo barocco'),(35,'Canto Lirico','Canto','Tecnica vocale per opera e musica classica'),(36,'Canto Moderno','Canto','Tecniche vocali per pop, rock e jazz'),(37,'Canto Jazz','Canto','Tecniche specifiche per il jazz'),(38,'Canto Gospel','Canto','Stile vocale della tradizione afroamericana'),(39,'DJ e Mixing','Musica Elettronica','Tecniche di mixaggio e djing'),(40,'Produzione Musicale','Musica Elettronica','Composizione e produzione digitale'),(41,'Sequencer','Musica Elettronica','Programmazione di sequenze musicali');
/*!40000 ALTER TABLE `instruments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `BookingId` int NOT NULL AUTO_INCREMENT,
  `StudentId` int NOT NULL,
  `TeacherId` int NOT NULL,
  `Date` date DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `StartTime` time DEFAULT NULL,
  `EndTime` time DEFAULT NULL,
  `MeetingLink` text,
  PRIMARY KEY (`BookingId`),
  KEY `StudentId` (`StudentId`),
  KEY `TeacherId` (`TeacherId`),
  KEY `idx_booking_date` (`Date`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`StudentId`) REFERENCES `users` (`UserId`),
  CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`TeacherId`) REFERENCES `teacherprofiles` (`TeacherId`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (20,1,8,'2025-08-20',300.00,'10:00:00','11:00:00','https://meet.jit.si/note4u_2025_08_20_lesson_giulia_teacherone'),(21,1,12,'2025-08-15',35.00,'16:00:00','17:00:00',NULL),(22,1,13,'2025-08-12',40.00,'15:00:00','16:00:00',NULL),(23,1,14,'2025-08-20',30.00,'18:00:00','19:00:00',NULL),(24,1,16,'2025-07-30',38.00,'18:00:00','19:00:00',NULL),(25,1,18,'2025-08-21',42.00,'11:00:00','12:00:00',NULL),(26,1,20,'2025-08-19',28.00,'17:00:00','18:00:00',NULL),(27,1,22,'2025-08-11',40.00,'15:00:00','16:00:00',NULL);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `RatingId` int NOT NULL AUTO_INCREMENT,
  `TeacherId` int NOT NULL,
  `Rating` int NOT NULL,
  `StudentId` int NOT NULL,
  PRIMARY KEY (`RatingId`),
  KEY `fk_ratings_teacher` (`TeacherId`),
  KEY `fk_reviews_student` (`StudentId`),
  CONSTRAINT `fk_ratings_teacher` FOREIGN KEY (`TeacherId`) REFERENCES `teacherprofiles` (`TeacherId`),
  CONSTRAINT `fk_reviews_student` FOREIGN KEY (`StudentId`) REFERENCES `users` (`UserId`),
  CONSTRAINT `reviews_chk_1` CHECK ((`Rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (7,8,1,1),(8,12,5,1),(9,13,5,1),(10,14,4,1),(11,15,5,1),(12,16,4,1),(13,17,3,1),(14,18,5,1),(15,19,5,1),(16,20,4,1),(17,21,4,1),(18,22,5,1),(19,23,5,1);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacheravailability`
--

DROP TABLE IF EXISTS `teacheravailability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacheravailability` (
  `AvailabilityId` int NOT NULL AUTO_INCREMENT,
  `TeacherId` int NOT NULL,
  `Date` date DEFAULT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL,
  PRIMARY KEY (`AvailabilityId`),
  KEY `TeacherId` (`TeacherId`),
  CONSTRAINT `teacheravailability_ibfk_1` FOREIGN KEY (`TeacherId`) REFERENCES `teacherprofiles` (`TeacherId`) ON DELETE CASCADE,
  CONSTRAINT `teacheravailability_chk_2` CHECK ((`StartTime` < `EndTime`))
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacheravailability`
--

LOCK TABLES `teacheravailability` WRITE;
/*!40000 ALTER TABLE `teacheravailability` DISABLE KEYS */;
INSERT INTO `teacheravailability` VALUES (13,8,'2025-08-20','10:00:00','11:00:00'),(16,8,'2025-08-19','17:00:00','19:00:00'),(17,8,'2025-08-19','08:34:00','09:00:00'),(18,8,'2025-08-19','10:00:00','11:00:00'),(19,8,'2025-09-01','10:00:00','11:00:00'),(20,8,'2025-09-01','02:00:00','03:00:00'),(21,8,'2025-09-01','06:00:00','08:00:00'),(22,8,'2025-09-08','10:00:00','11:00:00'),(23,8,'2025-09-08','02:00:00','03:00:00'),(24,8,'2025-09-08','06:00:00','08:00:00'),(25,8,'2025-09-15','10:00:00','11:00:00'),(26,8,'2025-09-15','02:00:00','03:00:00'),(27,8,'2025-09-15','06:00:00','08:00:00'),(28,8,'2025-09-22','10:00:00','11:00:00'),(29,8,'2025-09-22','02:00:00','03:00:00'),(30,8,'2025-09-22','06:00:00','08:00:00'),(31,8,'2025-09-29','10:00:00','11:00:00'),(32,8,'2025-09-29','02:00:00','03:00:00'),(33,8,'2025-09-29','06:00:00','08:00:00'),(38,10,'2025-09-09','12:00:00','13:00:00'),(40,10,'2025-09-16','12:00:00','13:00:00'),(41,10,'2025-09-18','12:00:00','13:00:00'),(44,10,'2025-09-30','12:00:00','13:00:00'),(45,10,'2025-09-23','12:00:00','13:00:00'),(46,10,'2025-09-04','12:00:00','13:00:00'),(47,8,'2025-09-01','10:00:00','11:00:00'),(48,10,'2025-09-11','12:00:00','13:00:00'),(51,8,'2025-08-31','17:00:00','19:00:00'),(52,10,'2025-09-02','12:00:00','13:00:00'),(53,10,'2025-09-25','12:00:00','13:00:00'),(54,8,'2025-08-31','08:34:00','09:00:00'),(55,12,'2025-09-15','15:00:00','18:00:00'),(57,13,'2025-09-16','14:00:00','17:00:00'),(58,13,'2025-09-18','16:00:00','18:00:00'),(59,14,'2025-09-19','17:00:00','20:00:00'),(60,14,'2025-09-20','11:00:00','13:00:00'),(61,15,'2025-09-22','11:00:00','13:00:00'),(62,15,'2025-09-29','11:00:00','13:00:00'),(63,16,'2025-09-23','18:00:00','20:00:00'),(64,17,'2025-09-24','16:00:00','19:00:00'),(65,18,'2025-09-11','10:00:00','13:00:00'),(66,18,'2025-09-12','14:00:00','16:00:00'),(67,19,'2025-09-15','18:00:00','21:00:00'),(68,20,'2025-09-16','15:00:00','18:00:00'),(69,20,'2025-09-18','17:00:00','19:00:00'),(70,21,'2025-09-22','10:00:00','12:00:00'),(71,22,'2025-09-23','14:00:00','17:00:00'),(72,23,'2025-09-25','11:00:00','14:00:00'),(73,12,'2025-09-17','10:00:00','12:00:00');
/*!40000 ALTER TABLE `teacheravailability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacherinstruments`
--

DROP TABLE IF EXISTS `teacherinstruments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacherinstruments` (
  `TeacherInstrumentId` int NOT NULL AUTO_INCREMENT,
  `TeacherId` int NOT NULL,
  `InstrumentId` int NOT NULL,
  PRIMARY KEY (`TeacherInstrumentId`),
  UNIQUE KEY `TeacherId` (`TeacherId`,`InstrumentId`),
  KEY `InstrumentId` (`InstrumentId`),
  CONSTRAINT `teacherinstruments_ibfk_1` FOREIGN KEY (`TeacherId`) REFERENCES `teacherprofiles` (`TeacherId`) ON DELETE CASCADE,
  CONSTRAINT `teacherinstruments_ibfk_2` FOREIGN KEY (`InstrumentId`) REFERENCES `instruments` (`InstrumentId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=183 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacherinstruments`
--

LOCK TABLES `teacherinstruments` WRITE;
/*!40000 ALTER TABLE `teacherinstruments` DISABLE KEYS */;
INSERT INTO `teacherinstruments` VALUES (141,8,3),(142,8,6),(143,8,12),(144,8,16),(145,10,21),(147,10,22),(148,10,23),(146,10,24),(149,10,25),(150,12,1),(151,12,2),(152,12,3),(153,13,29),(154,13,30),(155,13,32),(156,14,21),(157,14,22),(158,14,23),(159,15,5),(160,15,6),(161,15,7),(162,16,12),(163,16,13),(164,16,14),(165,17,16),(166,17,17),(167,17,18),(170,18,35),(168,18,36),(169,18,37),(171,19,39),(172,19,40),(173,19,41),(174,20,4),(175,20,9),(176,21,10),(177,21,33),(178,22,26),(179,22,27),(180,22,28),(182,23,31),(181,23,34);
/*!40000 ALTER TABLE `teacherinstruments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacherprofiles`
--

DROP TABLE IF EXISTS `teacherprofiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacherprofiles` (
  `TeacherId` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Bio` text,
  `HourlyRate` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`TeacherId`),
  UNIQUE KEY `UserId` (`UserId`),
  CONSTRAINT `teacherprofiles_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacherprofiles`
--

LOCK TABLES `teacherprofiles` WRITE;
/*!40000 ALTER TABLE `teacherprofiles` DISABLE KEYS */;
INSERT INTO `teacherprofiles` VALUES (8,37,'ciao sono osjfie',300.00),(10,45,'Ciao sono ugulo il re della foresta! ',30.00),(11,46,NULL,NULL),(12,47,'Chitarrista professionista con 15 anni di esperienza in tour e in studio. Specializzato in rock, blues e fingerstyle.',35.00),(13,48,'Pianista classica e compositrice. Offro lezioni di pianoforte per tutti i livelli, con un focus sulla tecnica e linterpretazione.',40.00),(14,49,'Batterista versatile con esperienza in generi che vanno dal jazz al metal. Le mie lezioni si concentrano su ritmo, coordinazione e creatività.',30.00),(15,50,'Violinista d\'orchestra con la passione per l\'insegnamento. Adatto il mio metodo alle esigenze di ogni studente, dal principiante all\'avanzato.',45.00),(16,51,'Sassofonista jazz e clarinettista classico. Esploreremo insieme l\'improvvisazione, la teoria musicale e la bellezza del suono.',38.00),(17,52,'Trombettista versatile, dalla banda all\'orchestra sinfonica. Lezioni focalizzate sulla respirazione, l\'emissione e la tecnica strumentale.',32.00),(18,53,'Vocal coach certificato con esperienza nel pop, rock e musical. Ti aiuterò a trovare la tua voce, migliorare l\'intonazione e la presenza scenica.',42.00),(19,54,'Produttrice e DJ. Insegno a usare i principali software di produzione (DAW), tecniche di mixaggio e sintesi sonora per creare la tua musica.',50.00),(20,55,'Bassista funk e soul, amante delle basse frequenze. Insegno anche ukulele per chi cerca uno strumento divertente e facile da imparare.',28.00),(21,56,'Appassionata di musica popolare e tradizionale. Con me potrai imparare i segreti del mandolino e della fisarmonica.',33.00),(22,57,'Percussionista specializzato nel repertorio classico e contemporaneo. Lezioni di timpani, xilofono, vibrafono e altri strumenti orchestrali.',40.00),(23,58,'Musicologa e clavicembalista. Un viaggio affascinante nella musica barocca attraverso i suoi strumenti a tastiera più rappresentativi.',48.00);
/*!40000 ALTER TABLE `teacherprofiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ProfilePicture` varchar(255) DEFAULT NULL,
  `Role` varchar(50) NOT NULL DEFAULT 'Student',
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `Email` (`Email`),
  KEY `idx_users_email` (`Email`),
  CONSTRAINT `chk_user_role` CHECK ((`Role` in (_utf8mb4'Student',_utf8mb4'Teacher',_utf8mb4'Admin')))
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'mario_rossi','mario@example.com','$2a$11$d9xnExOfZT/tn.dvRc8p4.34PZTFyQ.xIJC9Fzru.IfvDr22Hr7Ui','mario','roxxi','2025-03-28 14:33:14','/images/bdd4098a-2d03-4d77-9b1c-4546ca6a9dcf.jpg','Student'),(7,'ema','emanuele.maffezzoli@studenti.unipr.it','$2a$11$Ux.cDuv4lTd9.RbegwX4VeGpjlV6r5vgbAS86cShUxq0vIsAhkh..','Emanuele','Maffezzoli','2025-05-06 13:59:36','/images/917132e1-2304-48e8-ad76-92e446ce7c50.jpg','Admin'),(47,'andreabianchi','andrea.bianchi@note4u.com','$2a$11$t9xY4E.8U7J8o/3rGg2F.eG4zK0Y.v5F9h3w.J2r.O6H7i.L9t.Lq','Andrea','Bianchi','2025-08-28 14:37:38','\\images\\avataaars (7).png','Teacher'),(48,'giuliaricci','giulia.ricci@note4u.com','$2a$11$w.A7vM.2S.o/9t.L8x.K5u.W6z.Y1v.H8o.I3r.J4f.G9f.O2c.Nq','Giulia','Ricci','2025-08-28 14:37:39','\\images\\avataaars (1).png','Teacher'),(49,'marcoconti','marco.conti@note4u.com','$2a$11$c.V9t.O8f.L4g.K5w.A7v.H8z.Y1o.I3r.J2f.G6w.X9e.M7u.Pq','Marco','Conti','2025-08-28 14:37:39','\\images\\avataaars (10).png','Teacher'),(50,'sofiagallo','sofia.gallo@note4u.com','$2a$11$p.Z8o/3r.Gg2F.eG4z.K0Y.v5F9h3w.J2r.O6H7i.L9t.Lq.W.A7v','Sofia','Gallo','2025-08-28 14:37:39','\\images\\avataaars (2).png','Teacher'),(51,'francescodeluca','francesco.deluca@note4u.com','$2a$11$u.W6z.Y1v.H8o.I3r.J4f.G9f.O2c.Nq.V9t.O8f.L4g.K5w.A7v','Francesco','De Luca','2025-08-28 14:37:39','\\images\\avataaars (9).png','Teacher'),(52,'chiararomano','chiara.romano@note4u.com','$2a$11$h.X9e.M7u.Pq.Z8o/3r.Gg2F.eG4z.K0Y.v5F9h3w.J2r.O6H7i','Chiara','Romano','2025-08-28 14:37:39','\\images\\avataaars (3).png','Teacher'),(53,'leonardomoretti','leonardo.moretti@note4u.com','$2a$11$i.L9t.Lq.W.A7vM.2S.o/9t.L8x.K5u.W6z.Y1v.H8o.I3r.J4f','Leonardo','Moretti','2025-08-28 14:37:39','\\images\\avataaars (11).png','Teacher'),(54,'elenaserra','elena.serra@note4u.com','$2a$11$f.G9f.O2c.Nq.V9t.O8f.L4g.K5w.A7v.H8z.Y1o.I3r.J2f.G6w','Elena','Serra','2025-08-28 14:37:39','\\images\\avataaars.png','Teacher'),(55,'matteobarbieri','matteo.barbieri@note4u.com','$2a$11$e.M7u.Pq.Z8o/3r.Gg2F.eG4z.K0Y.v5F9h3w.J2r.O6H7i.X9e','Matteo','Barbieri','2025-08-28 14:37:39','\\images\\avataaars (8).png','Teacher'),(56,'isabellafontana','isabella.fontana@note4u.com','$2a$11$o.I3r.J4f.G9f.O2c.Nq.V9t.O8f.L4g.K5w.A7v.H8z.Y1o.I3r','Isabella','Fontana','2025-08-28 14:37:39','\\images\\avataaars (4).png','Teacher'),(57,'davidemariani','davide.mariani@note4u.com','$2a$11$k5u.W6z.Y1v.H8o.I3r.J4f.G9f.O2c.Nq.V9t.O8f.L4g.K5w','Davide','Mariani','2025-08-28 14:37:39','\\images\\avataaars (6).png','Teacher'),(58,'lauragreco','laura.greco@note4u.com','$2a$11$r.J2f.G6w.X9e.M7u.Pq.Z8o/3r.Gg2F.eG4z.K0Y.v5F9h3w.J2r','Laura','Greco','2025-08-28 14:37:39','\\images\\avataaars (5).png','Teacher');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-28 17:44:21
