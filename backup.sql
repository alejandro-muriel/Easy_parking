--
-- PostgreSQL database dump
--

\restrict GSmSCfHWGQhXzzYeZIrYNTnB5qHSzvkLUMXwEXIBNAbsKqbYPUMCbibgFwdVYOq

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EstadoPlaza; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."EstadoPlaza" AS ENUM (
    'DISPONIBLE',
    'RESERVADA',
    'OCUPADA',
    'BLOQUEADA'
);


ALTER TYPE public."EstadoPlaza" OWNER TO admin;

--
-- Name: EstadoReserva; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."EstadoReserva" AS ENUM (
    'ACTIVA',
    'CANCELADA',
    'EXPIRADA',
    'EXTENDIDA'
);


ALTER TYPE public."EstadoReserva" OWNER TO admin;

--
-- Name: TipoPlaza; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."TipoPlaza" AS ENUM (
    'NORMAL',
    'PREFERENCIAL',
    'PERMANENTE'
);


ALTER TYPE public."TipoPlaza" OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO admin;

--
-- Name: horarios; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.horarios (
    id text NOT NULL,
    materia text NOT NULL,
    "horaInicio" timestamp(3) without time zone NOT NULL,
    "horaFin" timestamp(3) without time zone NOT NULL,
    "diaSemana" text NOT NULL,
    "idUsuario" text NOT NULL
);


ALTER TABLE public.horarios OWNER TO admin;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    key text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO admin;

--
-- Name: plazas_parqueo; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.plazas_parqueo (
    id text NOT NULL,
    zona text NOT NULL,
    fila text NOT NULL,
    numero integer NOT NULL,
    estado public."EstadoPlaza" DEFAULT 'DISPONIBLE'::public."EstadoPlaza" NOT NULL,
    tipo public."TipoPlaza" DEFAULT 'NORMAL'::public."TipoPlaza" NOT NULL,
    "ultimoCambio" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "bloqueoTemporalHasta" timestamp(3) without time zone,
    "capacidadVecina" text
);


ALTER TABLE public.plazas_parqueo OWNER TO admin;

--
-- Name: reservas; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.reservas (
    id text NOT NULL,
    "idUsuario" text NOT NULL,
    "idPlaza" text NOT NULL,
    "fechaHoraInicio" timestamp(3) without time zone NOT NULL,
    "fechaHoraFin" timestamp(3) without time zone NOT NULL,
    estado public."EstadoReserva" DEFAULT 'ACTIVA'::public."EstadoReserva" NOT NULL,
    "fechaCreacion" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "metodoPago" text
);


ALTER TABLE public.reservas OWNER TO admin;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO admin;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO admin;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    "passwordHash" text NOT NULL,
    "roleId" text NOT NULL,
    "parqueoPermanente" boolean DEFAULT false NOT NULL,
    "estadoCuenta" text DEFAULT 'ACTIVE'::text NOT NULL,
    "ultimoLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3d564d7d-bf41-4a9f-acb2-ee98cb58adec	48b5bb6a627809723d273ebe7b6be54cdff84f739a750c7b9b6bdc9b8a6ffdad	2026-03-31 19:49:39.318668-05	20260401004939_init	\N	\N	2026-03-31 19:49:39.183705-05	1
33e2a2b0-d3c8-40e4-978c-d8e855ab1852	04a3dc817f8495e6aadc41fe7d6e08158b6119ed8f20ace90a1932dc48a017b6	2026-04-02 07:31:20.417034-05	20260402123120_reserva	\N	\N	2026-04-02 07:31:20.30007-05	1
\.


