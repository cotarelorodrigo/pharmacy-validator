"use server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function validatePrescription(imageBase64: string): Promise<{
  isValid: boolean;
  details?: string;
}> {
  try {
    const imageData = imageBase64.split(",")[1]; // Remove data URL prefix

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Validate this prescription. Check if: 1) The medication name is clear and complete 2) The prescription date is valid 3) All required barcodes are present and readable 4) The prescription is not expired. Return only true or false followed by a brief explanation.",
            },
            {
              type: "image",
              image: Buffer.from(imageData, "base64"),
            },
          ],
        },
      ],
    });

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    const [validity, ...details] = fullText.split("\n");
    return {
      isValid: validity.toLowerCase().includes("true"),
      details: details.join(" ").trim(),
    };
  } catch (error) {
    console.error("Error validating prescription:", error);
    return {
      isValid: false,
      details: "Error processing the prescription. Please try again.",
    };
  }
}
