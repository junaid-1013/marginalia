"use client";
// TODO: see why the status is not working and the logic is repeating

import * as React from "react";
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

// Input and Password Input
export interface BaseInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

interface IStatus {
  status?: "success" | "error" | "warning" | "default";
}

interface InputProps extends BaseInputProps, IStatus {
  className?: string;
  wrapperClassName?: string;
  separator?: boolean;
  suffixIcon?: React.ReactNode;
  suffixIconClassName?: string;
  separatorClassName?: string;
}

const StatusIcon = ({ status }: IStatus) => {
  if (!status) return null;

  let icon;
  switch (status) {
    case "success":
      icon = <CheckCircle size={16} />;
      break;
    case "error":
      icon = <XCircle size={16} />;
      break;
    case "warning":
      icon = <AlertCircle size={16} />;
      break;
    default:
      return null;
  }

  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 right-0 items-center pr-3  pointer-events-none flex",
        status === "success" && "!text-success",
        status === "error" && "!text-destructive",
        status === "warning" && "!text-highlight-ink"
      )}
    >
      {icon}
    </div>
  );
};
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      type,
      suffixIcon,
      suffixIconClassName,
      separatorClassName,
      status,
      separator = true,
      ...props
    },
    ref
  ) => {
    const [isFocus, setIsFocus] = React.useState(false);

    return (
      <div className={cn("shadcn-input relative group", wrapperClassName)}>
        {suffixIcon && (
          <div
            className={cn(
              "absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none space-x-3 transition-all duration-200 ease-in-out",
              isFocus && "text-primary",
              status === "success" && "!text-success",
              status === "error" && "!text-destructive",
              status === "warning" && "!text-highlight-ink",
              suffixIconClassName
            )}
          >
            {suffixIcon}
            <div
              className={cn(
                "h-3/5 w-[1px] bg-foreground",
                isFocus && "bg-primary transition-all duration-200 ease-in-out",
                status === "success" && "bg-success",
                status === "error" && "bg-destructive",
                status === "warning" && "bg-highlight",
                separatorClassName,
                !separator && "hidden"
              )}
            />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-sunken px-3 py-2 font-sans text-sm transition-colors duration-150 focus:border-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            suffixIcon && separator && "pl-[53px]",
            suffixIcon && !separator && "pl-10",
            status === "success" && "border-success",
            status === "error" && "border-destructive",
            status === "warning" && "border-highlight",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          {...props}
        />
        {/* postfix for statusIcon */}
        <StatusIcon status={status} />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

interface PasswordInputProps extends InputProps {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative group">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
