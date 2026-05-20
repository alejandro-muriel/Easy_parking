const DEFAULT_EXTENSION_MINUTES = 20;
const DEFAULT_EXTENSION_WINDOW_MINUTES = 20;
const DEFAULT_EXTENSION_MAX_COUNT = 1;

function parseNumberEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const RESERVA_EXTENSION_MINUTES = clamp(
  parseNumberEnv(process.env.RESERVA_EXTENSION_MINUTES, DEFAULT_EXTENSION_MINUTES),
  5,
  120,
);

export const RESERVA_EXTENSION_WINDOW_MINUTES = clamp(
  parseNumberEnv(process.env.RESERVA_EXTENSION_WINDOW_MINUTES, DEFAULT_EXTENSION_WINDOW_MINUTES),
  0,
  60,
);

export const RESERVA_EXTENSION_MAX_COUNT = clamp(
  parseNumberEnv(process.env.RESERVA_EXTENSION_MAX_COUNT, DEFAULT_EXTENSION_MAX_COUNT),
  1,
  5,
);