--
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.horarios (id, materia, "horaInicio", "horaFin", "diaSemana", "idUsuario") FROM stdin;
cmnnt6ade002vvjh48qqi2ybv	Programación I	2026-04-09 14:00:00	2026-04-09 16:00:00	miércoles	cmnfbzlf3002avjmg57ou4qwn
cmnnt6ade002tvjh4fmhv6m3s	Física I	2026-04-08 10:30:00	2026-04-08 12:30:00	martes	cmnfbzlf3002avjmg57ou4qwn
cmnnt6ade002yvjh4xphf1g51	Estructuras de Datos	2026-04-07 14:00:00	2026-04-07 16:00:00	lunes	cmnfbzlf3002cvjmg8qzc2x6a
cmnnt6ade002wvjh48cpw0evv	Matemáticas I	2026-04-07 08:00:00	2026-04-07 10:00:00	lunes	cmnfbzlf3002avjmg57ou4qwn
cmnnt6ade002xvjh4397h2ovd	Bases de Datos	2026-04-08 08:00:00	2026-04-08 10:00:00	martes	cmnfbzlf3002cvjmg8qzc2x6a
cmnnt6pgx002svjocj3xl2ac4	Matemáticas I	2026-04-07 08:00:00	2026-04-07 10:00:00	lunes	cmnfbzlf3002avjmg57ou4qwn
cmnnt6pgx002uvjocsu8cw3kk	Programación I	2026-04-09 14:00:00	2026-04-09 16:00:00	miércoles	cmnfbzlf3002avjmg57ou4qwn
cmnnt6pgy002wvjocmcm7zo3t	Estructuras de Datos	2026-04-07 14:00:00	2026-04-07 16:00:00	lunes	cmnfbzlf3002cvjmg8qzc2x6a
cmnnt6pgy002yvjocltzofua1	Bases de Datos	2026-04-08 08:00:00	2026-04-08 10:00:00	martes	cmnfbzlf3002cvjmg8qzc2x6a
cmnnt6pgx002tvjocw6c8vhbd	Física I	2026-04-08 10:30:00	2026-04-08 12:30:00	martes	cmnfbzlf3002avjmg57ou4qwn
cmnntbcbb002svjdootgau5ww	Física I	2026-04-08 10:30:00	2026-04-08 12:30:00	martes	cmnfbzlf3002avjmg57ou4qwn
cmnntbcbb002vvjdotgaj677o	Estructuras de Datos	2026-04-07 14:00:00	2026-04-07 16:00:00	lunes	cmnfbzlf3002cvjmg8qzc2x6a
cmnntbcbb002yvjdozmez53tr	Bases de Datos	2026-04-08 08:00:00	2026-04-08 10:00:00	martes	cmnfbzlf3002cvjmg8qzc2x6a
cmnntbcbb002tvjdovo7ikz1x	Matemáticas I	2026-04-07 08:00:00	2026-04-07 10:00:00	lunes	cmnfbzlf3002avjmg57ou4qwn
cmnntbcbb002xvjdoir29lnza	Programación I	2026-04-09 14:00:00	2026-04-09 16:00:00	miércoles	cmnfbzlf3002avjmg57ou4qwn
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.permissions (id, resource, action, key, description, "createdAt") FROM stdin;
cmnfbzkvq0007vjmgbabi6s3t	auth	login	auth.login	Acceso al sistema	2026-04-01 00:52:12.278
cmnfbzkw2000dvjmg2f19oxeu	admin	audit.view	admin.audit.view	Ver auditoría	2026-04-01 00:52:12.279
cmnfbzkvq000bvjmggmuzdihw	parking	reserve.cancel	parking.reserve.cancel	Cancelar propia reserva	2026-04-01 00:52:12.278
cmnfbzkvq0006vjmgjeio0lg5	parking	view.map	parking.view.map	Ver mapa de plazas	2026-04-01 00:52:12.278
cmnfbzkys000evjmggi3plqgu	parking	reserve.create	parking.reserve.create	Crear reserva	2026-04-01 00:52:12.278
cmnfbzkyv000fvjmg5wdalpnh	parking	slot.manage.release	parking.slot.manage.release	Liberar plaza (celador)	2026-04-01 00:52:12.278
cmnfbzkvq0009vjmgajy0qxz7	parking	slot.manage.assign	parking.slot.manage.assign	Asignar plaza (celador)	2026-04-01 00:52:12.278
cmnfbzkz3000gvjmg3avu7b2x	admin	reports.view	admin.reports.view	Ver reportes	2026-04-01 00:52:12.278
cmnfbzkvq0008vjmgxsqwe2me	admin	user.manage	admin.user.manage	Gestionar usuarios	2026-04-01 00:52:12.278
cmnfbzkvq000avjmg9lrn6462	parking	view.availability	parking.view.availability	Ver disponibilidad	2026-04-01 00:52:12.278
cmnfbzkw1000cvjmgct6905dp	admin	config.manage	admin.config.manage	Configurar sistema	2026-04-01 00:52:12.279
\.


