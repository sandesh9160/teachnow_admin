
"use client";

import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { validators } from "@/lib/validations";
import { AlertCircle } from "lucide-react";

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationType?: "letters" | "numbers" | "alphaNumeric";
  minWords?: number;
  maxWords?: number;
  label?: string;
  error?: string;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ validationType, minWords, maxWords, label, error: externalError, className, onChange, onBlur, value, ...props }, ref) => {
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (externalError) {
            setError(externalError);
        }
    }, [externalError]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      if (validationType === "letters") {
        val = validators.sanitizeLetters(val);
      } else if (validationType === "numbers") {
        val = validators.sanitizeNumbers(val);
      }

      // Create a fake event to pass to the original onChange
      const event = {
        ...e,
        target: {
          ...e.target,
          value: val,
          name: e.target.name
        }
      } as React.ChangeEvent<HTMLInputElement>;

      if (onChange) {
        onChange(event);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      const val = e.target.value;
      let newError: string | null = null;

      if (minWords && !validators.minWords(val, minWords)) {
        newError = `Minimum ${minWords} words required`;
      } else if (maxWords && !validators.maxWords(val, maxWords)) {
        newError = `Maximum ${maxWords} words allowed`;
      }

      setError(newError);
      if (onBlur) onBlur(e);
    };

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="block text-[10px] font-bold text-indigo-400 ml-0.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            suppressHydrationWarning
            className={clsx(
              "w-full px-3 py-2 bg-white border rounded-xl text-[12px] font-semibold transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5",
              error && touched ? "border-rose-300 focus:border-rose-400" : "border-slate-100 focus:border-indigo-200",
              className
            )}
            {...props}
          />
          {error && touched && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500">
              <AlertCircle size={14} />
            </div>
          )}
        </div>
        {error && touched && (
          <p className="text-[9px] font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200 uppercase tracking-tighter">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";

// Also a ValidatedTextArea
interface ValidatedTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    minWords?: number;
    maxWords?: number;
    label?: string;
    error?: string;
}

export const ValidatedTextArea = React.forwardRef<HTMLTextAreaElement, ValidatedTextAreaProps>(
    ({ minWords, maxWords, label, error: externalError, className, onChange, onBlur, value, ...props }, ref) => {
      const [error, setError] = useState<string | null>(null);
      const [touched, setTouched] = useState(false);
      const [wordCount, setWordCount] = useState(0);
  
      useEffect(() => {
          if (externalError) {
              setError(externalError);
          }
      }, [externalError]);

      useEffect(() => {
          if (value) {
              setWordCount(validators.getWordCount(String(value)));
          }
      }, [value]);
  
      const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setTouched(true);
        const val = e.target.value;
        let newError: string | null = null;
  
        if (minWords && !validators.minWords(val, minWords)) {
          newError = `Minimum ${minWords} words required`;
        } else if (maxWords && !validators.maxWords(val, maxWords)) {
          newError = `Maximum ${maxWords} words allowed`;
        }
  
        setError(newError);
        if (onBlur) onBlur(e);
      };
  
      return (
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between ml-0.5">
            {label && (
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {label}
                </label>
            )}
            {(minWords || maxWords) && (
                <span className={clsx("text-[9px] font-bold uppercase", error ? "text-rose-400" : "text-slate-300")}>
                    {wordCount} {maxWords ? `/ ${maxWords}` : ""} words
                </span>
            )}
          </div>
          <div className="relative">
            <textarea
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={handleBlur}
              className={clsx(
                "w-full px-3 py-2 bg-white border rounded-2xl text-[12px] font-semibold transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5",
                error && touched ? "border-rose-300 focus:border-rose-400" : "border-slate-100 focus:border-indigo-200",
                className
              )}
              {...props}
            />
          </div>
          {error && touched && (
            <p className="text-[9px] font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200 uppercase tracking-tighter">
              {error}
            </p>
          )}
        </div>
      );
    }
  );
  
  ValidatedTextArea.displayName = "ValidatedTextArea";
