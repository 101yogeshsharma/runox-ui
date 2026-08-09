import React from "react";

export type PolymorphicProps<
  C extends React.ElementType,
  Props = {},
> = React.PropsWithChildren<
  Props & {
    as?: C;
  }
> &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props | "as">;

export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

export type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = {},
> = PolymorphicProps<C, Props> & { ref?: PolymorphicRef<C> };