--
-- Data for Name: plazas_parqueo; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.plazas_parqueo (id, zona, fila, numero, estado, tipo, "ultimoCambio", "bloqueoTemporalHasta", "capacidadVecina") FROM stdin;
cmnnt6ad4002nvjh4zv2ku6pu	B	B	2	DISPONIBLE	NORMAL	2026-04-06 23:15:28.119	\N	\N
cmnnt6abt002fvjh40qu3v7gd	A	A	3	RESERVADA	NORMAL	2026-04-06 23:15:28.196	\N	\N
cmnnt6aby002gvjh4tg8807k5	A	B	1	RESERVADA	PREFERENCIAL	2026-04-06 23:15:47.709	\N	\N
cmnnt6ac3002hvjh4ia09qs31	A	B	2	RESERVADA	NORMAL	2026-04-06 23:15:47.716	\N	\N
cmnnt6ace002jvjh4mh3wsw4s	B	A	1	RESERVADA	PERMANENTE	2026-04-06 23:19:23.955	\N	\N
cmnnt6acy002mvjh4f5j3cyn2	B	B	1	RESERVADA	NORMAL	2026-04-07 00:42:49.064	\N	\N
cmnnt6ad9002ovjh4rn9xga84	B	B	3	RESERVADA	PREFERENCIAL	2026-04-07 00:56:24.58	\N	\N
cmnnt6abo002evjh48i6itb8d	A	A	2	DISPONIBLE	NORMAL	2026-04-07 01:06:21.344	\N	\N
cmnnt6aar002dvjh4be0l9swi	A	A	1	DISPONIBLE	NORMAL	2026-04-07 01:06:22.572	\N	\N
cmnnt6acs002lvjh4s0jiqe6m	B	A	3	DISPONIBLE	NORMAL	2026-04-07 01:06:25.423	\N	\N
cmnnt6ack002kvjh46e7gwn6i	B	A	2	DISPONIBLE	NORMAL	2026-04-07 01:06:27.23	\N	\N
cmnnt6ac8002ivjh4lu9t8xzn	A	B	3	DISPONIBLE	NORMAL	2026-04-07 01:06:30.657	\N	\N
\.


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.reservas (id, "idUsuario", "idPlaza", "fechaHoraInicio", "fechaHoraFin", estado, "fechaCreacion", "metodoPago") FROM stdin;
cmnnt6aef0030vjh42ophzaeq	cmnfbzlf3002avjmg57ou4qwn	cmnnt6aar002dvjh4be0l9swi	2026-04-07 08:00:00	2026-04-07 10:00:00	ACTIVA	2026-04-06 23:15:28.167	TARJETA_CREDITO
cmnnt6af00032vjh4aj0hmrn9	cmnfbzlf3002cvjmg8qzc2x6a	cmnnt6abo002evjh48i6itb8d	2026-04-07 14:00:00	2026-04-07 16:00:00	ACTIVA	2026-04-06 23:15:28.188	TARJETA_CREDITO
cmnnt6af50034vjh4w7tnqjwk	cmnfbzlf3002avjmg57ou4qwn	cmnnt6abt002fvjh40qu3v7gd	2026-04-08 10:30:00	2026-04-08 12:30:00	ACTIVA	2026-04-06 23:15:28.194	TARJETA_CREDITO
cmnnt6phc0030vjochutpk9ku	cmnfbzlf3002avjmg57ou4qwn	cmnnt6aby002gvjh4tg8807k5	2026-04-07 08:00:00	2026-04-07 10:00:00	ACTIVA	2026-04-06 23:15:47.712	TARJETA_CREDITO
cmnnt6phl0032vjoclamq5uqu	cmnfbzlf3002cvjmg8qzc2x6a	cmnnt6ac3002hvjh4ia09qs31	2026-04-07 14:00:00	2026-04-07 16:00:00	ACTIVA	2026-04-06 23:15:47.722	TARJETA_CREDITO
cmnnt6phr0034vjoczpfm2e7f	cmnfbzlf3002avjmg57ou4qwn	cmnnt6ac8002ivjh4lu9t8xzn	2026-04-08 10:30:00	2026-04-08 12:30:00	ACTIVA	2026-04-06 23:15:47.727	TARJETA_CREDITO
cmnntbcby0030vjdor3fj846m	cmnfbzlf3002avjmg57ou4qwn	cmnnt6ace002jvjh4mh3wsw4s	2026-04-07 08:00:00	2026-04-07 10:00:00	ACTIVA	2026-04-06 23:19:23.95	TARJETA_CREDITO
cmnntbcc90032vjdor19yw9u8	cmnfbzlf3002cvjmg8qzc2x6a	cmnnt6ack002kvjh46e7gwn6i	2026-04-07 14:00:00	2026-04-07 16:00:00	ACTIVA	2026-04-06 23:19:23.961	TARJETA_CREDITO
cmnntbcce0034vjdolf2cek8e	cmnfbzlf3002avjmg57ou4qwn	cmnnt6acs002lvjh4s0jiqe6m	2026-04-08 10:30:00	2026-04-08 12:30:00	ACTIVA	2026-04-06 23:19:23.967	TARJETA_CREDITO
cmnnwam9o0003vj4wlf3te51u	cmnfbzlf3002avjmg57ou4qwn	cmnnt6acy002mvjh4f5j3cyn2	2026-04-07 10:30:00	2026-04-07 12:30:00	ACTIVA	2026-04-07 00:42:49.017	ACADEMICA
cmnnws3jy000dvj4ws06nesnm	cmnfbzlf3002avjmg57ou4qwn	cmnnt6ad9002ovjh4rn9xga84	2026-04-08 14:00:00	2026-04-08 16:00:00	ACTIVA	2026-04-07 00:56:24.574	ACADEMICA
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.role_permissions (id, "roleId", "permissionId", "createdAt") FROM stdin;
cmnfbzkzb000ivjmgte6zxv9d	cmnfbzkus0002vjmgd6wpjppw	cmnfbzkvq0007vjmgbabi6s3t	2026-04-01 00:52:12.407
cmnfbzkzy000kvjmg97iz3qop	cmnfbzkus0002vjmgd6wpjppw	cmnfbzkvq0006vjmgjeio0lg5	2026-04-01 00:52:12.43
cmnfbzl03000mvjmgr5rcbntk	cmnfbzkus0002vjmgd6wpjppw	cmnfbzkvq000avjmg9lrn6462	2026-04-01 00:52:12.435
cmnfbzl08000ovjmgsmq5qe5c	cmnfbzkus0002vjmgd6wpjppw	cmnfbzkys000evjmggi3plqgu	2026-04-01 00:52:12.44
cmnfbzl0c000qvjmgjtix1hcq	cmnfbzkus0002vjmgd6wpjppw	cmnfbzkvq000bvjmggmuzdihw	2026-04-01 00:52:12.445
cmnfbzl0i000svjmg3qp47fax	cmnfbzkuv0003vjmgcuwdgskf	cmnfbzkvq0007vjmgbabi6s3t	2026-04-01 00:52:12.45
cmnfbzl0n000uvjmg6a5luxbg	cmnfbzkuv0003vjmgcuwdgskf	cmnfbzkvq0006vjmgjeio0lg5	2026-04-01 00:52:12.455
cmnfbzl0s000wvjmghu0s2oil	cmnfbzkuv0003vjmgcuwdgskf	cmnfbzkvq000avjmg9lrn6462	2026-04-01 00:52:12.46
cmnfbzl0v000yvjmgjsygv59v	cmnfbzkuv0003vjmgcuwdgskf	cmnfbzkys000evjmggi3plqgu	2026-04-01 00:52:12.464
cmnfbzl0z0010vjmg2sg9otre	cmnfbzkuv0003vjmgcuwdgskf	cmnfbzkvq000bvjmggmuzdihw	2026-04-01 00:52:12.467
cmnfbzl120012vjmgvl13srm8	cmnfbzku50001vjmgufchzu5i	cmnfbzkvq0007vjmgbabi6s3t	2026-04-01 00:52:12.471
cmnfbzl160014vjmgl4sfcdkl	cmnfbzku50001vjmgufchzu5i	cmnfbzkvq0006vjmgjeio0lg5	2026-04-01 00:52:12.474
cmnfbzl190016vjmgxfpgzn69	cmnfbzku50001vjmgufchzu5i	cmnfbzkvq000avjmg9lrn6462	2026-04-01 00:52:12.477
cmnfbzl1e0018vjmgi8hsn2ig	cmnfbzku50001vjmgufchzu5i	cmnfbzkz3000gvjmg3avu7b2x	2026-04-01 00:52:12.482
cmnfbzl1i001avjmgv04c4aku	cmnfbzkre0000vjmgtcgm9nlm	cmnfbzkvq0007vjmgbabi6s3t	2026-04-01 00:52:12.486
cmnfbzl1l001cvjmgi1uodpds	cmnfbzkre0000vjmgtcgm9nlm	cmnfbzkz3000gvjmg3avu7b2x	2026-04-01 00:52:12.489
cmnfbzl1p001evjmggjjnn0x2	cmnfbzkre0000vjmgtcgm9nlm	cmnfbzkw2000dvjmg2f19oxeu	2026-04-01 00:52:12.493
cmnfbzl1t001gvjmglrzhmzlh	cmnfbzkvc0004vjmg3ys0ayak	cmnfbzkvq0007vjmgbabi6s3t	2026-04-01 00:52:12.498
cmnfbzl1y001ivjmgu5vvi7qj	cmnfbzkvc0004vjmg3ys0ayak	cmnfbzkvq0006vjmgjeio0lg5	2026-04-01 00:52:12.502
cmnfbzl21001kvjmgvhv73ym7	cmnfbzkvc0004vjmg3ys0ayak	cmnfbzkvq000avjmg9lrn6462	2026-04-01 00:52:12.505
cmnfbzl25001mvjmgw2rvub9e	cmnfbzkvc0004vjmg3ys0ayak	cmnfbzkvq0009vjmgajy0qxz7	2026-04-01 00:52:12.509
cmnfbzl28001ovjmg7d38plr4	cmnfbzkvc0004vjmg3ys0ayak	cmnfbzkyv000fvjmg5wdalpnh	2026-04-01 00:52:12.513
cmnfbzl2c001qvjmg309qkg9g	cmnfbzkvc0004vjmg3ys0ayak	cmnfbzkw2000dvjmg2f19oxeu	2026-04-01 00:52:12.517
cmnfbzl2g001svjmgbg67hdn9	cmnfbzkvh0005vjmgds0ghr8m	cmnfbzkvq0007vjmgbabi6s3t	2026-04-01 00:52:12.52
cmnfbzl2k001uvjmg8uvhcd9g	cmnfbzkvh0005vjmgds0ghr8m	cmnfbzkvq0006vjmgjeio0lg5	2026-04-01 00:52:12.524
cmnfbzl2p001wvjmg0shfc4hk	cmnfbzkvh0005vjmgds0ghr8m	cmnfbzkvq000avjmg9lrn6462	2026-04-01 00:52:12.529
cmnfbzl2s001yvjmgtioycdkg	cmnfbzkvh0005vjmgds0ghr8m	cmnfbzkvq0008vjmgxsqwe2me	2026-04-01 00:52:12.533
cmnfbzl2w0020vjmgwzz4n35x	cmnfbzkvh0005vjmgds0ghr8m	cmnfbzkw1000cvjmgct6905dp	2026-04-01 00:52:12.536
cmnfbzl300022vjmgpm6d66or	cmnfbzkvh0005vjmgds0ghr8m	cmnfbzkz3000gvjmg3avu7b2x	2026-04-01 00:52:12.54
cmnfbzl340024vjmguxv0miow	cmnfbzkvh0005vjmgds0ghr8m	cmnfbzkw2000dvjmg2f19oxeu	2026-04-01 00:52:12.544
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
cmnfbzkuv0003vjmgcuwdgskf	DOCENTE	Profesor universitario	2026-04-01 00:52:12.119	2026-04-06 23:19:22.898
cmnfbzkus0002vjmgd6wpjppw	ESTUDIANTE	Usuario universitario con acceso a reservas	2026-04-01 00:52:12.119	2026-04-06 23:19:22.898
cmnfbzkvc0004vjmg3ys0ayak	CELADOR	Operador de parqueadero	2026-04-01 00:52:12.119	2026-04-06 23:19:22.898
cmnfbzkre0000vjmgtcgm9nlm	DIRECTIVO	Rectoría/Dirección	2026-04-01 00:52:12.119	2026-04-06 23:19:22.898
cmnfbzkvh0005vjmgds0ghr8m	ADMIN	Administrador del sistema	2026-04-01 00:52:12.119	2026-04-06 23:19:22.898
cmnfbzku50001vjmgufchzu5i	ADMINISTRATIVO	Personal administrativo	2026-04-01 00:52:12.119	2026-04-06 23:19:22.898
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.sessions (id, "userId", token, "expiresAt", "revokedAt", "ipAddress", "userAgent", "createdAt") FROM stdin;
cmnfc38tz0001vjjo4u1ny9w2	cmnfbzlf3002cvjmg8qzc2x6a	048d01563da463335cf51f4769eb06dea7d7c08269089519815976f24459930b	2026-04-08 00:55:03.275	2026-04-01 01:01:01.714	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-01 00:55:03.281
cmnnui1kp0001vjrw93hx2voe	cmnfbzlf3002avjmg57ou4qwn	2dfe06642f6bb717b240ed8ba7e6703f0d46e79e197ee1cecc91e6cf4a6522ff	2026-04-13 23:52:36.197	2026-04-06 23:53:12.482	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-06 23:52:36.207
cmnnujypi0003vjrwwi94zwnm	cmnfbzlf3002cvjmg8qzc2x6a	9957c4121425a96bd6072d21fbd9c90fc69a05c5d63d0bfc4225900192723734	2026-04-13 23:54:05.782	2026-04-06 23:56:58.272	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-06 23:54:05.809
cmnnuonzt0005vjrwyo0y70bo	cmnfbzlf30028vjmg4gb3goiv	fde3c1725e62fab195ebb6da5cf7c86bdc95a07d71b427b77725d52f0715d0f3	2026-04-13 23:57:45.011	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-06 23:57:45.156
cmnnup9z90007vjrwpk1kljti	cmnfbzlf30028vjmg4gb3goiv	8ff6ac74c577801fde20a0f9f75a04e5eb432c236044b652ed8f6637aa144630	2026-04-13 23:58:13.534	2026-04-06 23:59:17.754	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-06 23:58:13.677
cmnnuypt60009vjrwyt1yhuu5	cmnfbzlf3002avjmg57ou4qwn	7420b67c5f24136b7c81ccf96d9db210780408476455dda37e2ad991afb2e50a	2026-04-14 00:05:34.104	2026-04-07 00:15:57.176	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:05:34.113
cmnnvcwaj0001vjugpvi2qt4r	cmnfbzlf3002cvjmg8qzc2x6a	cad00d15faabe28fa0145988d43cc08801ee2b3cefde413c9a83807bc018f0da	2026-04-14 00:16:35.694	2026-04-07 00:16:44.87	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:16:35.702
cmnnvdgnw0003vjugqozfo287	cmnfbzlf30028vjmg4gb3goiv	d2c8dd8e655e4d65f886656b0fd74d32994ee50b13691b744d6deb3b25d55136	2026-04-14 00:17:02.1	2026-04-07 00:18:19.924	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:17:02.107
cmnnvferw0005vjughh9upqvl	cmnfbzlf3002avjmg57ou4qwn	8b58ddf04793dde45550073721fb5bce1c2fd33d27aa86c3603c2ccc402c67f0	2026-04-14 00:18:32.96	2026-04-07 00:34:49.018	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:18:32.968
cmnnw2gb20001vj4w0kdxe478	cmnfbzlf3002avjmg57ou4qwn	e49d17bdf490387ce397b0f3dc6676842b4b7fa2f0b4cf787e2910f78a9d2f05	2026-04-14 00:36:28.026	2026-04-07 00:46:46.806	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:36:28.035
cmnnwgj8n0005vj4w1rlbywtq	cmnfbzlf30028vjmg4gb3goiv	c0232093da959bfda4a31551aed50b729590d9d76b5b12c5538a44b45fdee77e	2026-04-14 00:47:24.99	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:47:25.023
cmnnwgwjw0007vj4wdg0ol6g5	cmnfbzlf30028vjmg4gb3goiv	c8f165262df86e08b5e136b36449041efe7b0aa5998f92c505ba9b6ec54e2603	2026-04-14 00:47:42.267	2026-04-07 00:47:55.686	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:47:42.277
cmnnwhkrh0009vj4wh8b5gkg5	cmnfbzlf30028vjmg4gb3goiv	4346b0eccc28c572f31d609628f915bd635c81937c10c3b6190b2bcb22102b3d	2026-04-14 00:48:13.652	2026-04-07 00:54:05.969	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:48:13.659
cmnnwrco2000bvj4wcewyoyvj	cmnfbzlf3002avjmg57ou4qwn	b0283858889845cbecbc82ab4040c1347ed2f5282fb99b604cd68411386ccb1a	2026-04-14 00:55:49.701	2026-04-07 01:05:27.393	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 00:55:49.719
cmnnx4jsc0001vj5s2yk0bm0s	cmnfbzlf30028vjmg4gb3goiv	bbf009786fdea5175a3d65f4e140cf2bba30a6c907661e4cd7aa651aa2f7d3fe	2026-04-14 01:06:05.459	2026-04-07 01:06:33.545	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 01:06:05.472
cmnnx5hj50003vj5sqc7ymsqz	cmnfbzlf3002avjmg57ou4qwn	c46452541149a470fcf42bb35eb273e71a0f9ba588e1c65839f80a082df7972c	2026-04-14 01:06:49.211	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-07 01:06:49.216
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, name, "passwordHash", "roleId", "parqueoPermanente", "estadoCuenta", "ultimoLogin", "createdAt", "updatedAt") FROM stdin;
cmnfbzlf3002cvjmg8qzc2x6a	docente@poli.edu.co	María Docente	$2b$10$rEqle7NYiJhvu6rMDRxhNuga5Nr3PwrVzslnJZFm14cAyyu0Hbn2C	cmnfbzkuv0003vjmgcuwdgskf	f	ACTIVE	2026-04-07 00:16:35.694	2026-04-01 00:52:12.976	2026-04-07 00:16:35.702
cmnfbzlf30028vjmg4gb3goiv	celador@poli.edu.co	Roberto Celador	$2b$10$E6SdQwpRXRQ7KqLLsDu.W.nBPcl9XSlGylIiU60HJ45FEUH7.fKsS	cmnfbzkvc0004vjmg3ys0ayak	f	ACTIVE	2026-04-07 01:06:05.459	2026-04-01 00:52:12.975	2026-04-07 01:06:05.472
cmnfbzlf3002avjmg57ou4qwn	estudiante@poli.edu.co	Juan Estudiante	$2b$10$yQePkRzWH95zrnl9aCXFvuBgeAdhjaKNvwD04kUciX7IOsufJWHtK	cmnfbzkus0002vjmgd6wpjppw	f	ACTIVE	2026-04-07 01:06:49.212	2026-04-01 00:52:12.975	2026-04-07 01:06:49.216
cmnfbzlf30026vjmgklxqv5uy	admin@poli.edu.co	Carlos Admin	$2b$10$Uqj6NddbtoycidKqlpD63O5QuFuPvIG/Rbwk7MS6Mz8KHeBc.pu0C	cmnfbzkvh0005vjmgds0ghr8m	f	ACTIVE	\N	2026-04-01 00:52:12.975	2026-04-06 23:19:23.852
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: plazas_parqueo plazas_parqueo_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.plazas_parqueo
    ADD CONSTRAINT plazas_parqueo_pkey PRIMARY KEY (id);


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: horarios_diaSemana_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "horarios_diaSemana_idx" ON public.horarios USING btree ("diaSemana");


