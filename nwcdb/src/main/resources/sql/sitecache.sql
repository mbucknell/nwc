CREATE TABLE sitecache
(
	id SERIAL NOT NULL,
	cacheid BIGINT,
	cachepath TEXT,
	cacheobject TEXT,
	created TIMESTAMP,
	lastaccessed TIMESTAMP,
	PRIMARY KEY (id)
);

CREATE INDEX cacheid_idx ON sitecache (cacheid);
CREATE INDEX cachepath_idx ON sitecache (cachepath);



