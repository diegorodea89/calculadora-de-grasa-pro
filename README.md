# Nutriólogo Diego Rodea — Sistema de Evaluación Antropométrica, FFMI y Nivel de Gym

Aplicación web interactiva para pacientes y atletas del **Nutriólogo Diego Rodea**.

## Características principales
1. **Bienvenida e Identidad Visual:** Diseño en **Negro, Blanco y Rojo** con el mensaje *"Te da la bienvenida tu Nutriólogo Diego Rodea"* y logotipo con fondo transparente (`logo.png`).
2. **Datos Antropométricos con Dibujos Anatómicos:**
   - Nombre, sexo, edad, estatura en metros (`m`) y peso en kilos (`kg`).
   - 6 medidas corporales en `cm` (**Cuello, Cintura, Cadera, Pantorrilla, Muslo Medio y Bíceps Contraído**) con ilustraciones SVG que muestran dónde colocar la cinta métrica.
3. **Fórmulas Científicas de Grasa Corporal y Promedio:**
   - **U.S. Navy (Marina de EE. UU.)**
   - **YMCA Modificada**
   - **RFM (Relative Fat Mass — Cedars-Sinai)**
   - **CUN-BAE (Clínica Universidad de Navarra)**
   - Cálculo del **Promedio Exacto**, Masa Grasa (kg) y Masa Magra (kg).
4. **Valoración de FFMI en Gráfica:** Calcula el FFMI real y el FFMI normalizado a `1.80 m` y lo grafica en las categorías (*Principiante, Intermedio, Avanzado, Élite*).
5. **Valoración de Nivel de Gym Flexible:** Evalúa Sentadilla (1RM), Press de Banca (1RM), Peso Muerto (1RM), Dominadas, Fondos y Lagartijas usando únicamente los datos que la persona pueda ingresar.
6. **Nivel Total y Tiempo al Siguiente Nivel:** Combina el FFMI y el Nivel de Gym para otorgar el nivel global (*Principiante, Intermedio, Avanzado, Élite*) y estima el tiempo aproximado en meses para subir al siguiente nivel.
7. **Gráficas de Puntos Fuertes y Débiles:**
   - Gráfica de simetría antropométrica (puntos fuertes y débiles musculares).
   - Gráfica de rendimiento por movimiento en el gimnasio.
8. **Perfiles en la Nube + Descarga de Informe PDF para WhatsApp:**
   - Creación y guardado de perfiles de usuario en la nube con código único.
   - Generación de **Informe PDF** con el logo del Nutriólogo Diego Rodea y todas las gráficas integradas listo para enviar por WhatsApp.
