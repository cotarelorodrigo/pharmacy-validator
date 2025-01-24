"use server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const PrescriptionValidationSchema = z.object({
  isValid: z.boolean(),
  details: z.string().optional(),
});

export async function validatePrescription(imageBase64: string): Promise<{
  isValid: boolean;
  details?: string;
}> {
  try {
    const imageData = `data:image/jpeg;base64,${imageBase64.split(",")[1]}`; // Construct the data URL

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Eres un asistente experto en análisis de recetas de farmacia. Tu tarea es verificar que las recetas cumplan con las siguientes reglas basadas en las instrucciones proporcionadas:\n\nCoincidencia del troquel con la prescripción:\n\nEl troquel debe coincidir exactamente con el medicamento recetado, incluyendo nombre, cantidad de miligramos y comprimidos.\nSi la receta indica dos cajas, debe haber dos troqueles adheridos.\nDatos completos del afiliado o tercero:\n\nTodos los datos del afiliado o de la persona que retira deben estar presentes (por ejemplo, número de teléfono, documento de identidad, etc.).\nSi algún dato ha sido corregido o remarcado, debe estar "salvado" en el reverso de la receta con una anotación que indique el dato correcto.\nProhibición de correcciones no salvadas:\n\nNo se permiten datos remarcados sin la correspondiente corrección salvada en el reverso.\nControl de cantidades:\n\nVerifica que la cantidad de troqueles coincida con la cantidad de medicamentos indicada en la receta.\nTu objetivo es analizar una receta dada y proporcionar un informe detallado indicando:\n\nCumplimiento o incumplimiento de cada regla.\nErrores específicos detectados y recomendaciones para corregirlos.\n\nEl troquel suele estar a la izquierda de la receta o en los bordes.',
            },
            {
              type: "image_url",
              image_url: { url: imageData },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(
        PrescriptionValidationSchema,
        "prescription_validation"
      ),
    });

    const parsed = completion.choices[0].message.parsed;
    if (!parsed) {
      return {
        isValid: false,
        details: "Failed to parse response",
      };
    }

    const { isValid, details } = parsed;
    return {
      isValid,
      details: details || "",
    };
  } catch (error) {
    console.error("Error validating prescription:", error);
    return {
      isValid: false,
      details: "Error processing the prescription. Please try again.",
    };
  }
}
