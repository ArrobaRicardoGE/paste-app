CREATE DATABASE IF NOT EXISTS `paste_app` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `paste_app`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`username`, `password`, `email`) VALUES ('test', 'test', 'test@test.com');

CREATE TABLE IF NOT EXISTS `pastes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stringid` varchar(5) NOT NULL UNIQUE,
  `title` varchar(255) NOT NULL,
  `owner` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`owner`) REFERENCES `accounts`(`username`)
)   ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE USER 'upaste'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON paste_app.* TO 'upaste'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
