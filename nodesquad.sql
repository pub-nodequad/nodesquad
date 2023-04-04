DROP TABLE pelatihan;
DROP TABLE mahasiswa;

CREATE database nodesquad;

CREATE TABLE mahasiswa (
	id serial PRIMARY KEY,
	nim varchar(13),
	nama text
);

CREATE TABLE pelatihan (
	id serial PRIMARY KEY,
	nama text,
	id_instruktur integer REFERENCES mahasiswa (id)
);

INSERT INTO mahasiswa (nim, nama) VALUES
	('111', 'Romi Kusuma Bakti'),
	('222', 'Sandi Saputra'),
	('333', 'Habib Jannata'),
	('444', 'Iyan Sopian'),
	('555', 'Bunga Sari Hutasuhut'),
	('666', 'Ali Hanafiah Lubis'),
	('777', 'Aliya Rohaya Siregar');

INSERT INTO pelatihan (nama, id_instruktur) VALUES
	('Node.js', 1),
	('Java', 2),
	('Go', 3),
	('.NET', 4);