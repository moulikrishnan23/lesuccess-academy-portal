# Spring Boot 4 — Migration Notes

Practical notes for anyone working in this backend, written while getting the
contact module's test suite from *16 errors* to *37 green*. Most of the time lost
went to failures whose error message pointed somewhere other than the real cause.

**Stack as of writing:** Spring Boot `4.1.0` · Spring Framework `7.0.8` · Java 21
(toolchain JDK 25) · Jackson `3.1.4` · Flyway `12.4.0` · Testcontainers `1.21.4`
· Docker Engine `29.7.2`

---

## Symptom → cause lookup

Start here. Every row is a failure actually hit in this repo.

| What you see | Real cause | Section |
|---|---|---|
| `No qualifying bean of type 'com.fasterxml.jackson.databind.ObjectMapper'` | Boot 4 configures a **Jackson 3** mapper; you imported the Jackson 2 type | [1](#1-jackson-2-vs-jackson-3) |
| `No enum constant tools.jackson.databind.SerializationFeature.write-dates-as-timestamps` | Flag moved off `SerializationFeature` in Jackson 3 | [1](#1-jackson-2-vs-jackson-3) |
| `The method asText() from JsonNode is deprecated` | Renamed to `asString()` in Jackson 3 | [1](#1-jackson-2-vs-jackson-3) |
| Flyway never runs; **no log output at all**; Hibernate then fails `Schema validation: missing table [...]` | `spring-boot-flyway` module missing | [2](#2-autoconfiguration-is-modular-now) |
| `No qualifying bean of type 'org.springframework.boot.resttestclient.TestRestTemplate'` | Needs `@AutoConfigureTestRestTemplate` | [2](#2-autoconfiguration-is-modular-now) |
| `NoClassDefFoundError: org/springframework/boot/restclient/RestTemplateBuilder` | `spring-boot-restclient` module missing | [2](#2-autoconfiguration-is-modular-now) |
| `Could not find a valid Docker environment` — but `docker` works fine in your shell | Testcontainers too old for Docker Engine 29.x | [3](#3-testcontainers-must-be-1214-for-docker-engine-29x) |
| `Unable to build DatabaseInformation [Unknown table 'SEQUENCES' in information_schema]` | H2 dialect left active against MySQL | [4](#4-application-testyml-pins-three-h2-specific-settings) |
| `Could not resolve placeholder 'lesuccess.cors.allowed-origins'` | `@Value` cannot bind a YAML **sequence** | [5](#5-bonus-value-cannot-bind-a-yaml-list) |

---

## 1. Jackson 2 vs Jackson 3

Boot 4 ships **Jackson 3**, which relocated its packages:

| | Jackson 2 | Jackson 3 |
|---|---|---|
| Core + databind | `com.fasterxml.jackson.core` / `.databind` | **`tools.jackson.core` / `tools.jackson.databind`** |
| Annotations | `com.fasterxml.jackson.annotation` | **unchanged** — still `com.fasterxml.jackson.annotation` |

That split is the trap. Annotations look untouched, so `@JsonInclude`,
`@JsonProperty` etc. keep resolving and everything *appears* fine — until you
inject a mapper.

### Rules

**Do not import `com.fasterxml.jackson.databind.ObjectMapper`.** Boot only
registers a `tools.jackson.databind.ObjectMapper` bean. The Jackson 2 type may
still be on the classpath (see below), so the import compiles in test code and
fails at wiring time with a missing-bean error.

```java
import tools.jackson.databind.ObjectMapper;   // ✅ the bean Boot provides
import tools.jackson.databind.JsonNode;       // ✅
import com.fasterxml.jackson.annotation.JsonInclude;  // ✅ correct — annotations did not move
```

**Jackson 2 is still on the classpath, deliberately.** `io.jsonwebtoken:jjwt-jackson`
needs it, so it arrives at **`runtime` scope**:

```
+- tools.jackson.core:jackson-databind:3.1.4:compile
|  +- com.fasterxml.jackson.core:jackson-annotations:2.21:compile   <- Jackson 3's own choice
+- io.jsonwebtoken:jjwt-jackson:0.12.6:runtime
   \- com.fasterxml.jackson.core:jackson-databind:2.21.4:runtime    <- for jjwt only
```

Runtime scope is doing real work here: the Jackson 2 `ObjectMapper` is **not on
the compile classpath for `src/main`**, so importing it there fails the build
rather than failing at startup. Test code is looser — runtime deps *are* on the
test compile classpath — so a test can still import the wrong type and only fail
when the context loads.

> **Never add `com.fasterxml.jackson.core:jackson-databind` as a direct
> dependency.** A direct declaration wins Maven's nearest-definition rule and
> puts Jackson 2's databind back on the compile classpath, re-enabling exactly
> the mistake above. This was in our `pom.xml` and has been removed.
> `jackson-datatype-jsr310` is likewise unnecessary — Jackson 3 has `java.time`
> support built in.

### API changes you'll hit

| Jackson 2 | Jackson 3 |
|---|---|
| `JsonNode.asText()` | `JsonNode.asString()` |
| `JsonProcessingException` (**checked**) | `JacksonException` (**unchecked**) |
| `SerializationFeature.WRITE_DATES_AS_TIMESTAMPS` | `DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS` |

Because `writeValueAsString` now throws an *unchecked* exception, a `try/catch`
you inherited may become unnecessary — but it still compiles, so the compiler
won't tell you.

On the last row: `spring.jackson.serialization.write-dates-as-timestamps: false`
is now an **invalid property** and fails context startup. Just delete it —
Jackson 3 already defaults to ISO-8601 for `java.time`.

---

## 2. Autoconfiguration is modular now

Boot 4 broke the monolithic `spring-boot-autoconfigure` into per-technology
modules. **A library on the classpath no longer implies Boot will configure it.**

You can spot this in stack traces — autoconfiguration classes now live under
per-module packages like `org.springframework.boot.hibernate.autoconfigure.*`
and `org.springframework.boot.jackson.autoconfigure.*`.

### Flyway — the dangerous one

`org.flywaydb:flyway-core` alone **is not enough**. Without the Boot module,
every `spring.flyway.*` property is read by nobody:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-flyway</artifactId>
</dependency>
```

This one deserves special care because **it fails silently**. There is no
warning, no "Flyway disabled" log, no startup error. Migrations simply never
run. The first symptom is unrelated and arrives later:

```
SchemaManagementException: Schema validation: missing table [contact_message]
```

You will naturally go looking at your entity mappings. The entities are fine —
the tables were never created.

**Diagnostic:** if Flyway is working you always get log output. Grep your startup
log for `FlywayExecutor` / `DbMigrate`. Zero Flyway lines means the module is
missing, not that migrations were up to date.

### TestRestTemplate — two separate steps

`TestRestTemplate` moved to `org.springframework.boot.resttestclient` and is
**no longer registered by `@SpringBootTest` alone**. You need both:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate   // required in Boot 4
class MyIntegrationTest { ... }
```

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-resttestclient</artifactId>
    <scope>test</scope>
</dependency>
<!-- TestRestTemplateTestAutoConfiguration references RestTemplateBuilder,
     which Boot 4 moved into this separate module -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-restclient</artifactId>
    <scope>test</scope>
</dependency>
```

Miss the annotation and you get a plain missing-bean error. Miss
`spring-boot-restclient` and you get something far less obvious — a *condition
evaluation* failure, because Boot cannot introspect the autoconfiguration class
to evaluate `@ConditionalOnMissingBean`:

```
BeanTypeDeductionException: Failed to deduce bean type for
  ...TestRestTemplateTestAutoConfiguration.testRestTemplate
Caused by: NoClassDefFoundError: org/springframework/boot/restclient/RestTemplateBuilder
```

**Johnson — this is the pair you'll hit first.** They surface one at a time, so
fixing the annotation just reveals the missing module.

---

## 3. Testcontainers must be ≥ 1.21.4 for Docker Engine 29.x

Testcontainers `1.20.4` bundles docker-java `3.4.0`, which cannot negotiate an
API version with Docker Engine 29.x. The failure is **actively misleading**:

```
Could not find a valid Docker environment. Please check configuration.
Attempted configurations were:
  EnvironmentAndSystemPropertyClientProviderStrategy: failed with exception
    BadRequestException (Status 400: {"ID":"","Containers":0,...})
  NpipeSocketClientProviderStrategy: failed with exception
    BadRequestException (Status 400: {"ID":"","Containers":0,...})
```

It reads like Docker isn't installed. It is — `docker info`, `docker pull` and
`docker run` all work perfectly from the shell the whole time.

**How to tell them apart:** look past the headline at the nested exception.

- `BadRequestException (Status 400 ...)` with a well-formed but **entirely empty**
  `/info` payload → the daemon is answering and *rejecting the request*. That's a
  version problem, not a connectivity problem.
- A connection-refused / pipe-not-found error → genuinely no daemon.

Docker Engine 29 reports `API 1.55`, `MinAPI 1.40`. docker-java 3.4.0 negotiates
below that floor and gets refused.

**Fix:** `<testcontainers.version>1.21.4</testcontainers.version>` (or 2.x, which
is a major bump with API changes — 1.21.x is the low-risk option). This also
moves Ryuk 0.11.0 → 0.12.0, fixing a separate reaper-container startup failure.

Two red herrings that cost time here, so you can skip them:

- **`DOCKER_API_VERSION=1.44`** appears to work — it connected once — but is not
  reliable. Don't build on it.
- **`~/.testcontainers.properties`** caches a client strategy and is rewritten on
  every run. A stale entry can pin a strategy pointing at a pipe that doesn't
  exist. If you're debugging connection problems, delete it between attempts. On
  Windows with Docker Desktop, the active context is
  `npipe:////./pipe/dockerDesktopLinuxEngine` — the legacy
  `//./pipe/docker_engine` does **not** exist.

---

## 4. `application-test.yml` pins three H2-specific settings

Our shared test profile is tuned for H2 slice tests:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;...;MODE=MYSQL
    driver-class-name: org.h2.Driver      # (1)
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect   # (2)
  flyway:
    enabled: false                        # (3)
```

**If you write an integration test against a real database, you must override
all three.** `@DynamicPropertySource` overriding only the datasource URL is not
enough — and each omission fails differently, one at a time, so it feels like
whack-a-mole:

| Left un-overridden | What happens |
|---|---|
| `driver-class-name` | Hikari refuses the URL — it's handed a `jdbc:mysql:` URL with the H2 driver |
| `dialect` | `Unable to build DatabaseInformation [Unknown table 'SEQUENCES' in information_schema]` — Hibernate probes an H2-only table |
| `flyway.enabled` | Migrations never run; your schema is empty and `ddl-auto: validate` fails |

The `dialect` one is the nastiest: the connection succeeds, Flyway runs, the
container is healthy — and it still fails, on a table name from a database
you're not using.

### Working template

```java
@DynamicPropertySource
static void configureProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", mysql::getJdbcUrl);
    registry.add("spring.datasource.username", mysql::getUsername);
    registry.add("spring.datasource.password", mysql::getPassword);

    // All three H2 pins from application-test.yml must be overridden together.
    registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
    registry.add("spring.jpa.properties.hibernate.dialect",
            () -> "org.hibernate.dialect.MySQLDialect");
    registry.add("spring.flyway.enabled", () -> true);

    registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
}
```

See `ContactIntegrationTest` for the full working example.

**General principle:** database-shaped properties travel as a set. Changing which
database a test points at means moving *all* of them, not just the URL.

---

## 5. Bonus: `@Value` cannot bind a YAML list

Not Boot-4-specific, but it kept the whole application from starting in every
profile, so it's worth knowing.

```yaml
lesuccess:
  cors:
    allowed-origins:
      - http://localhost:5173
```

```java
@Value("${lesuccess.cors.allowed-origins}")   // ❌ fails to start
private List<String> allowedOrigins;
```

```
PlaceholderResolutionException:
  Could not resolve placeholder 'lesuccess.cors.allowed-origins'
```

Spring flattens YAML sequences into **indexed** keys — `allowed-origins[0]`,
`allowed-origins[1]` — so no scalar property by that exact name ever exists.
`@Value` can only bind a `List` from a *comma-separated string*.

Use `@ConfigurationProperties`, which handles sequences natively:

```java
@ConfigurationProperties(prefix = "lesuccess.cors")
public class CorsProperties {
    private List<String> allowedOrigins = new ArrayList<>();
    // getters/setters
}
```

See `CorsProperties` / `CorsConfig`.

---

## Checklist for a new integration test

1. `@SpringBootTest(webEnvironment = RANDOM_PORT)` **+ `@AutoConfigureTestRestTemplate`**
2. Confirm `spring-boot-restclient` is on the test classpath
3. Override **all** of: URL, username, password, `driver-class-name`, `hibernate.dialect`, `flyway.enabled`
4. Confirm `spring-boot-flyway` is a dependency, then grep startup logs for `DbMigrate` to prove migrations actually ran
5. Import `tools.jackson.databind.ObjectMapper`, never the `com.fasterxml` one
6. Testcontainers ≥ 1.21.4

A green run looks like this — if you don't see the `DbMigrate` line, your
migrations didn't execute:

```
tc.mysql:8.0 : Container mysql:8.0 started in PT21.15S
DbMigrate    : Successfully applied 2 migrations to schema `lesuccess_test`, now at version v2
Tests run: 37, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

2026-08-17: Package structure changed from feature-based (`common`, `contact`, `integration.sheets`) to layer-based (`controller`, `service`, `repository`, `model`, `dto`, `event`, `exception`, `config`, `security`). Structural only — no behavior or test assertions changed.

2026-08-17: Production credentials now load from a base64-encoded env var decoded in memory (never written to disk); see PRODUCTION-SECRETS.md for the pattern to follow for any new module secret.
