# MediAlerta

Prototipo navegable de recordatorios de medicamentos para la Solemne 2 (INSW321). Funciona sin servidor: los datos viven en el navegador.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio público.
2. Sube el contenido de esta carpeta a la raíz: `index.html`, `styles.css`, `app.js`, `assets/` y `.nojekyll`.
3. En Settings → Pages, elige Deploy from a branch → `main` → `/ (root)`.
4. La dirección queda en `https://<usuario>.github.io/<repositorio>/`.

## Recorrido de la demo

Inicio → elige **Entrar como cuidador** o **Entrar como paciente**. El interruptor de arriba cambia de vista en cualquier momento. Cuidador ve a la familia; paciente (Carlos) ve solo sus pastillas.

El escáner lee texto impreso en el teléfono (necesita internet la primera vez). La letra del doctor puede fallar; siempre se confirma a mano. En el celular la app ocupa toda la pantalla; en el computador se ve dentro de un marco, también en horizontal.
