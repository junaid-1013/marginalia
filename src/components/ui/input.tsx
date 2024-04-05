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
        status === "success" && "!text-green-500",
        status === "error" && "!text-destructive",
        status === "warning" && "!text-yellow-500"
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
              status === "success" && "!text-green-500",
              status === "error" && "!text-destructive",
              status === "warning" && "!text-yellow-500",
              suffixIconClassName
            )}
          >
            {suffixIcon}
            <div
              className={cn(
                "h-3/5 w-[1px] bg-foreground",
                isFocus && "bg-primary transition-all duration-200 ease-in-out",
                status === "success" && "bg-green-500",
                status === "error" && "bg-destructive",
                status === "warning" && "bg-yellow-500",
                separatorClassName,
                !separator && "hidden"
              )}
            />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10  w-full rounded-md border border-input focus:border-primary bg-background p-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            suffixIcon && separator && "pl-[53px]",
            suffixIcon && !separator && "pl-10",
            status === "success" && "border-green-500",
            status === "error" && "border-destructive",
            status === "warning" && "border-yellow-500",
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
          className="absolute top-1/2 -translate-y-1/2 right-3 items-center z-10 cursor-pointer flex"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
