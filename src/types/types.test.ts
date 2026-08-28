import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  BoxProps,
  TextProps,
  FlexProps,
  GridProps,
  ContainerProps,
  ButtonProps,
  InputProps,
  ModalProps,
  DrawerProps,
  PopoverProps,
  SelectProps,
  DropdownProps,
  TableProps,
  ColumnDef,
  DataTableInstance,
  ToastMessage,
  ToastVariant,
  ToastPosition,
  KanbanProps,
  VirtualListProps,
  ColorPickerProps,
  SignaturePadProps,
  FileUploaderProps,
  FadeInProps,
  ScaleInProps,
  SlideInProps,
  ZoomInProps,
  FlipInProps,
  BounceInProps,
  RotateInProps,
  MakeWayContextType,
  UseControllableStateParams,
  FloatingPosition,
  UseDisclosureProps,
  RnxColor,
  RnxVariant,
  RnxSize,
  ThemeConfig,
  Theme,
  RunoxTheme,
  RnxAttributesOptions,
} from "./index";

describe("@runox/ui/types", () => {
  it("exports all component props and design system token types", () => {
    // Assert types are well-defined
    expectTypeOf<BoxProps>().toBeObject();
    expectTypeOf<TextProps>().toBeObject();
    expectTypeOf<FlexProps>().toBeObject();
    expectTypeOf<GridProps>().toBeObject();
    expectTypeOf<ContainerProps>().toBeObject();
    expectTypeOf<ButtonProps>().toBeObject();
    expectTypeOf<InputProps>().toBeObject();
    expectTypeOf<ModalProps>().toBeObject();
    expectTypeOf<DrawerProps>().toBeObject();
    expectTypeOf<PopoverProps>().toBeObject();
    expectTypeOf<SelectProps>().toBeObject();
    expectTypeOf<DropdownProps>().toBeObject();
    expectTypeOf<TableProps>().toBeObject();
    expectTypeOf<ColumnDef<unknown>>().toBeObject();
    expectTypeOf<DataTableInstance<unknown>>().toBeObject();
    expectTypeOf<ToastMessage>().toBeObject();
    expectTypeOf<ToastVariant>().toBeString();
    expectTypeOf<ToastPosition>().toBeString();
    expectTypeOf<KanbanProps>().toBeObject();
    expectTypeOf<VirtualListProps<unknown>>().toBeObject();
    expectTypeOf<ColorPickerProps>().toBeObject();
    expectTypeOf<SignaturePadProps>().toBeObject();
    expectTypeOf<FileUploaderProps>().toBeObject();
    expectTypeOf<FadeInProps>().toBeObject();
    expectTypeOf<ScaleInProps>().toBeObject();
    expectTypeOf<SlideInProps>().toBeObject();
    expectTypeOf<ZoomInProps>().toBeObject();
    expectTypeOf<FlipInProps>().toBeObject();
    expectTypeOf<BounceInProps>().toBeObject();
    expectTypeOf<RotateInProps>().toBeObject();
    expectTypeOf<MakeWayContextType>().toBeObject();
    expectTypeOf<UseControllableStateParams<unknown>>().toBeObject();
    expectTypeOf<FloatingPosition>().toBeObject();
    expectTypeOf<UseDisclosureProps>().toBeObject();
    expectTypeOf<RnxColor>().toBeString();
    expectTypeOf<RnxVariant>().toBeString();
    expectTypeOf<RnxSize>().toBeString();
    expectTypeOf<ThemeConfig>().toBeObject();
    expectTypeOf<Theme>().toBeString();
    expectTypeOf<RunoxTheme>().toBeObject();
    expectTypeOf<RnxAttributesOptions>().toBeObject();

    const color: RnxColor = "primary";
    const variant: RnxVariant = "glass";
    const size: RnxSize = "md";
    const theme: Theme = "dark";

    const userColumn: ColumnDef<{ id: string; name: string }> = {
      accessorKey: "name",
      header: "Name",
    };

    expect(color).toBe("primary");
    expect(variant).toBe("glass");
    expect(size).toBe("md");
    expect(theme).toBe("dark");
    expect(userColumn.accessorKey).toBe("name");
  });
});
