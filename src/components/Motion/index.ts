import { FadeIn } from "./FadeIn";
import { ScaleIn } from "./ScaleIn";
import { SlideIn } from "./SlideIn";
import { ZoomIn } from "./ZoomIn";
import { FlipIn } from "./FlipIn";
import { BounceIn } from "./BounceIn";
import { RotateIn } from "./RotateIn";
import { Shake } from "./Shake";
import { Reveal } from "./Reveal";
import { StaggerContainer, StaggerItem } from "./Stagger";
import { MakeWayProvider, useMakeWay } from "./MakeWayContext";

export { MakeWayProvider, useMakeWay };

export const Motion = {
  FadeIn,
  ScaleIn,
  SlideIn,
  ZoomIn,
  FlipIn,
  BounceIn,
  RotateIn,
  Shake,
  Reveal,
  Stagger: StaggerContainer,
  StaggerItem,
  MakeWayProvider,
  useMakeWay,
};
