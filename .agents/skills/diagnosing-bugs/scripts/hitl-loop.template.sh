#!/usr/bin/env bash
# Bucle de reproducción con intervención humana.
# Copiar este archivo, editar los pasos siguientes y ejecutarlo.
# El agente ejecuta el script; el usuario sigue los prompts en su terminal.
#
# Usage:
#   bash hitl-loop.template.sh
#
# Dos helpers:
#   step "<instrucción>"          → mostrar la instrucción y esperar Enter
#   capture VAR "<pregunta>"      → mostrar la pregunta y guardar la respuesta
#
# Al final, imprimir los valores como KEY=VALUE para que el agente los procese.
#
# `capture` devuelve su valor a la terminal, donde el agente lo lee — así que
# capturar observaciones, y dejar el inicio de sesión al usuario como un `step`.

set -euo pipefail

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [Enter al terminar] " _
}

capture() {
  local var="$1" question="$2" answer
  printf '\n>>> %s\n' "$question"
  read -r -p "    > " answer
  printf -v "$var" '%s' "$answer"
}

# --- edit below ---------------------------------------------------------

step "Abre la aplicación en http://localhost:3000 e inicia sesión."

capture ERRORED "Haz clic en 'Export'. ¿Apareció un error? (s/n)"

capture ERROR_MSG "Pega el mensaje de error (o 'ninguno'):"

# --- edit above ---------------------------------------------------------

printf '\n--- Capturado ---\n'
printf 'ERRORED=%s\n' "$ERRORED"
printf 'ERROR_MSG=%s\n' "$ERROR_MSG"
