"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Loader2, X, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { addCar, processCarImageWithAI } from "@/action/vehicle";
import useFetch from "@/hooks/use-fetch";
import Image from "next/image";

// Predefined options
const fuelTypes = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "PLUG_IN_HYBRID"];
const transmissions = ["AUTOMATIC", "MANUAL", "SEMI_AUTOMATIC"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];
const VehicleType = [
  "CAR",
  "TRUCK",
  "MOTORCYCLE",
  "BOAT",
  "KEKE",
  "CONSTRUCTION",
  "OTHER"
];
const VehicleCondition = ["NEW", "USED", "FOREIGN_USED", "LOCAL_USED"];

const NigerianState = [
  "ABIA", "ADAMAWA","AKWA_IBOM", "ANAMBRA", "BAUCHI", "BAYELSA","BENUE","BORNO", "CROSS_RIVER",
  "DELTA", "EBONYI", "EDO", "EKITI", "ENUGU", "FCT", "GOMBE", "IMO", "JIGAWA", "KADUNA", "KANO",
  "KATSINA", "KEBBI", "KOGI", "KWARA", "LAGOS", "NASARAWA", "NIGER", "OGUN", "ONDO", "OSUN",
  "OYO", "PLATEAU", "RIVERS", "SOKOTO", "TARABA", "YOBE", "ZAMFARA"
];

// Define form schema with Zod
const carFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().refine((val) => {
    const year = parseInt(val);
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
  }, "Valid year required (1900 - current year + 1)"),
  price: z.string().min(1, "Price is required"),
  mileage: z.string().min(1, "Mileage is required"),
  color: z.string().min(1, "Color is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  seatingCapacity: z.string().optional(),
  Vehicle_owner_Email: z.string().min(1, "Vehicle Owner Email required"),
  Vehicle_owner_Name: z.string().min(1, "Vehicle Owner Name required"),
  Vehicle_owner_Number: z.string().min(1, "Vehicle Owner Number required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
  featured: z.boolean().default(false),

  // ✅ new fields
  condition: z.enum(VehicleCondition, {
    required_error: "Condition is required"
  }),
  location: z.enum(NigerianState, {
    required_error: "Location is required"
  }),

  // extra flags
  isVerified: z.boolean().default(false),
  isForRent: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalPrice: z.string().optional(),
  rentalStatus: z.enum(["RESERVED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),

  type: z.enum([
    "CAR", "TRUCK", "MOTORCYCLE", "BOAT", "KEKE", "CONSTRUCTION", "OTHER"
  ], { required_error: "Vehicle type is required" })
});

export const AddCarForm = () => {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedAiImage, setUploadedAiImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("ai");
  const [imageError, setImageError] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  // Show alert message
  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    
    // Auto-hide after 3 seconds for success/info, longer for errors
    const duration = type === "error" ? 5000 : 3000;
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, duration);
  };

  // Initialize form
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      // inside defaultValues object
      isForRent: false,
      startDate: "",
      endDate: "",
      totalPrice: "",
      rentalStatus: "RESERVED",
      isVerified: false,
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seatingCapacity: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
      type: "CAR",
      Vehicle_owner_Email:"",
      Vehicle_owner_Name: "",
      Vehicle_owner_Number:""
    },
  });

  // Custom hooks for API calls
  const {
    loading: addCarLoading,
    fn: addCarFn,
    data: addCarResult,
  } = useFetch(addCar);

  const {
    loading: processImageLoading,
    fn: processImageFn,
    data: processImageResult,
    error: processImageError,
  } = useFetch(processCarImageWithAI);

  // Handle successful car addition
  useEffect(() => {
    if (addCarResult?.success) {
      showAlert("Car added successfully", "success");
      router.push("/admin/Vehiclex");
      
    }
  }, [addCarResult, router]);

  useEffect(() => {
    if (processImageError) {
      showAlert(processImageError.message || "Failed to process image", "error");
    }
  }, [processImageError]);

  // Handle successful AI processing
  useEffect(() => {
    if (processImageResult?.success) {
      const carDetails = processImageResult.data;

      // Update form with AI results
      setValue("make", carDetails.make);
      setValue("model", carDetails.model);
      setValue("year", carDetails.year.toString());
      setValue("color", carDetails.color);
      setValue("bodyType", carDetails.bodyType);
      setValue("type", carDetails.type);
      setValue("fuelType", carDetails.fuelType);
      setValue("price", carDetails.price);
      setValue("mileage", carDetails.mileage);
      setValue("transmission", carDetails.transmission);
      setValue("description", carDetails.description);

      // Add the image to the uploaded images
      if (uploadedAiImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploadedImages(prev => [...prev, e.target.result]);
          }
        };
        reader.readAsDataURL(uploadedAiImage);
      }

      showAlert(
        `Successfully extracted car details: Detected ${carDetails.year} ${carDetails.make} ${carDetails.model}`,
        "success"
      );

      // Switch to manual tab for review
      setActiveTab("manual");
    }
  }, [processImageResult, setValue, uploadedAiImage]);

  // Process image with AI
  const processWithAI = async () => {
    if (!uploadedAiImage) {
      showAlert("Please upload an image first", "error");
      return;
    }

    await processImageFn(uploadedAiImage);
  };

  // Handle AI image upload
  const onAiDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert("Image size should be less than 5MB", "error");
      return;
    }

    setUploadedAiImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } =
    useDropzone({
      onDrop: onAiDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxFiles: 1,
      multiple: false,
    });

  // Handle multiple image uploads
  const onMultiImagesDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showAlert(`${file.name} exceeds 5MB limit and will be skipped`, "error");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        // Process the images
        const newImages = [];
        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              newImages.push(e.target.result);

              // When all images are processed
              if (newImages.length === validFiles.length) {
                setUploadedImages(prev => [...prev, ...newImages]);
                setUploadProgress(0);
                setImageError("");
                showAlert(`Successfully uploaded ${validFiles.length} images`, "success");
              }
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }, 200);
  }, []);

  const {
    getRootProps: getMultiImageRootProps,
    getInputProps: getMultiImageInputProps,
  } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  // Remove image from upload preview
  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  

