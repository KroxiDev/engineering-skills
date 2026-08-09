#!/usr/bin/env bash
#
# Un wizard — guía a un humano por un procedimiento manual paso a paso.
# Generado por el skill wizard.
#
# Todo lo anterior al marcador "STAGES" es la biblioteca del wizard: no
# editarla a mano. Redactar las etapas de cada paso debajo del marcador.

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────
# Biblioteca del wizard — UX agradable y consistente. Idéntica en todo wizard.
# ──────────────────────────────────────────────────────────────────────────

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]]; then
  BOLD=$(tput bold); DIM=$(tput dim); RESET=$(tput sgr0)
  BLUE=$(tput setaf 4); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3); RED=$(tput setaf 1)
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; GREEN=""; YELLOW=""; RED=""
fi

# El autor fija esto al principio de la sección de etapas.
TOTAL_STAGES=0

_STAGE_INDEX=0
ENV_FILE="${ENV_FILE:-.env}"
WRITTEN_ENV=()    # KEYs escritas en ENV_FILE en esta ejecución
WRITTEN_SECRET=() # NAMEs de secrets configurados en esta ejecución
SKIPPED=()        # cosas que no se pudieron hacer (p. ej. falta gh)

# _clear — limpia la terminal para que solo el paso actual esté en pantalla.
# No hace nada cuando la salida no es una terminal, así los logs siguen legibles.
_clear() {
  [[ -t 1 ]] || return 0
  if command -v tput >/dev/null 2>&1; then tput clear; else printf '\033[2J\033[3J\033[H'; fi
}

# banner "Título" — marco de apertura: qué hace este wizard.
banner() {
  _clear
  printf '\n%s%s  %s%s\n' "$BOLD" "$BLUE" "$1" "$RESET"
  printf '%s  %s etapas%s\n\n' "$DIM" "$TOTAL_STAGES" "$RESET"
  printf '%s  Tú manejas el navegador; este wizard te dice exactamente qué hacer y\n' "$DIM"
  printf '  captura los valores que copies de vuelta. Para en cualquier momento con Ctrl-C\n'
  printf '  y vuelve a ejecutarlo después — recuerda los valores ya guardados.%s\n' "$RESET"
  pause "¿Listo para empezar?"
}

# stage "Nombre" — limpia la pantalla, anuncia una etapa y muestra el progreso.
# Limpiar mantiene solo el paso actual en pantalla.
stage() {
  _clear
  _STAGE_INDEX=$((_STAGE_INDEX + 1))
  printf '\n%s%s▸ Etapa %s/%s · %s%s\n' \
    "$BOLD" "$BLUE" "$_STAGE_INDEX" "$TOTAL_STAGES" "$1" "$RESET"
}

# say "..." — una línea de instrucción simple.
say()  { printf '  %s\n' "$1"; }
# step "..." — una acción con aire numerado que el humano hace en el navegador.
step() { printf '  %s•%s %s\n' "$BLUE" "$RESET" "$1"; }
note() { printf '  %s%s%s\n' "$DIM" "$1" "$RESET"; }
warn() { printf '  %s⚠ %s%s\n' "$YELLOW" "$1" "$RESET"; }

# open_url URL — abre en el navegador del humano, multiplataforma incl. WSL.
open_url() {
  local url="$1"
  printf '  %s↗ abriendo%s %s\n' "$GREEN" "$RESET" "$url"
  # El aviso queda fuera de cualquier redirección: si no hay navegador, el humano
  # tiene que verlo. Silenciarlo deja al wizard esperando sobre una pantalla vacía.
  if command -v wslview >/dev/null 2>&1; then
    wslview "$url" >/dev/null 2>&1 || warn "no se pudo abrir el navegador; visita manualmente: $url"
  elif command -v explorer.exe >/dev/null 2>&1; then
    explorer.exe "$url" >/dev/null 2>&1 || warn "no se pudo abrir el navegador; visita manualmente: $url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || warn "no se pudo abrir el navegador; visita manualmente: $url"
  elif command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || warn "no se pudo abrir el navegador; visita manualmente: $url"
  else
    warn "no se pudo abrir el navegador; visita manualmente: $url"
  fi
}

# pause "msg" — espera a que el humano confirme que hizo la parte manual.
pause() {
  printf '  %s%s%s ' "$DIM" "${1:-Presiona Enter para continuar}" "$RESET"
  read -r _ || true
}

# confirm "pregunta" — compuerta s/N; devuelve éxito con un sí.
confirm() {
  local reply=""
  printf '  %s? %s [s/N] ' "$YELLOW" "$1"
  read -r reply || true
  [[ "$reply" =~ ^[SsYy] ]]
}

# _existing KEY — valor actual de KEY en ENV_FILE, si lo hay.
_existing() {
  [[ -f "$ENV_FILE" ]] || return 1
  local line; line=$(grep -E "^${1}=" "$ENV_FILE" | tail -n1) || return 1
  printf '%s' "${line#*=}"
}

