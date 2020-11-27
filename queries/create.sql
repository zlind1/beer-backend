DROP SCHEMA IF EXISTS zlind_beers CASCADE;
CREATE SCHEMA zlind_beers;

CREATE TABLE Breweries (
  breweryID CHAR(36),
  name VARCHAR(50) UNIQUE,
  location VARCHAR(50),
  PRIMARY KEY(breweryID)
);

CREATE TABLE Beers (
  beerID CHAR(36),
  breweryID CHAR(36),
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20),
  PRIMARY KEY(beerID),
  FOREIGN KEY(breweryID) REFERENCES Breweries
);

CREATE TABLE Users (
  userID CHAR(36),
  name VARCHAR(50) NOT NULL,
  username VARCHAR(50) UNIQUE,
  password CHAR(64),
  PRIMARY KEY(userID)
);

CREATE TABLE BeersDrank (
  userID CHAR(36),
  beerID CHAR(36),
  timesDrank INT DEFAULT 1,
  PRIMARY KEY(userID, beerID),
  FOREIGN KEY(userID) REFERENCES Users,
  FOREIGN KEY(beerID) REFERENCES Beers
);

CREATE VIEW TotalBeersDrank AS
  SELECT u.name, SUM(bd.timesDrank) AS totalBeersDrank, COUNT(*) AS diffBeersDrank
  FROM Users u, BeersDrank bd
  WHERE u.userID = bd.userID
  GROUP BY u.userID;

CREATE VIEW FavoriteBeers AS
  SELECT u.name AS user, b.name AS beer, timesDrank
  FROM Users u, Beers b, BeersDrank bd1
  WHERE u.userID = bd1.userID AND
        b.beerID = bd1.beerID AND
        timesDrank >= ALL(
          SELECT timesDrank FROM BeersDrank bd2
          WHERE bd1.userID = bd2.userID
        );

CREATE VIEW ReadableBeersDrank AS
  SELECT u.name AS personName, b.name AS beerName, b1.name AS breweryName, bd.timesDrank
  FROM Users u, Beers b, Breweries b1, BeersDrank bd
  WHERE u.userID = bd.userID AND
  	  b.beerID = bd.beerID AND
  	  b1.breweryID = b.breweryID;
