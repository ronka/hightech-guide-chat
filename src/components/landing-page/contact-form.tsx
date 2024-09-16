"use client";

import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/services/utils";
import { CheckCircleIcon } from "lucide-react";

interface FormLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean;
}

function FormLabel({
  required,
  children,
  className,
  ...props
}: FormLabelProps) {
  return (
    <Label className={cn("flex items-center gap-1", className)} {...props}>
      {children}
      {required && <span className="text-red-500">*</span>}
    </Label>
  );
}

function ContactForm() {
  const [state, handleSubmit] = useForm("xjkbdzgv");

  return (
    <div className="container px-4 md:px-6">
      <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 sm:text-4xl md:text-5xl">
        צור קשר 📲
      </h2>
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          {state.succeeded ? (
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">תודה על פנייתך!</h3>
              <p className="text-center text-muted-foreground">
                קיבלתי את ההודעה ואני אחזור אליך בהקדם האפשרי 😁
              </p>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <FormLabel htmlFor="name" required>
                    שם מלא
                  </FormLabel>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="הייטקיסט מתחיל"
                    required
                  />
                  <ValidationError
                    prefix="Name"
                    field="name"
                    errors={state.errors}
                  />
                </div>
                <div className="space-y-4">
                  <FormLabel htmlFor="email" required>
                    כתובת מייל
                  </FormLabel>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder="hightech@guide.co.il"
                  />
                  <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                  />
                </div>
                <div className="space-y-4">
                  <FormLabel htmlFor="message" required>
                    הודעה
                  </FormLabel>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="מה תרצה להגיד?"
                    required
                  />
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={state.errors}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button type="submit" disabled={state.submitting}>
                  {state.submitting ? "שולח..." : "שלח"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export { ContactForm };
