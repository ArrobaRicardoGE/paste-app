CREATE DATABASE IF NOT EXISTS `paste_app` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `paste_app`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (1, 'test', 'test', 'test@test.com');

CREATE TABLE IF NOT EXISTS `pastes` (
  `id` varchar(5) NOT NULL UNIQUE,
  `title` varchar(255) NOT NULL,
  `owner_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`)
)   ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `pastes` (`id`, `title`, `owner_id`) VALUES ('abcde', 'test', 1);