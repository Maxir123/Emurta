"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  Car,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Clock,
  MapPin,
  Info,
  X,
  ChevronRight,
  Shield,
  Phone,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scheduleInspection } from "@/action/inspection";

const inspectionSchema = z.object({
  date: z.date({ required_error: "Please select a date for your inspection" }),
  time: z.string().min(1, "Please select a time slot"),
  contactMethod: z.enum(["phone", "email"]),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.contactMethod === "phone") return !!data.phone;
  return !!data.email;
}, { message: "Please provide your contact information", path: ["contactMethod"] });

export function InspectionForm({ vehicle }) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [inspectionDetails, setInspectionDetails] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const timeSlots = ["9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM","4:00 PM"];

  const { control, handleSubmit, formState: { errors }, reset, watch, setValue, trigger } = useForm({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      date: undefined,
      time: "",
      contactMethod: "phone",
      phone: "",
      email: "",
      notes: "",
    },
  });

  const watchedDate = watch("date");
  const contactMethod = watch("contactMethod");

  const {
    loading: scheduling,
    fn: scheduleInspectionFn,
    data: scheduleResult,
    error: scheduleError,
  } = useFetch(scheduleInspection);

  useEffect(() => {
    if (scheduleResult?.success) {
      const ins = scheduleResult.data;
      setInspectionDetails({
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        date: format(new Date(ins.date), "EEEE, MMMM d, yyyy"),
        time: format(new Date(ins.date), "hh:mm a"),
        notes: ins.notes,
        inspectionId: ins.id,
        contact: contactMethod === "phone" ? ins.phone : ins.email,
      });
      setShowConfirmation(true);
      reset();
    }
  }, [scheduleResult, reset, vehicle, contactMethod]);

  useEffect(() => {
    if (scheduleError) {
      toast.error(scheduleError.message || "Failed to schedule inspection");
    }
  }, [scheduleError]);

  // Combine date + time into a Date object string (ISO) and call action
  const onSubmit = async (data) => {
    // combine date + time
    const baseDate = data.date instanceof Date ? data.date : new Date(data.date);
    if (isNaN(baseDate.getTime())) {
      toast.error("Invalid date");
      return;
    }

    // parse time like "9:00 AM"
    const tm = data.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    let hours = 0, minutes = 0;
    if (tm) {
      hours = Number(tm[1]);
      minutes = Number(tm[2]);
      const ampm = (tm[3] || "").toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }

    const combined = new Date(baseDate);
    combined.setHours(hours, minutes, 0, 0);

    await scheduleInspectionFn({
      vehicleId: vehicle.id,
      date: combined.toISOString(), // server expects date (ISO or Date)
      notes: data.notes,
    });
  };

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));
  const nextStep = async () => {
    if (currentStep === 1) {
      const ok = await trigger(["date","time"]);
      if (ok) setCurrentStep(2);
    } else if (currentStep === 2) {
      const ok = await trigger(["contactMethod","phone","email"]);
      if (ok) setCurrentStep(3);
    }
  };

  const handleGoBack = () => router.push(`/vehicles/${vehicle.id}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleGoBack} className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
              Back to Vehicle
            </Button>
            <h1 className="text-2xl font-bold">Schedule Inspection</h1>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm bg-white/80">
            <Shield className="h-4 w-4 mr-1 text-blue-600" />
            Secure Booking
          </Badge>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="shadow-lg border-0 overflow-hidden sticky top-6">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Details
                </CardTitle>
                <CardDescription className="text-blue-100">You're scheduling an inspection for:</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-video rounded-lg overflow-hidden relative mb-4 border shadow-sm">
                  {vehicle.image ? (
                    <img src={vehicle.image} alt={vehicle.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">
                      <Car className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-1">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                <div className="text-sm text-gray-600 mb-3">VIN: {vehicle.vin || "Not provided"}</div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">Price:</span>
                  <span className="text-xl font-bold text-blue-600">₦{Number(vehicle.price).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="border-b bg-white">
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  Schedule Your Inspection
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Choose a convenient time for your vehicle inspection"}
                  {currentStep === 2 && "How would you like us to contact you?"}
                  {currentStep === 3 && "Any special requests or notes for our inspectors?"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-base flex items-center gap-2">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                          Select Inspection Date
                        </Label>
                        <Controller
                          name="date"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn("w-full justify-start text-left font-normal h-12 text-base pl-3 pr-4 border-2", !field.value && "text-muted-foreground", errors.date && "border-red-300")}
                                    id="date"
                                  >
                                    <CalendarIcon className="mr-3 h-5 w-5" />
                                    {field.value ? format(field.value, "EEEE, MMMM d, yyyy") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      field.onChange(date);
                                      setValue("time", ""); // reset time when date changes
                                    }}
                                    disabled={(day) => day <= new Date() || day.getDay() === 0}
                                    initialFocus
                                    className="rounded-md border p-3"
                                  />
                                </PopoverContent>
                              </Popover>
                              {errors.date && <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1"><X className="h-4 w-4" />{errors.date.message}</p>}
                            </div>
                          )}
                        />
                      </div>

                      {watchedDate && (
                        <div className="space-y-2">
                          <Label htmlFor="time" className="text-base flex items-center gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                            Available Time Slots
                          </Label>
                          <Controller
                            name="time"
                            control={control}
                            render={({ field }) => (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {timeSlots.map((time) => (
                                  <Button
                                    key={time}
                                    type="button"
                                    variant={field.value === time ? "default" : "outline"}
                                    className={cn("h-14 flex-col items-center justify-center gap-1 p-2", field.value === time ? "bg-blue-600 hover:bg-blue-700 border-blue-700" : "border-2 hover:bg-blue-50")}
                                    onClick={() => field.onChange(time)}
                                  >
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs font-medium">{time}</span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          />
                          {errors.time && <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1"><X className="h-4 w-4" />{errors.time.message}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-base flex items-center gap-2">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                          Preferred Contact Method
                        </Label>
                        <Controller
                          name="contactMethod"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                              <div>
                                <RadioGroupItem value="phone" id="phone" className="peer sr-only" />
                                <Label htmlFor="phone" className="flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 hover:bg-accent peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600">
                                  <Phone className="mb-3 h-6 w-6" /> Phone
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="email" id="email" className="peer sr-only" />
                                <Label htmlFor="email" className="flex flex-col items-center justify-between rounded-md border-2 bg-white p-4 hover:bg-accent peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600">
                                  <Mail className="mb-3 h-6 w-6" /> Email
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                        {errors.contactMethod && <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1"><X className="h-4 w-4" />{errors.contactMethod.message}</p>}
                      </div>

                      {contactMethod === "phone" ? (
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-base flex items-center gap-2"><span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span> Phone Number</Label>
                          <Controller name="phone" control={control} render={({ field }) => <Input {...field} type="tel" placeholder="Enter your phone number" className="h-12" />} />
                          {errors.phone && <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1"><X className="h-4 w-4" />{errors.phone.message}</p>}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-base flex items-center gap-2"><span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span> Email Address</Label>
                          <Controller name="email" control={control} render={({ field }) => <Input {...field} type="email" placeholder="Enter your email address" className="h-12" />} />
                          {errors.email && <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1"><X className="h-4 w-4" />{errors.email.message}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-base flex items-center gap-2"><span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span> Additional Notes (Optional)</Label>
                        <Controller name="notes" control={control} render={({ field }) => <Textarea {...field} placeholder="Any specific requests or concerns?" className="min-h-32" />} />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border">
                        <h4 className="font-medium mb-2 flex items-center gap-2"><Info className="h-5 w-5 text-blue-600" /> What to expect during your inspection</h4>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                          <li>Comprehensive vehicle health check</li>
                          <li>Test drive with our certified inspector</li>
                          <li>Detailed inspection report</li>
                          <li>Approximately 45-60 minutes duration</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className={cn(currentStep === 1 ? "invisible" : "")}>Previous</Button>

                    {currentStep < 3 ? (
                      <Button type="button" onClick={nextStep} className="flex items-center gap-2">Next Step <ChevronRight className="h-4 w-4" /></Button>
                    ) : (
                      <Button type="submit" className="w-full sm:w-auto" disabled={scheduling} size="lg">
                        {scheduling ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scheduling Inspection...</>) : "Confirm Inspection Appointment"}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"><CheckCircle2 className="h-10 w-10 text-green-600" /></div>
            <DialogTitle className="text-2xl">Inspection Scheduled Successfully!</DialogTitle>
            <div className="text-base">Your inspection has been confirmed. We've sent the details to your {contactMethod === "phone" ? "phone" : "email"}.</div>
          </DialogHeader>

          {inspectionDetails && (
            <div className="py-4">
              <Card className="border-0 bg-gray-50">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><span className="font-medium text-gray-700">Vehicle:</span><span className="font-semibold">{inspectionDetails.vehicle}</span></div>
                    <div className="flex justify-between items-center"><span className="font-medium text-gray-700">Date:</span><span className="font-semibold">{inspectionDetails.date}</span></div>
                    <div className="flex justify-between items-center"><span className="font-medium text-gray-700">Time:</span><Badge variant="outline" className="font-semibold bg-blue-50"><Clock className="h-3 w-3 mr-1" />{inspectionDetails.time}</Badge></div>
                    <div className="flex justify-between items-center"><span className="font-medium text-gray-700">Contact:</span><span className="font-semibold">{inspectionDetails.contact}</span></div>
                    <div className="flex justify-between items-center"><span className="font-medium text-gray-700">Reference ID:</span><Badge variant="secondary" className="font-mono text-xs">{inspectionDetails.inspectionId}</Badge></div>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm text-blue-700 border border-blue-200">
                <div className="font-semibold mb-2 flex items-center gap-2"><Info className="h-4 w-4" />What to bring to your inspection:</div>
                <ul className="list-disc list-inside space-y-1"><li>Vehicle registration</li><li>Valid ID</li><li>Insurance docs (if available)</li></ul>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} className="w-full sm:w-1/2 order-2 sm:order-1">Close</Button>
            <Button onClick={() => { setShowConfirmation(false); router.push(`/vehicles/${vehicle.id}`); }} className="w-full sm:w-1/2 order-1 sm:order-2">View Vehicle Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InspectionForm;
