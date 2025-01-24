"use client";

import { useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { Camera, FlipHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validatePrescription } from "@/lib/validate-prescription";

export function Prescription() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    details?: string;
  } | null>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  console.log("V::", validationResult);

  const toggleCamera = useCallback(() => {
    setIsCameraActive((prev) => !prev);
    setValidationResult(null);
  }, []);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const captureAndValidate = useCallback(async () => {
    if (!webcamRef.current) return;

    try {
      setIsProcessing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      const result = await validatePrescription(imageSrc);
      setValidationResult(result);
    } catch {
      setValidationResult({
        isValid: false,
        details: "Error processing image. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageSrc = e.target?.result as string;
          const result = await validatePrescription(imageSrc);
          console.log("RFILE::", result);
          setValidationResult(result);
        };
        reader.readAsDataURL(file);
      } catch {
        setValidationResult({
          isValid: false,
          details: "Error processing image. Please try again.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Prescription Scanner</h3>
          {isCameraActive && (
            <Button variant="ghost" size="icon" onClick={toggleFacingMode}>
              <FlipHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCameraActive ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            {isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <span>Processing...</span>
              </div>
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode,
                  aspectRatio: 4 / 3,
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] flex items-center justify-center rounded-lg border-2 border-dashed">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {process.env.NODE_ENV !== "production" && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-4"
          />
        )}

        {validationResult && (
          <Alert variant={validationResult.isValid ? "default" : "destructive"}>
            <AlertTitle>
              {validationResult.isValid
                ? "Valid Prescription"
                : "Invalid Prescription"}
            </AlertTitle>
            <AlertDescription>{validationResult.details}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={toggleCamera} variant="outline" className="flex-1">
          {isCameraActive ? "Stop Camera" : "Start Camera"}
        </Button>
        {isCameraActive && (
          <Button
            onClick={captureAndValidate}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Validate"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