# ask KEY "Prompt" — lee un valor en $KEY. Ofrece el valor existente del .env
# como default en re-ejecuciones (Enter lo conserva). Entrada visible (no secreta).
ask() {
  local key="$1" prompt="$2" current input
  current=$(_existing "$key" || true)
  if [[ -n "$current" ]]; then
    printf '  %s%s%s %s[Enter conserva el actual]%s ' "$BOLD" "$prompt" "$RESET" "$DIM" "$RESET"
  else
    printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  fi
  read -r input || true
  [[ -z "$input" && -n "$current" ]] && input="$current"
  printf -v "$key" '%s' "$input"
}

# ask_secret KEY "Prompt" — como ask, pero la entrada va oculta.
ask_secret() {
  local key="$1" prompt="$2" current input
  current=$(_existing "$key" || true)
  if [[ -n "$current" ]]; then
    printf '  %s%s%s %s[Enter conserva el actual]%s ' "$BOLD" "$prompt" "$RESET" "$DIM" "$RESET"
  else
    printf '  %s%s%s ' "$BOLD" "$prompt" "$RESET"
  fi
  read -rs input || true
  printf '\n'
  [[ -z "$input" && -n "$current" ]] && input="$current"
  printf -v "$key" '%s' "$input"
}

# write_env KEY VALUE — upsert de KEY=VALUE en ENV_FILE (lo crea; reemplaza
# cualquier línea existente). Idempotente.
write_env() {
  local key="$1" value="$2" tmp
  touch "$ENV_FILE"
  tmp=$(mktemp)
  grep -vE "^${key}=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$key" "$value" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
  WRITTEN_ENV+=("$key")
  printf '  %s✓ escrito%s %s → %s\n' "$GREEN" "$RESET" "$key" "$ENV_FILE"
}

# set_secret NAME VALUE — configura un secret de repo de GitHub Actions vía gh.
# Cae a un aviso (y lo registra) si gh no está disponible o autenticado.
set_secret() {
  local name="$1" value="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    if printf '%s' "$value" | gh secret set "$name" >/dev/null 2>&1; then
      WRITTEN_SECRET+=("$name")
      printf '  %s✓ configurado%s secret de GitHub %s\n' "$GREEN" "$RESET" "$name"
      return
    fi
  fi
  SKIPPED+=("Secret de GitHub $name (configúralo manualmente: gh secret set $name)")
  warn "omitido el secret de GitHub $name — gh no está listo; configúralo después"
}

# set_var NAME VALUE — configura una variable de repo de GitHub Actions (no secreta).
set_var() {
  local name="$1" value="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    if gh variable set "$name" --body "$value" >/dev/null 2>&1; then
      printf '  %s✓ configurada%s variable de GitHub %s\n' "$GREEN" "$RESET" "$name"
      return
    fi
  fi
  SKIPPED+=("Variable de GitHub $name")
  warn "omitida la variable de GitHub $name — gh no está listo; configúrala después"
}

# finish — limpia, y luego un resumen de cierre de todo lo configurado.
finish() {
  _clear
  printf '\n%s%s  ✓ Configuración completa%s\n' "$BOLD" "$GREEN" "$RESET"
  (( ${#WRITTEN_ENV[@]} ))    && note "escritos ${#WRITTEN_ENV[@]} valores en $ENV_FILE: ${WRITTEN_ENV[*]}"
  (( ${#WRITTEN_SECRET[@]} )) && note "configurados ${#WRITTEN_SECRET[@]} secrets de GitHub: ${WRITTEN_SECRET[*]}"
  if (( ${#SKIPPED[@]} )); then
    printf '\n'; warn "pendiente de hacer a mano:"
    for s in "${SKIPPED[@]}"; do note "  - $s"; done
  fi
  printf '\n'
}

# ──────────────────────────────────────────────────────────────────────────
# STAGES — redactar esta sección. Un stage() por paso que da el humano.
# Reemplazar el ejemplo de abajo. Fijar TOTAL_STAGES según las etapas escritas.
# ──────────────────────────────────────────────────────────────────────────

TOTAL_STAGES=1

banner "Configuración de Stripe"

# ── Etapa de ejemplo: reemplazar con tus pasos reales ─────────────────────
stage "Stripe — API keys"
say "Vamos a tomar tus claves de test de Stripe y guardarlas para dev local + CI."
open_url "https://dashboard.stripe.com/test/apikeys"
step "En la página de API keys, copia la Publishable key (empieza por pk_test_)."
ask STRIPE_PUBLISHABLE_KEY "Pega la publishable key:"
step "Haz clic en 'Reveal test key' en la fila Secret key, y cópiala."
ask_secret STRIPE_SECRET_KEY "Pega la secret key:"
write_env STRIPE_PUBLISHABLE_KEY "$STRIPE_PUBLISHABLE_KEY"
write_env STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
set_secret STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"   # CI necesita este
# ──────────────────────────────────────────────────────────────────────────

finish
