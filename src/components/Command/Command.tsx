"use client";
import { Box } from "../../atoms/Box";

import React, { forwardRef } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";
import { Modal } from "../Modal";
import "./Command.css";

const CommandRoot = forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    {...rnx({ component: "Command" })}
    className={cn("rnx-command", className)}
    {...props}
  />
));
CommandRoot.displayName = "Command";

interface CommandDialogProps extends React.ComponentPropsWithoutRef<
  typeof Modal
> {}

const CommandDialog = forwardRef<HTMLDivElement, CommandDialogProps>(
  ({ children, ...props }, ref) => {
    return (
      <Modal
        ref={ref}
        hideCloseButton
        className="rnx-command-dialog"
        {...props}
      >
        <Command className="w-full">{children}</Command>
      </Modal>
    );
  },
);
CommandDialog.displayName = "Command.Dialog";

const CommandInput = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <Box className="rnx-command-input-wrapper" cmdk-input-wrapper="">
    <Search className="rnx-command-input-icon" />
    <CommandPrimitive.Input
      ref={ref}
      autoFocus
      className={cn("rnx-command-input", className)}
      {...props}
    />
  </Box>
));
CommandInput.displayName = "Command.Input";

const CommandList = forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("rnx-command-list", className)}
    {...props}
  />
));
CommandList.displayName = "Command.List";

const CommandEmpty = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="rnx-command-empty" {...props} />
));
CommandEmpty.displayName = "Command.Empty";

const CommandGroup = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn("rnx-command-group", className)}
    {...props}
  />
));
CommandGroup.displayName = "Command.Group";

const CommandSeparator = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("rnx-command-separator", className)}
    {...props}
  />
));
CommandSeparator.displayName = "Command.Separator";

const CommandItem = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn("rnx-command-item", className)}
    {...props}
  />
));
CommandItem.displayName = "Command.Item";

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <Box
      as="span"
      className={cn("rnx-command-shortcut", className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = "Command.Shortcut";

export const Command = Object.assign(CommandRoot, {
  Dialog: CommandDialog,
  Input: CommandInput,
  List: CommandList,
  Empty: CommandEmpty,
  Group: CommandGroup,
  Separator: CommandSeparator,
  Item: CommandItem,
  Shortcut: CommandShortcut,
});
