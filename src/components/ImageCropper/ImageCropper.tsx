"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Cropper, { Point, Area } from "react-easy-crop";
import { Slider } from "../Slider";
import { Button } from "../Button";
import { Box } from "../../atoms/Box";
import { Flex } from "../../atoms/Flex";
import { Text } from "../../atoms/Text";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";
import "./ImageCropper.css";
// Uses: Button, Slider

/**
 * Props for the ImageCropper component.
 */
export interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel?: () => void;
  aspect?: number;
  cropShape?: "rect" | "round";
  className?: string;
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspect = 1,
  cropShape = "round",
  className,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const isMounted = useRef(true);
  const cropOperation = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const operation = ++cropOperation.current;
    setIsCropping(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (isMounted.current && cropOperation.current === operation) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted.current && cropOperation.current === operation) {
        setIsCropping(false);
      }
    }
  }, [croppedAreaPixels, image, onCropComplete]);

  const handleCancel = useCallback(() => {
    cropOperation.current += 1;
    onCancel?.();
  }, [onCancel]);

  return (
    <Flex
      {...rnx({ component: "ImageCropper" })}
      direction="col"
      gap="md"
      className={cn("rnx-image-cropper w-full", className)}
    >
      <Box
        role="region"
        aria-label="Image crop area"
        className="rnx-image-cropper-canvas relative h-80 w-full overflow-hidden sm:h-96"
      >
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
        />
      </Box>
      <Flex align="center" gap="md" className="rnx-image-cropper-controls px-2">
        <Text variant="body-sm" color="secondary" className="w-12">
          Zoom
        </Text>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-label="Zoom level"
          onValueChange={(val) => setZoom(val)}
          className="flex-1"
        />
      </Flex>
      <Flex justify="end" gap="sm" className="rnx-image-cropper-actions mt-2">
        {onCancel && (
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} isLoading={isCropping}>
          Crop Image
        </Button>
      </Flex>
    </Flex>
  );
}

// Utility to extract the image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid CORS issues
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

const DEFAULT_FLIP = { horizontal: false, vertical: false };

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = DEFAULT_FLIP,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "";
  }

  // set canvas size to match the bounding box
  canvas.width = image.width;
  canvas.height = image.height;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(image.width / 2, image.height / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return "";
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // As Base64 string
  return croppedCanvas.toDataURL("image/jpeg");
}