const onSubmit = async (data) => {
  if (uploadedImages.length === 0) {
    setImageError("Please upload at least one image");
    showAlert("Please upload at least one image", "error");
    return;
  }

  const carData = {
    ...data,
    year: parseInt(data.year),
    price: parseFloat(data.price),
    mileage: parseInt(data.mileage),
    seatingCapacity: data.seatingCapacity ? parseInt(data.seatingCapacity) : null,
    // ensure booleans are real booleans
    featured: !!data.featured,
    isForRent: !!data.isForRent,
    isVerified: !!data.isVerified,
  };

  // If listing as rental, attach rental-specific fields (parse types)
  if (data.isForRent) {
    if (data.startDate) carData.startDate = data.startDate; // ISO date string ok
    if (data.endDate) carData.endDate = data.endDate;
    if (data.totalPrice) carData.totalPrice = parseFloat(data.totalPrice);
    if (data.rentalStatus) carData.rentalStatus = data.rentalStatus;
  }

  await addCarFn({
    carData,
    images: uploadedImages,
  });
};


  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 mb-12">
      {/* Alert Notification */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300 transform ${
          alert.show ? "translate-x-0" : "translate-x-full"
        } ${
          alert.type === "success" 
            ? "bg-green-500 text-white" 
            : alert.type === "error" 
            ? "bg-red-500 text-white" 
            : "bg-blue-500 text-white"
        }`}>
          <div className="flex items-center">
            {alert.type === "success" && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {alert.type === "error" && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-4 sm:mt-25"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">AI Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>
                Enter the details of the car you want to add.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Make */}
                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      {...register("make")}
                      placeholder="e.g. Toyota"
                      error={errors.make?.message}
                    />
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      {...register("model")}
                      placeholder="e.g. Camry"
                      error={errors.model?.message}
                    />
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      {...register("year")}
                      placeholder="e.g. 2022"
                      error={errors.year?.message}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      {...register("price")}
                      placeholder="e.g. 25000"
                      error={errors.price?.message}
                    />
                  </div>

                  {/* Mileage */}
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage *</Label>
                    <Input
                      id="mileage"
                      {...register("mileage")}
                      placeholder="e.g. 15000"
                      error={errors.mileage?.message}
                    />
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label htmlFor="color">Color *</Label>
                    <Input
                      id="color"
                      {...register("color")}
                      placeholder="e.g. Blue"
                      error={errors.color?.message}
                    />
                  </div>

                  {/* Fuel Type */}
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <Select
                      onValueChange={(value) => setValue("fuelType", value)}
                      defaultValue={getValues("fuelType")}
                    >
                      <SelectTrigger error={errors.fuelType?.message}>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fuelType && (
                      <p className="text-xs text-red-500">
                        {errors.fuelType.message}
                      </p>
                    )}
                  </div>

                  {/* Transmission */}
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission *</Label>
                    <Select
                      onValueChange={(value) => setValue("transmission", value)}
                      defaultValue={getValues("transmission")}
                    >
                      <SelectTrigger error={errors.transmission?.message}>
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Type */}
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Body Type *</Label>
                    <Select
                      onValueChange={(value) => setValue("bodyType", value)}
                      defaultValue={getValues("bodyType")}
                    >
                      <SelectTrigger error={errors.bodyType?.message}>
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Vehicle Type *</Label>
                    <Select
                      onValueChange={(value) => setValue("type", value)}
                      defaultValue={getValues("type")}
                    >
                      <SelectTrigger error={errors.type?.message}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VehicleType.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-xs text-red-500">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                                  {/* Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      onValueChange={(value) => setValue("condition", value)}
                      defaultValue={getValues("condition")}
                    >
                      <SelectTrigger error={errors.condition?.message}>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {VehicleCondition.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition.charAt(0) + condition.slice(1).toLowerCase().replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      onValueChange={(value) => setValue("location", value)}
                      defaultValue={getValues("location")}
                    >
                      <SelectTrigger error={errors.location?.message}>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {NigerianState.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state.charAt(0) + state.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* seatingCapacity */}
                  <div className="space-y-2">
                    <Label htmlFor="seatingCapacity">
                      Number of seatingCapacity <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="seatingCapacity"
                      {...register("seatingCapacity")}
                      placeholder="e.g. 5"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) => setValue("status", value)}
                      defaultValue={getValues("status")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* --- Rent Toggle --- */}
            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox
                id="isForRent"
                checked={watch("isForRent")}
                onCheckedChange={(checked) => {
                  setValue("isForRent", checked);
                }}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="isForRent">List as Rental</Label>
                <p className="text-sm text-muted-foreground">
                  Create a rental entry when this car is added
                </p>
              </div>
            </div>

            {/* --- Rental fields (shown only if isForRent) --- */}
            {watch("isForRent") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Rental Start Date</Label>
                  <Input id="startDate" type="date" {...register("startDate")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Rental End Date</Label>
                  <Input id="endDate" type="date" {...register("endDate")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPrice">Total Rental Price</Label>
                  <Input
                    id="totalPrice"
                    type="number"
                    step="0.01"
                    {...register("totalPrice")}
                    placeholder="e.g. 300.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentalStatus">Rental Status</Label>
                  <Select
                    onValueChange={(value) => setValue("rentalStatus", value)}
                    defaultValue={getValues("rentalStatus")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}


                <div className="space-y-4 rounded-2xl border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">Owner's Information</h3>

                  {/* Vehicle_owner_Name */}
                  <div className="space-y-2">
                    <Label htmlFor="Vehicle_owner_Name">Name *</Label>
                    <Input
                      id="Vehicle_owner_Name"
                      {...register("Vehicle_owner_Name")}
                      placeholder="e.g. John Doe"
                      error={errors.Vehicle_owner_Name?.message}
                    />
                  </div>

                  {/* Vehicle_owner_Number */}
                  <div className="space-y-2">
                    <Label htmlFor="Vehicle_owner_Number">Number *</Label>
                    <Input
                      id="Vehicle_owner_Number"
                      {...register("Vehicle_owner_Number")}
                      placeholder="e.g. +234 800 000 0000"
                      error={errors.Vehicle_owner_Number?.message}
                    />
                  </div>

                  {/* Vehicle_owner_Email */}
                  <div className="space-y-2">
                    <Label htmlFor="Vehicle_owner_Email">Email *</Label>
                    <Input
                      id="Vehicle_owner_Email"
                      {...register("Vehicle_owner_Email")}
                      placeholder="e.g. johndoe@example.com"
                      error={errors.Vehicle_owner_Email?.message}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter detailed description of the car..."
                    className={`min-h-32 ${errors.description ? "border-red-500" : ""}`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Featured */}
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox
                    id="featured"
                    checked={watch("featured")}
                    onCheckedChange={(checked) => {
                      setValue("featured", checked);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="featured">Feature this car</Label>
                    <p className="text-sm text-muted-foreground">
                      Featured cars appear on the homepage
                    </p>
                  </div>
                </div>

                {/* isVerified */}
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox
                    id="isVerified"
                    checked={watch("isVerified")}
                    onCheckedChange={(checked) => {
                      setValue("isVerified", checked);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="featured">verify this car</Label>
                    <p className="text-sm text-muted-foreground">
                      verify cars appear on the homepage
                    </p>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label
                    htmlFor="images"
                    className={imageError ? "text-red-500" : ""}
                  >
                    Images * {imageError && <span className="text-red-500">({imageError})</span>}
                  </Label>
                  <div className="mt-2">
                    <div
                      {...getMultiImageRootProps()}
                      className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:bg-muted transition ${imageError ? "border-red-500" : "border-border"}`}
                    >
                      <input {...getMultiImageInputProps()} />
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Drag & drop or click to upload multiple images
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          (JPG, PNG, WebP, max 5MB each)
                        </span>
                      </div>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image Previews */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">
                        Uploaded Images ({uploadedImages.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group aspect-square">
                            <Image
                              src={image}
                              alt={`Car image ${index + 1}`}
                              fill
                              className="object-cover rounded-md border"
                              sizes="(max-width: 768px) 100px, 150px"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={addCarLoading}
                >
                  {addCarLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Car...
                    </>
                  ) : (
                    "Add Car"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Car Details Extraction</CardTitle>
              <CardDescription>
                Upload an image of a car and let AI extract its details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-md aspect-video mb-4">
                      <Image
                        src={imagePreview}
                        alt="Car preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                          setUploadedAiImage(null);
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={processWithAI}
                        disabled={processImageLoading}
                        size="sm"
                      >
                        {processImageLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" />
                            Extract Details
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getAiRootProps()}
                    className="cursor-pointer"
                  >
                    <input {...getAiInputProps()} />
                    <div className="flex flex-col items-center justify-center py-8">
                      <Camera className="h-12 w-12 text-muted-foreground mb-3" />
                      <span className="text-sm text-muted-foreground">
                        Drag & drop or click to upload a car image
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        (JPG, PNG, WebP, max 5MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {processImageLoading && (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-md flex items-start">
                  <Loader2 className="animate-spin h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Analyzing image...</p>
                    <p className="text-sm">
                      AI is extracting car details
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">How it works</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
                  <li>Upload a clear image of the car</li>
                  <li>Click "Extract Details" to analyze with AI</li>
                  <li>Review the extracted information</li>
                  <li>Fill in any missing details manually</li>
                  <li>Add the car to your inventory</li>
                </ol>
              </div>

              <div className="bg-amber-50 text-amber-800 p-4 rounded-md mb-12">
                <h3 className="font-medium mb-1">Tips for best results</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Use clear, well-lit images</li>
                  <li>• Try to capture the entire vehicle</li>
                  <li>• For difficult models, use multiple views</li>
                  <li>• Always verify AI-extracted information</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};