--
-- Name: horarios_horaFin_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "horarios_horaFin_idx" ON public.horarios USING btree ("horaFin");


--
-- Name: horarios_horaInicio_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "horarios_horaInicio_idx" ON public.horarios USING btree ("horaInicio");


--
-- Name: horarios_idUsuario_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "horarios_idUsuario_idx" ON public.horarios USING btree ("idUsuario");


--
-- Name: permissions_key_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX permissions_key_key ON public.permissions USING btree (key);


--
-- Name: permissions_resource_action_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX permissions_resource_action_key ON public.permissions USING btree (resource, action);


--
-- Name: permissions_resource_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX permissions_resource_idx ON public.permissions USING btree (resource);


--
-- Name: plazas_parqueo_estado_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX plazas_parqueo_estado_idx ON public.plazas_parqueo USING btree (estado);


--
-- Name: plazas_parqueo_tipo_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX plazas_parqueo_tipo_idx ON public.plazas_parqueo USING btree (tipo);


--
-- Name: plazas_parqueo_zona_fila_numero_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX plazas_parqueo_zona_fila_numero_key ON public.plazas_parqueo USING btree (zona, fila, numero);


--
-- Name: reservas_estado_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX reservas_estado_idx ON public.reservas USING btree (estado);


--
-- Name: reservas_fechaHoraFin_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "reservas_fechaHoraFin_idx" ON public.reservas USING btree ("fechaHoraFin");


