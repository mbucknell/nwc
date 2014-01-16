-- >su - postgres -c "createuser -P -d nwcuser"
-- >su - postgres -c "createdb -U nwcuser nwcuidb -E 'UTF-8' -T 'template0'"
-- To run this file: "psql -U nwcuser -d nwcuidb -a -f nwc_dbsetup.sql"

DROP TABLE IF EXISTS sitecache;
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



