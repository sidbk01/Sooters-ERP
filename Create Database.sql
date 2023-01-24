-- MySQL Script generated by MySQL Workbench
-- Mon Jan 23 10:15:33 2023
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema sooters
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `sooters` ;

-- -----------------------------------------------------
-- Schema sooters
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `sooters` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `sooters` ;

-- -----------------------------------------------------
-- Table `sooters`.`_sequence`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`_sequence` ;

CREATE TABLE IF NOT EXISTS `sooters`.`_sequence` (
  `seq_name` VARCHAR(4) NOT NULL,
  `seq_val` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`seq_name`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `sooters`.`addresses`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`addresses` ;

CREATE TABLE IF NOT EXISTS `sooters`.`addresses` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Number` VARCHAR(16) NOT NULL,
  `Street` VARCHAR(64) NOT NULL,
  `City` VARCHAR(64) NOT NULL,
  `PostalCode` VARCHAR(7) NOT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX `ID_UNIQUE` ON `sooters`.`addresses` (`ID` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `sooters`.`customers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`customers` ;

CREATE TABLE IF NOT EXISTS `sooters`.`customers` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(64) NOT NULL,
  `PhoneNumber` VARCHAR(32) NULL DEFAULT NULL,
  `Email` VARCHAR(32) NULL DEFAULT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX `ID_UNIQUE` ON `sooters`.`customers` (`ID` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `sooters`.`locations`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`locations` ;

CREATE TABLE IF NOT EXISTS `sooters`.`locations` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(32) NOT NULL,
  `Address` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`ID`),
  CONSTRAINT `locations_addresses`
    FOREIGN KEY (`Address`)
    REFERENCES `sooters`.`addresses` (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX `ID_UNIQUE` ON `sooters`.`locations` (`ID` ASC) VISIBLE;

CREATE UNIQUE INDEX `Address_UNIQUE` ON `sooters`.`locations` (`Address` ASC) VISIBLE;

CREATE UNIQUE INDEX `Name_UNIQUE` ON `sooters`.`locations` (`Name` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `sooters`.`employees`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`employees` ;

CREATE TABLE IF NOT EXISTS `sooters`.`employees` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(64) NOT NULL,
  `Active` TINYINT UNSIGNED NOT NULL DEFAULT '1',
  `PrimaryLocation` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`ID`),
  CONSTRAINT `employees_locations`
    FOREIGN KEY (`PrimaryLocation`)
    REFERENCES `sooters`.`locations` (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX `ID_UNIQUE` ON `sooters`.`employees` (`ID` ASC) VISIBLE;

CREATE INDEX `employees_locations_idx` ON `sooters`.`employees` (`PrimaryLocation` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `sooters`.`customer_notes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`customer_notes` ;

CREATE TABLE IF NOT EXISTS `sooters`.`customer_notes` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Customer` INT UNSIGNED NOT NULL,
  `Creator` INT UNSIGNED NOT NULL,
  `DateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Note` LONGTEXT NOT NULL,
  PRIMARY KEY (`ID`),
  CONSTRAINT `customer_notes_customers`
    FOREIGN KEY (`Customer`)
    REFERENCES `sooters`.`customers` (`ID`),
  CONSTRAINT `customer_notes_employees`
    FOREIGN KEY (`Creator`)
    REFERENCES `sooters`.`employees` (`ID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX `ID_UNIQUE` ON `sooters`.`customer_notes` (`ID` ASC) VISIBLE;

CREATE INDEX `customer_notes_customers_idx` ON `sooters`.`customer_notes` (`Customer` ASC) VISIBLE;

CREATE INDEX `customer_notes_employees_idx` ON `sooters`.`customer_notes` (`Creator` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `sooters`.`order_types`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`order_types` ;

CREATE TABLE IF NOT EXISTS `sooters`.`order_types` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX `ID_UNIQUE` ON `sooters`.`order_types` (`ID` ASC) VISIBLE;

CREATE UNIQUE INDEX `Name_UNIQUE` ON `sooters`.`order_types` (`Name` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `sooters`.`orders`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`orders` ;

CREATE TABLE IF NOT EXISTS `sooters`.`orders` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `EnvelopeID` INT UNSIGNED NULL DEFAULT NULL,
  `CurrentLocation` INT UNSIGNED NOT NULL,
  `SourceLocation` INT UNSIGNED NOT NULL,
  `Receiver` INT UNSIGNED NOT NULL,
  `OrderType` INT UNSIGNED NOT NULL,
  `Customer` INT UNSIGNED NOT NULL,
  `DateReceived` DATE NOT NULL DEFAULT (curdate()),
  `DateDue` DATE NOT NULL,
  `DateComplete` DATE NULL DEFAULT NULL,
  `Paid` TINYINT UNSIGNED NOT NULL DEFAULT '0',
  `Rush` TINYINT UNSIGNED NOT NULL,
  `PickedUp` TINYINT UNSIGNED NOT NULL DEFAULT '0',
  `FormattedID` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`ID`),
  CONSTRAINT `orders_customers`
    FOREIGN KEY (`Customer`)
    REFERENCES `sooters`.`customers` (`ID`),
  CONSTRAINT `orders_employees`
    FOREIGN KEY (`Receiver`)
    REFERENCES `sooters`.`employees` (`ID`),
  CONSTRAINT `orders_locations`
    FOREIGN KEY (`CurrentLocation`)
    REFERENCES `sooters`.`locations` (`ID`),
  CONSTRAINT `orders_locations2`
    FOREIGN KEY (`SourceLocation`)
    REFERENCES `sooters`.`locations` (`ID`),
  CONSTRAINT `orders_order_types`
    FOREIGN KEY (`OrderType`)
    REFERENCES `sooters`.`order_types` (`ID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX `ID_UNIQUE` ON `sooters`.`orders` (`ID` ASC) VISIBLE;

CREATE INDEX `orders_customers_idx` ON `sooters`.`orders` (`Customer` ASC) VISIBLE;

CREATE INDEX `orders_employees_idx` ON `sooters`.`orders` (`Receiver` ASC) VISIBLE;

CREATE INDEX `orders_order_types_idx` ON `sooters`.`orders` (`OrderType` ASC) VISIBLE;

CREATE INDEX `orders_locations_idx` ON `sooters`.`orders` (`CurrentLocation` ASC) VISIBLE;

CREATE INDEX `orders_locations2_idx` ON `sooters`.`orders` (`SourceLocation` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `sooters`.`film_orders`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`film_orders` ;

CREATE TABLE IF NOT EXISTS `sooters`.`film_orders` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Prints` TINYINT UNSIGNED NOT NULL,
  `Digital` TINYINT UNSIGNED NOT NULL,
  `NumberOfRolls` INT UNSIGNED NOT NULL,
  `Color` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`ID`),
  CONSTRAINT `film_orders_orders`
    FOREIGN KEY (`ID`)
    REFERENCES `sooters`.`orders` (`ID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX `ID_UNIQUE` ON `sooters`.`film_orders` (`ID` ASC) VISIBLE;

CREATE INDEX `film_orders_orders_idx` ON `sooters`.`film_orders` (`ID` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `sooters`.`order_notes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sooters`.`order_notes` ;

CREATE TABLE IF NOT EXISTS `sooters`.`order_notes` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `OrderID` INT UNSIGNED NOT NULL,
  `Creator` INT UNSIGNED NOT NULL,
  `DateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Note` LONGTEXT NOT NULL,
  PRIMARY KEY (`ID`),
  CONSTRAINT `order_notes_employees`
    FOREIGN KEY (`Creator`)
    REFERENCES `sooters`.`employees` (`ID`),
  CONSTRAINT `order_notes_orders`
    FOREIGN KEY (`OrderID`)
    REFERENCES `sooters`.`orders` (`ID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

CREATE INDEX `order_notes_employees_idx` ON `sooters`.`order_notes` (`Creator` ASC) VISIBLE;

CREATE INDEX `order_notes_orders_idx` ON `sooters`.`order_notes` (`OrderID` ASC) VISIBLE;

USE `sooters` ;

-- -----------------------------------------------------
-- function getNextCustomSeq
-- -----------------------------------------------------

USE `sooters`;
DROP function IF EXISTS `sooters`.`getNextCustomSeq`;

DELIMITER $$
USE `sooters`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `getNextCustomSeq`(
    sSeqName VARCHAR(4)
) RETURNS varchar(20) CHARSET utf8mb4
BEGIN
    DECLARE nLast_val INT; 
 
    SET nLast_val =  (SELECT seq_val
                          FROM _sequence
                          WHERE seq_name = sSeqName);
    IF nLast_val IS NULL THEN
        SET nLast_val = 1;
        INSERT INTO _sequence (seq_name,seq_val)
        VALUES (sSeqName,nLast_Val);
    ELSE
        SET nLast_val = nLast_val + 1;
        UPDATE _sequence SET seq_val = nLast_val
        WHERE seq_name = sSeqName;
    END IF; 
 
    SET @ret = (SELECT concat(sSeqName,'-',lpad(nLast_val,5,'0')));
    RETURN @ret;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure sp_setCustomVal
-- -----------------------------------------------------

USE `sooters`;
DROP procedure IF EXISTS `sooters`.`sp_setCustomVal`;

DELIMITER $$
USE `sooters`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_setCustomVal`(sSeqName VARCHAR(4),  nVal INT UNSIGNED)
BEGIN
    IF (SELECT COUNT(*) FROM _sequence  
            WHERE seq_name = sSeqName) = 0 THEN
        INSERT INTO _sequence (seq_name,seq_val)
        VALUES (sSeqName,nVal);
    ELSE
        UPDATE _sequence SET seq_val = nVal
        WHERE seq_name = sSeqName;
    END IF;
END$$

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
USE `sooters`;

DELIMITER $$

USE `sooters`$$
DROP TRIGGER IF EXISTS `sooters`.`order_id` $$
USE `sooters`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `sooters`.`order_id`
BEFORE INSERT ON `sooters`.`orders`
FOR EACH ROW
BEGIN
   SET NEW.FormattedID = getNextCustomSeq(year(now()));
END$$


DELIMITER ;