"use client";

import { useState, useEffect } from "react";
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
  User,
  Phone,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scheduleInspection } from "@/action/inspection";

// Validation schema
const inspectionSchema = z.object({
  date: z.date({
    required_error: "Please select a date for your inspection",
  }),
  time: z.string().min(1, "Please select a time slot"),
  contactMethod: z.enum(["phone", "email"], {
    required_error: "Please select a contact method",
  }),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.contactMethod === "phone") {
    return data.phone && data.phone.length > 0;
  } else {
    return data.email && data.email.length > 0;
  }
}, {
  message: "Please provide your contact information",
  path: ["contactMethod"]
});

export function InspectionForm({ vehicle }) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [inspectionDetails, setInspectionDetails] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);

  // Available time slots
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm({
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
iewMode="list"

  // Watch form values
  const watchedDate = watch("date");
  const contactMethod = watch("contactMethod");

  // API hook for scheduling inspection
  const {
    loading: scheduling,
    fn: scheduleInspectionFn,
    data: scheduleResult,
    error: scheduleError,
  } = useFetch(scheduleInspection);

  // Handle successful scheduling
  useEffect(() => {
    if (scheduleResult?.success) {
      const ins = scheduleResult.data;
      setInspectionDetails({
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        date: format(new Date(ins.date), "EEEE, MMMM d, yyyy"),
        time: ins.time || "10:00 AM",
        notes: ins.notes,
        inspectionId: ins.id,
        contact: contactMethod === "phone" ? ins.phone : ins.email,
      });
      setShowConfirmation(true);
      reset();
    }
  }, [scheduleResult, reset, vehicle, contactMethod]);

  // Handle errors
  useEffect(() => {
    if (scheduleError) {
      toast.error(scheduleError.message || "Failed to schedule inspection");
    }
  }, [scheduleError]);

  // Submit handler
  const onSubmit = async (data) => {
    await scheduleInspectionFn({
      vehicleId: vehicle.id,
      date: data.date,
      time: data.time,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
    });
  };

  // Close confirmation handler
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    router.push(`/vehicles/${vehicle.id}`);
  };

  // Go back to vehicle details
  const handleGoBack = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  // Navigate to next step
  const nextStep = async () => {
    if (currentStep === 1) {
      const isStepValid = await trigger(["date", "time"]);
      if (isStepValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const isStepValid = await trigger(["contactMethod", "phone", "email"]);
      if (isStepValid) setCurrentStep(3);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className="flex items-center gap-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Vehicle
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 ml-4">
              Schedule Inspection
            </h1>
          </div>
          
          <Badge variant="outline" className="px-3 py-1 text-sm bg-white/80 backdrop-blur-sm">
            <Shield className="h-4 w-4 mr-1 text-blue-600" />
            Secure Booking
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 px-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vehicle Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="shadow-lg border-0 overflow-hidden sticky top-6">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Details
                </CardTitle>
                <CardDescription className="text-blue-100">
                  You're scheduling an inspection for:
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-video rounded-lg overflow-hidden relative mb-4 border shadow-sm">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={vehicle.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">
                      <Car className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className="text-sm text-gray-600 mb-3">
                  VIN: {vehicle.vin || "Not provided"}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">Price:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₦{vehicle.price.toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Inspection Details</p>
                      <p className="text-xs text-blue-600">
                        Our comprehensive inspection includes checks on engine, brakes, suspension, 
                        electrical systems, and more. Typically takes 45-60 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inspection Form */}
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
                  {/* Step 1: Date & Time Selection */}
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
                                    className={cn(
                                      "w-full justify-start text-left font-normal h-12 text-base pl-3 pr-4 border-2",
                                      !field.value && "text-muted-foreground",
                                      errors.date && "border-red-300"
                                    )}
                                    id="date"
                                  >
                                    <CalendarIcon className="mr-3 h-5 w-5" />
                                    {field.value
                                      ? format(field.value, "EEEE, MMMM d, yyyy")
                                      : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      field.onChange(date);
                                      setSelectedDate(date);
                                      setValue("time", "");
                                    }}
                                    disabled={(day) => day <= new Date() || day.getDay() === 0}
                                    initialFocus
                                    className="rounded-md border p-3"
                                  />
                                </PopoverContent>
                              </Popover>
                              {errors.date && (
                                <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1">
                                  <X className="h-4 w-4" />
                                  {errors.date.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </div>

                      {/* Time Slot Selection */}
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
                                    className={cn(
                                      "h-14 flex-col items-center justify-center gap-1 p-2",
                                      field.value === time 
                                        ? "bg-blue-600 hover:bg-blue-700 border-blue-700" 
                                        : "border-2 hover:bg-blue-50"
                                    )}
                                    onClick={() => field.onChange(time)}
                                  >
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs font-medium">{time}</span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          />
                          {errors.time && (
                            <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1">
                              <X className="h-4 w-4" />
                              {errors.time.message}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Location Information */}
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Inspection Location</h4>
                            <p className="text-sm text-gray-700">
                              123 Auto Inspection Center, Victoria Island, Lagos
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Free parking available at the rear of the building
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact Information */}
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
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              <div>
                                <RadioGroupItem value="phone" id="phone" className="peer sr-only" />
                                <Label
                                  htmlFor="phone"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                                >
                                  <Phone className="mb-3 h-6 w-6" />
                                  Phone
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="email" id="email" className="peer sr-only" />
                                <Label
                                  htmlFor="email"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                                >
                                  <Mail className="mb-3 h-6 w-6" />
                                  Email
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                        {errors.contactMethod && (
                          <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1">
                            <X className="h-4 w-4" />
                            {errors.contactMethod.message}
                          </p>
                        )}
                      </div>

                      {contactMethod === "phone" ? (
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-base flex items-center gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                            Phone Number
                          </Label>
                          <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                  {...field}
                                  type="tel"
                                  placeholder="Enter your phone number"
                                  className="pl-10 h-12 text-base"
                                  id="phone"
                                />
                              </div>
                            )}
                          />
                          {errors.phone && (
                            <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1">
                              <X className="h-4 w-4" />
                              {errors.phone.message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-base flex items-center gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                            Email Address
                          </Label>
                          <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="Enter your email address"
                                  className="pl-10 h-12 text-base"
                                  id="email"
                                />
                              </div>
                            )}
                          />
                          {errors.email && (
                            <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1">
                              <X className="h-4 w-4" />
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Additional Notes */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-base flex items-center gap-2">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                          Additional Notes (Optional)
                        </Label>
                        <Controller
                          name="notes"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              placeholder="Any specific requests or concerns? Let us know how we can help..."
                              className="min-h-32 resize-none text-base p-4"
                              id="notes"
                            />
                          )}
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          What to expect during your inspection
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                          <li>Comprehensive vehicle health check</li>
                          <li>Test drive with our certified inspector</li>
                          <li>Detailed inspection report</li>
                          <li>Professional recommendations</li>
                          <li>Approximately 45-60 minutes duration</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className={cn(currentStep === 1 ? "invisible" : "")}
                    >
                      Previous
                    </Button>
                    
                    {currentStep < 3 ? (
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="flex items-center gap-2"
                      >
                        Next Step
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="w-full sm:w-auto"
                        disabled={scheduling}
                        size="lg"
                      >
                        {scheduling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Scheduling Inspection...
                          </>
                        ) : (
                          "Confirm Inspection Appointment"
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">Inspection Scheduled Successfully!</DialogTitle>
            <DialogDescription className="text-base">
              Your inspection has been confirmed. We've sent the details to your {contactMethod === "phone" ? "phone" : "email"}.
            </DialogDescription>
          </DialogHeader>

          {inspectionDetails && (
            <div className="py-4">
              <Card className="border-0 bg-gray-50">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Vehicle:</span>
                      <span className="font-semibold text-right">{inspectionDetails.vehicle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="font-semibold">{inspectionDetails.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Time:</span>
                      <Badge variant="outline" className="font-semibold bg-blue-50">
                        <Clock className="h-3 w-3 mr-1" />
                        {inspectionDetails.time}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Contact:</span>
                      <span className="font-semibold">{inspectionDetails.contact}</span>
                    </div>
                    {inspectionDetails.notes && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <span className="text-right max-w-xs text-sm">{inspectionDetails.notes}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Reference ID:</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {inspectionDetails.inspectionId}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm text-blue-700 border border-blue-200">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  What to bring to your inspection:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vehicle registration documents</li>
                  <li>Valid ID card</li>
                  <li>Insurance documents (if available)</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              className="w-full sm:w-1/2 order-2 sm:order-1"
            >
              Close
            </Button>
            <Button 
              onClick={handleCloseConfirmation}
              className="w-full sm:w-1/2 order-1 sm:order-2"
            >
              View Vehicle Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}