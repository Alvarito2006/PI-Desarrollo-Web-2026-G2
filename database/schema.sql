CREATE DATABASE IF NOT EXISTS pi_desarrollo_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pi_desarrollo_web;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS user_courses;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  academic_record VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NULL,
  name VARCHAR(180) NOT NULL,
  section VARCHAR(20) NULL,
  credits INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_course (name, section)
);

CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  course_id INT NULL,
  section VARCHAR(20) NULL,
  CONSTRAINT fk_teacher_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject_type ENUM('course','teacher') NOT NULL,
  course_id INT NULL,
  teacher_id INT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  CONSTRAINT chk_post_subject CHECK (
    (subject_type = 'course' AND course_id IS NOT NULL AND teacher_id IS NULL) OR
    (subject_type = 'teacher' AND teacher_id IS NOT NULL AND course_id IS NULL)
  )
);

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_courses (
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course_id),
  CONSTRAINT fk_uc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_uc_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Cursos de referencia del área de Sistemas para segundo semestre 2026.
-- Los nombres y catedráticos se tomaron del horario oficial de ECYS disponible en DTT.
INSERT INTO courses (code, name, section, credits) VALUES
(NULL, 'Análisis y Diseño de Sistemas 1', 'A', 5),
(NULL, 'Análisis y Diseño de Sistemas 1', 'B', 5),
(NULL, 'Análisis y Diseño de Sistemas 2', 'A', 5),
(NULL, 'Análisis y Diseño de Sistemas 2', 'B', 5),
(NULL, 'Arquitectura de Computadoras y Ensambladores 1', 'A', 5),
(NULL, 'Arquitectura de Computadoras y Ensambladores 1', 'B', 5),
(NULL, 'Arquitectura de Computadoras y Ensambladores 2', 'A', 5),
(NULL, 'Arquitectura de Computadoras y Ensambladores 2', 'B', 5),
(NULL, 'Bases de Datos 1', 'B', 5),
(NULL, 'Bases de Datos 1', 'N', 5),
(NULL, 'Bases de Datos 2', 'B', 5),
(NULL, 'Bases de Datos 2', 'N', 5),
(NULL, 'Economía', 'A+', 3),
(NULL, 'Economía', 'A-', 3),
('772', 'Estructura de Datos', 'A', 5),
('772', 'Estructura de Datos', 'B', 5),
('772', 'Estructura de Datos', 'C', 5),
(NULL, 'Inteligencia Artificial 1', 'A', 5),
('770', 'Introducción a la Programación y Computación 1', 'A', 4),
('770', 'Introducción a la Programación y Computación 1', 'B', 4),
('770', 'Introducción a la Programación y Computación 1', 'C', 4),
('770', 'Introducción a la Programación y Computación 1', 'D', 4),
(NULL, 'Introducción a la Programación y Computación 2', 'A', 5),
(NULL, 'Introducción a la Programación y Computación 2', 'B', 5),
(NULL, 'Introducción a la Programación y Computación 2', 'C', 5),
(NULL, 'Introducción a la Programación y Computación 2', 'D', 5),
(NULL, 'Lenguajes Formales y de Programación', 'A', 5),
(NULL, 'Lenguajes Formales y de Programación', 'B+', 5),
(NULL, 'Lógica de Sistemas', 'A', 3),
(NULL, 'Lógica de Sistemas', 'B', 3),
(NULL, 'Lógica de Sistemas', 'C', 3),
(NULL, 'Manejo e Implementación de Archivos', 'A', 5),
(NULL, 'Manejo e Implementación de Archivos', 'B', 5),
(NULL, 'Modelación y Simulación 1', 'A', 5),
(NULL, 'Modelación y Simulación 2', 'A', 5),
(NULL, 'Organización Computacional', 'A', 5),
(NULL, 'Organización Computacional', 'B', 5),
(NULL, 'Organización Computacional', 'C', 5);

INSERT INTO teachers (name, course_id, section) VALUES
('GUEVARA ORELLANA, WILLIAM SAMUEL', 1, 'A'),
('RODAS ROBLEDO, EDGAR FRANCISCO', 2, 'B'),
('ROJAS MORALES, CLAUDIA LICETH', 3, 'A'),
('ALDANA LARRAZABAL, MIRNA IVONNE', 4, 'B'),
('ESCOBAR LEIVA, OTTO RENE', 5, 'A'),
('ESCOBAR LEIVA, OTTO RENE', 6, 'B'),
('DÍAZ LÓPEZ, GABRIEL ALEJANDRO', 7, 'A'),
('RAMIREZ RAMIREZ, JURGEN ANDONI', 8, 'B'),
('ESPINO BARRIOS, LUIS FERNANDO', 9, 'B'),
('LONGO MORALES, ALVARO GIOVANNI', 10, 'N'),
('ARIAS, LUIS ALBERTO', 11, 'B'),
('RODRIGUEZ ACOSTA, OTTO AMILCAR', 12, 'N'),
('RALDA RECINOS, ILEANA GUISELA', 13, 'A+'),
('MORALES RUIZ, EVELYN CAROLINA', 14, 'A-'),
('ORNELIS HOIL, EDGAR RENE', 15, 'A'),
('HERNANDEZ GARCIA, ALVARO OBRAYAN', 16, 'B'),
('ESPINO BARRIOS, LUIS FERNANDO', 17, 'C'),
('ESPINO BARRIOS, LUIS FERNANDO', 18, 'A'),
('ORELLANA LOPEZ, MARLON FRANCISCO', 19, 'A'),
('ESCOBAR ARGUETA, WILLIAM ESTUARDO', 20, 'B'),
('VELASQUEZ OLIVA, MOISES EDUARDO', 21, 'C'),
('VELIZ LINARES, HERMAN IGOR', 22, 'D'),
('PÉREZ TÜRK, MARLON ANTONIO', 23, 'A'),
('ROJAS MORALES, CLAUDIA LICETH', 24, 'B'),
('RUIZ JUAREZ, JOSE MANUEL', 25, 'C'),
('BARRIOS, STANLY', 26, 'D'),
('CAMPOS DE LÓPEZ, DAMARIS', 27, 'A'),
('Morales, David Estuardo', 28, 'B+'),
('TALA AYERDI, VIRGINIA VICTORIA', 29, 'A'),
('AVILA PESQUERA DE MEDINILLA, FLORIZA FELIPA', 30, 'B'),
('AVILA PESQUERA DE MEDINILLA, FLORIZA FELIPA', 31, 'C'),
('DIAZ ARDAVIN, JUAN ALVARO', 32, 'A'),
('ESCOBAR ARGUETA, WILLIAM ESTUARDO', 33, 'B'),
('FERNANDEZ CACERES, CESAR AUGUSTO', 34, 'A'),
('CANCINOS RENDON, MIGUEL ANGEL', 35, 'A'),
('ESCOBAR LEIVA, OTTO RENE', 36, 'A'),
('ESCOBAR LEIVA, OTTO RENE', 37, 'B'),
('PAZ GONZÁLEZ, FERNANDO JOSÉ', 38, 'C');
