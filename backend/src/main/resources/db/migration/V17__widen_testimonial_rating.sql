-- V17: Widen testimonial.rating from TINYINT to INT.
--
-- V15 created the column as TINYINT, which is ample for a 1-5 rating. The
-- Testimonial entity maps it as a Java `int`, and Hibernate's schema validation
-- compares JDBC types rather than value ranges: it reads TINYINT as
-- Types#TINYINT and demands Types#INTEGER, so with ddl-auto: validate the
-- context fails to refresh and the whole application stops booting:
--
--   Schema validation: wrong column type encountered in column [rating] in
--   table [testimonial]; found [tinyint (Types#TINYINT)],
--   but expecting [integer (Types#INTEGER)]
--
-- Widening the column is the smaller change of the two available. Narrowing the
-- field to `byte` would match TINYINT, but `int` is the ordinary Java type for a
-- rating and every DTO and caller already treats it as one.
--
-- V15 is not edited to fix this: it is already recorded in flyway_schema_history
-- with a checksum, and changing an applied migration fails validation on the
-- next boot.

ALTER TABLE testimonial
    MODIFY COLUMN rating INT NOT NULL DEFAULT 5;
