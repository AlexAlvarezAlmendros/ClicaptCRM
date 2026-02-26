import { forwardRef } from "react";
import { Spinner } from "./Spinner";

export const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",  // primary | secondary | ghost | danger | link
    size = "md",           // sm | md | lg
    iconOnly = false,
    isLoading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = "",
    disabled,
    ...props
  },
  ref
) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    iconOnly && "btn--icon",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size === "sm" ? 14 : 18} />
      ) : (
        <>
          {LeftIcon && <LeftIcon size={size === "sm" ? 14 : 18} />}
          {children}
          {RightIcon && <RightIcon size={size === "sm" ? 14 : 18} />}
        </>
      )}
    </button>
  );
});