--
-- Name: reservas_fechaHoraInicio_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "reservas_fechaHoraInicio_idx" ON public.reservas USING btree ("fechaHoraInicio");


--
-- Name: reservas_idPlaza_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "reservas_idPlaza_idx" ON public.reservas USING btree ("idPlaza");


--
-- Name: reservas_idUsuario_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "reservas_idUsuario_idx" ON public.reservas USING btree ("idUsuario");


--
-- Name: role_permissions_permissionId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "role_permissions_permissionId_idx" ON public.role_permissions USING btree ("permissionId");


--
-- Name: role_permissions_roleId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "role_permissions_roleId_idx" ON public.role_permissions USING btree ("roleId");


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "sessions_expiresAt_idx" ON public.sessions USING btree ("expiresAt");


--
-- Name: sessions_token_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);


--
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_estadoCuenta_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "users_estadoCuenta_idx" ON public.users USING btree ("estadoCuenta");


--
-- Name: users_roleId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "users_roleId_idx" ON public.users USING btree ("roleId");


--
-- Name: horarios horarios_idUsuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT "horarios_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservas reservas_idPlaza_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "reservas_idPlaza_fkey" FOREIGN KEY ("idPlaza") REFERENCES public.plazas_parqueo(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservas reservas_idUsuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "reservas_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict GSmSCfHWGQhXzzYeZIrYNTnB5qHSzvkLUMXwEXIBNAbsKqbYPUMCbibgFwdVYOq

