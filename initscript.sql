CREATE TABLE user(
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    mail TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);
CREATE TABLE cinema (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    website TEXT NOT NULL,
    wait_time INTEGER NOT NULL
);
CREATE TABLE presentation(
    id TEXT NOT NULL,
    time DATETIME NOT NULL,
    feature_id INTEGER NOT NULL,
    venue_id INTEGER NOT NULL,
    FOREIGN KEY(feature_id)
    REFERENCES feature(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    PRIMARY KEY(id, feature_id)
);
CREATE TABLE venue (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    type_id INTEGER,
    cinema_id INTEGER NOT NULL,
    link TEXT NOT NULL,
    FOREIGN KEY(cinema_id)
    REFERENCES cinema(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    PRIMARY KEY(id, cinema_id, type_id)
);
CREATE TABLE feature(
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    venue_id INTEGER NOT NULL,
    FOREIGN KEY(venue_id)
    REFERENCES venue(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    PRIMARY KEY(id, venue_id)
);
CREATE TABLE movies(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pid INT NOT NULL,
    username TEXT NOT NULL,
    moviename TEXT,
    moviedate DATETIME, 
    lastupdate DATETIME, 
    isactive BOOLEAN NOT NULL, 
    ticketnum INT, 
    row INT, 
    seats TEXT, 
    theater TEXT, 
    hall TEXT,
    FOREIGN KEY(username) REFERENCES user(username)
);

INSERT INTO cinema VALUES(NULL, "CinemaCity", "http://www.cinema-city.co.il/", 7);
INSERT INTO cinema VALUES(NULL, "YesPlanet", "http://www.yesplanet.co.il/", 15);
INSERT INTO cinema VALUES(NULL, "RavHen", "http://www.rav-hen.co.il/", 15);
/* No STAT tables available */
