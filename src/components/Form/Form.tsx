"use client";
import { Box } from "../../atoms/Box";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { cn } from "../../utils/cn";
import { Label } from "../Label/Label";
import { Text } from "../../atoms/Text";

import "./Form.css";

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext.name) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    hasDescription: itemContext.hasDescription,
    hasMessage: itemContext.hasMessage,
    registerDescription: itemContext.registerDescription,
    registerMessage: itemContext.registerMessage,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
  hasDescription: boolean;
  hasMessage: boolean;
  registerDescription: () => () => void;
  registerMessage: () => () => void;
};

const FormItemContext = React.createContext<FormItemContextValue>({
  id: "",
  hasDescription: false,
  hasMessage: false,
  registerDescription: () => () => {},
  registerMessage: () => () => {},
});

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();
  const [hasDescription, setHasDescription] = React.useState(false);
  const [hasMessage, setHasMessage] = React.useState(false);
  const registerDescription = React.useCallback(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, []);
  const registerMessage = React.useCallback(() => {
    setHasMessage(true);
    return () => setHasMessage(false);
  }, []);

  return (
    <FormItemContext.Provider
      value={{
        id,
        hasDescription,
        hasMessage,
        registerDescription,
        registerMessage,
      }}
    >
      <Box ref={ref} className={cn("rnx-form-item", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "Form.Item";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        "rnx-form-label",
        error && "rnx-form-label--error",
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "Form.Label";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ "aria-describedby": ariaDescribedBy, ...props }, ref) => {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
    hasDescription,
    hasMessage,
  } = useFormField();
  const describedBy = [
    hasDescription ? formDescriptionId : undefined,
    error && hasMessage ? formMessageId : undefined,
    ariaDescribedBy,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={describedBy || undefined}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "Form.Control";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">
>(({ className, ...props }, ref) => {
  const { formDescriptionId, registerDescription } = useFormField();

  React.useEffect(() => registerDescription(), [registerDescription]);

  return (
    <Text
      as="p"
      variant="body"
      ref={ref}
      id={formDescriptionId}
      className={cn("rnx-form-description", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "Form.Description";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId, registerMessage } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  React.useEffect(() => {
    if (!body) return;
    return registerMessage();
  }, [body, registerMessage]);

  if (!body) {
    return null;
  }

  return (
    <Text
      as="p"
      variant="body"
      ref={ref}
      id={formMessageId}
      aria-live={error ? "polite" : undefined}
      className={cn("rnx-form-message", className)}
      {...props}
    >
      {body}
    </Text>
  );
});
FormMessage.displayName = "Form.Message";

const Form = Object.assign(FormProvider, {
  Item: FormItem,
  Label: FormLabel,
  Control: FormControl,
  Description: FormDescription,
  Message: FormMessage,
  Field: FormField,
});

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
